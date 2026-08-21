import type { StaticImageData } from "next/image";
import book from "@/assets/images/home-complete/book.png";
import dumbbell from "@/assets/images/home-complete/dumbbell.png";
import target from "@/assets/images/home-complete/target.png";
import waterGlass from "@/assets/images/home-complete/water-glass.png";

/**
 * 项目插画图标（设计稿 draft/首页-全部完成2.png）。
 * key 与 create_project RPC 的 p_icon 白名单一致（00056）；
 * 资产自带彩色圆角底板，渲染时不再叠加底色。
 */
export const HABIT_ICONS: Record<string, { image: StaticImageData; label: string }> = {
  book: { image: book, label: "阅读" },
  dumbbell: { image: dumbbell, label: "锻炼" },
  target: { image: target, label: "团队" },
  water_glass: { image: waterGlass, label: "喝水" },
};

/** 创建表单 / 服务端校验共用白名单 */
export const HABIT_ICON_KEYS = Object.keys(HABIT_ICONS);

/** 项目 icon 字段（创建时选择的 key）→ 插画 */
export function habitIconByKey(key: string | null | undefined): StaticImageData | null {
  return key ? (HABIT_ICONS[key]?.image ?? null) : null;
}

/**
 * 兜底：项目未选图标时按名称关键词匹配（老项目 / 未传 icon）。
 * 不匹配时调用方回退 icon emoji / 默认。
 */
const RULES: { keywords: string[]; key: string }[] = [
  { keywords: ["阅读", "读书", "看书"], key: "book" },
  { keywords: ["锻炼", "运动", "跑步", "健身"], key: "dumbbell" },
  { keywords: ["团队", "目标"], key: "target" },
  { keywords: ["喝水", "饮水", "水杯"], key: "water_glass" },
];

export function matchHabitIcon(title: string): StaticImageData | null {
  const name = title.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => name.includes(k.toLowerCase()))) {
      return HABIT_ICONS[rule.key].image;
    }
  }
  return null;
}
