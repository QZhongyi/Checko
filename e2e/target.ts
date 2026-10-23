import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * E2E 数据库通道：目标锁定 + 秘密不进 argv。
 *
 * - E2E_TEST_PASSWORD 必须显式设置（≥8 可打印字符），缺失即全部用例失败
 * - ALLOW_PRODUCTION_E2E=1 显式 opt-in，每次 psql 前检查
 * - 目标锁定（new URL 严格解析，三方一致才放行）：
 *   host 必须是 db.<ref>.supabase.co 或 *.pooler.supabase.com
 *   （pooler 的 ref 取自用户名 postgres.<ref>）；数据库名必须是 postgres；
 *   DB ref == info.txt Project ID == .env.local NEXT_PUBLIC_SUPABASE_URL ref
 * - 连接密码经 PGPASSWORD 环境变量（docker exec -e 只传变量名）；SQL 经 stdin
 */

export const E2E_EMAIL_A = "e2e-a@local.test";
export const E2E_EMAIL_B = "e2e-b@local.test";

export function requireE2ePassword(): string {
  const pwd = process.env.E2E_TEST_PASSWORD;
  if (!pwd || pwd.length < 8 || !/^[\x20-\x7e]+$/.test(pwd)) {
    throw new Error("E2E_TEST_PASSWORD 未设置、少于 8 字符或含不可打印字符。");
  }
  return pwd;
}

export function requireProductionOptIn(): void {
  if (process.env.ALLOW_PRODUCTION_E2E !== "1") {
    throw new Error("E2E 默认拒绝操作生产库。设置 ALLOW_PRODUCTION_E2E=1。");
  }
}

type DbTarget = {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
  ref: string;
};

function readInfoFile(): { dbUrl: string; projectId: string } {
  const content = readFileSync(join(__dirname, "..", "..", "supabase", "info.txt"), "utf-8");
  const dbUrl = content.match(/^Database URL:[ \t]*(\S+)/im)?.[1];
  const projectId = content.match(/^Project ID:[ \t]*(\S+)/im)?.[1];
  if (!dbUrl || !projectId) {
    throw new Error("info.txt 缺少 Database URL 或 Project ID。");
  }
  return { dbUrl, projectId };
}

function getFrontendProjectRef(): string {
  const content = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
  const raw = content.match(/^NEXT_PUBLIC_SUPABASE_URL=(\S+)/m)?.[1];
  if (!raw) {
    throw new Error(".env.local 缺少 NEXT_PUBLIC_SUPABASE_URL。");
  }
  const host = new URL(raw).hostname;
  const m = host.match(/^([a-z0-9]+)\.supabase\.co$/);
  if (!m) {
    throw new Error(`前端 Supabase URL host 非预期形态：${host}`);
  }
  return m[1];
}

/** 严格解析 DB URL 并做三方比对；任何一项不符即抛错 */
function parseDbTarget(): DbTarget {
  const { dbUrl, projectId } = readInfoFile();
  let u: URL;
  try {
    u = new URL(dbUrl);
  } catch {
    throw new Error("Database URL 无法解析（协议/形态非法）。");
  }
  if (u.protocol !== "postgresql:" && u.protocol !== "postgres:") {
    throw new Error(`非 postgres 协议：${u.protocol}`);
  }
  if (u.pathname.replace(/^\//, "") !== "postgres") {
    throw new Error(`数据库名非 postgres：${u.pathname}`);
  }
  if (/%/.test(u.password)) {
    throw new Error("连接密码含 %（URL 编码歧义）。请更新 info.txt 密码。");
  }

  let ref: string;
  const direct = u.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
  const pooler = u.hostname.endsWith(".pooler.supabase.com");
  if (direct) {
    ref = direct[1];
  } else if (pooler) {
    const m = decodeURIComponent(u.username).match(/^postgres\.([a-z0-9]+)$/);
    if (!m) {
      throw new Error(`pooler 用户名非 postgres.<ref> 形态：${u.username}`);
    }
    ref = m[1];
  } else {
    throw new Error(`非 Supabase 托管 host：${u.hostname}`);
  }

  if (ref !== projectId) {
    throw new Error(`目标不一致：DB ref=${ref}，info.txt Project ID=${projectId}。`);
  }
  const feRef = getFrontendProjectRef();
  if (ref !== feRef) {
    throw new Error(`目标不一致：DB ref=${ref}，前端 ref=${feRef}。`);
  }

  // host/user 会进入 shell 命令字符串：限定字符集，杜绝元字符注入
  const user = decodeURIComponent(u.username);
  if (!/^[A-Za-z0-9._]+$/.test(user)) {
    throw new Error(`DB 用户名含非法字符：${user}`);
  }
  if (!/^[A-Za-z0-9.-]+$/.test(u.hostname)) {
    throw new Error(`DB host 含非法字符：${u.hostname}`);
  }

  return {
    host: u.hostname,
    port: u.port || "5432",
    user,
    password: decodeURIComponent(u.password),
    database: "postgres",
    ref,
  };
}

let cachedTarget: DbTarget | null = null;
function getDbTarget(): DbTarget {
  return (cachedTarget ??= parseDbTarget());
}

function dockerPsqlArgs(t: DbTarget): string[] {
  // -e PGPASSWORD 只传变量名：值从 docker client 自身环境读取，不进宿主 argv
  return [
    "exec", "-i", "-e", "PGPASSWORD", "dailycheck-pg", "psql",
    "-h", t.host, "-p", t.port, "-U", t.user, "-d", t.database,
    "-v", "ON_ERROR_STOP=1", "-Atq",
  ];
}

/** 同步执行 SQL（stdin）。目标校验进程内缓存一次，opt-in 每次检查。
 * 连接建立类瞬断（stderr 匹配 "connection to server ... failed"，如 pooler
 * SSL eof / connection refused）自动重试 2 次、间隔 1s；SQL 错误
 * （ON_ERROR_STOP）是测试合法失败信号，重试会掩盖假通过，不重试——
 * 语句执行中途断连的 stderr 是别的形态，恰好落入不重试侧。 */
export function psql(sql: string): string {
  requireProductionOptIn();
  const t = getDbTarget();
  const cmd = `docker ${dockerPsqlArgs(t).join(" ")}`;
  for (let attempt = 0; ; attempt++) {
    try {
      return execSync(cmd, {
        input: sql,
        encoding: "utf-8",
        shell: "bash",
        env: { ...process.env, PGPASSWORD: t.password },
      }).trim();
    } catch (err) {
      const stderr = String((err as { stderr?: string | Buffer }).stderr ?? "");
      if (attempt >= 2 || !/connection to server .* failed/.test(stderr)) throw err;
      console.warn(`[e2e] psql 连接建立失败，重试 ${attempt + 1}/2：${stderr.trim()}`);
      // 同步等待（Atomics.wait），保持 psql 同步语义
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
    }
  }
}
