# -*- coding: utf-8 -*-
import io
p = 'src/lib/home-data.ts'
s = io.open(p, encoding='utf-8').read()

old_head = '''export type { RewardMode } from "@/lib/reward";
import type { RewardMode } from "@/lib/reward";'''
new_head = '''export type { RewardMode } from "@/lib/reward";
import type { RewardMode } from "@/lib/reward";
import type { Database } from "@/utils/supabase/types";

/** 生成类型的 RPC 返回元素（列/枚举漂移直接编译失败，不手写合同） */
type Db = Database["public"];
type ProfileRow = Db["Functions"]["get_my_profile"]["Returns"][number];
type ProjectSummaryRow =
  Db["Functions"]["get_visible_project_summaries"]["Returns"][number];
type TodayStatusRow =
  Db["Functions"]["get_today_checkin_status"]["Returns"][number];'''
assert old_head in s
s = s.replace(old_head, new_head)

start = s.find('  // 返回集合的 RPC 经 .rpc() 调用，行结构在边界处用显式类型对齐生成类型。')
end = s.find('  // 并行拉取 profile + 项目列表 + 今日打卡状态')
assert start >= 0 and end > start
s = s[:start] + '  // 行类型已在文件头从生成的 Database 类型提取\n\n' + s[end:]

s = s.replace('const profileRow = profileRes.data as ProfileRow | null;',
              'const profileRow = profileRes.data;')
s = s.replace('const todayRows = ((todayRes.data ?? []) as TodayStatusRow[]).filter(',
              'const todayRows = (todayRes.data ?? []).filter(')
s = s.replace('((projectsRes.data ?? []) as ProjectSummaryRow[]).map((p) => [p.id, p]),',
              '(projectsRes.data ?? []).map((p) => [p.id, p]),')
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('ok')
