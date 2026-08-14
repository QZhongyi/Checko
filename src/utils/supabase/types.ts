/**
 * Supabase 数据库类型占位。
 *
 * 后续用 Supabase CLI 从已部署的云端 schema 生成强类型：
 *   supabase gen types typescript --project-id <ref> > src/utils/supabase/database.types.ts
 * 然后把这里的占位改为 `export type Database = ...` 从生成文件 re-export。
 *
 * 当前阶段（最小脚手架 + Auth 打通）只用到 auth 模块，没有业务表读写，
 * 所以用 any 不影响实际安全；接入业务表前必须替换为生成结果。
 */
export type Database = unknown;
