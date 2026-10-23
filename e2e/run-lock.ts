import { psql, requireProductionOptIn } from "./target";

/**
 * E2E run 跨进程互斥（00065 锁表行级 INSERT）。
 * 合同（与 supabase/_lib_target_lock.sh 一致）：
 * - acquire = 单事务清陈旧行（>10 分钟）+ insert；unique 冲突 = 被持有
 * - release = delete 自己 token 的行
 * - 锁行 insert 与 delete 必须分属不同事务（同事务净效果无行，互斥失效）
 */

const E2E_RUN_LOCK_KEY = 987654321;
let lockToken = "";

export function acquireRunLock(): void {
  requireProductionOptIn();
  lockToken = `e2e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    psql(`
begin;
delete from public.e2e_run_lock
where lock_key = ${E2E_RUN_LOCK_KEY} and acquired_at < now() - interval '10 minutes';
insert into public.e2e_run_lock (lock_key, run_token) values (${E2E_RUN_LOCK_KEY}, '${lockToken}');
commit;
`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/duplicate key|unique constraint/i.test(msg)) {
      throw new Error(
        "另一个 E2E run 正在运行（e2e_run_lock 被持有）。请等待其完成；崩溃残留的锁 10 分钟后自动过期。",
      );
    }
    throw e;
  }
}

/** 释放失败直接上抛（使本次 run 失败），残留锁由下次 acquire 清理 */
export function releaseRunLock(): void {
  if (!lockToken) return;
  const token = lockToken;
  lockToken = "";
  psql(`delete from public.e2e_run_lock where lock_key = ${E2E_RUN_LOCK_KEY} and run_token = '${token}';`);
}
