# -*- coding: utf-8 -*-
import io

# home-hero：火焰（active/debt/completed 三态 emoji）
p = u"src/components/home/home-hero.tsx"
s = io.open(p, encoding="utf-8").read()
old = u'''          <IllustrationPlaceholder
            label={
              variant === "debt"
                ? "火焰\\n疲惫"
                : variant === "completed"
                  ? "火焰\\n开心"
                  : "火焰\\n活跃"
            }
            className="h-[100px] w-[100px]"
          />'''
new = u'''          <IllustrationPlaceholder
            label="火焰角色"
            emoji={variant === "debt" ? "💨" : variant === "completed" ? "🎉" : "🔥"}
            tone={variant === "debt" ? "neutral" : "warm"}
            className="h-[100px] w-[100px] text-[52px]"
          />'''
assert old in s
s = s.replace(old, new)
io.open(p, "w", encoding="utf-8", newline="").write(s)

# header：太阳
p = u"src/components/home/header.tsx"
s = io.open(p, encoding="utf-8").read()
old = u'''          <IllustrationPlaceholder
            label="☀"
            shape="circle"
            className="h-8 w-8"
          />'''
new = u'''          <IllustrationPlaceholder
            label="太阳"
            emoji="☀️"
            shape="circle"
            tone="warm"
            className="h-8 w-8 text-[18px]"
          />'''
assert old in s
s = s.replace(old, new)
io.open(p, "w", encoding="utf-8", newline="").write(s)

# empty-state：植物
p = u"src/components/home/empty-state.tsx"
s = io.open(p, encoding="utf-8").read()
old = u'''      <IllustrationPlaceholder
        label="空状态插画 260 × 270"
        className="h-[270px] w-[260px]"
      />'''
new = u'''      <IllustrationPlaceholder
        label="空状态插画"
        emoji="🌱"
        className="h-[270px] w-[260px] text-[96px]"
      />'''
assert old in s
s = s.replace(old, new)
io.open(p, "w", encoding="utf-8", newline="").write(s)

# habit-card：项目图标（P2-1 一并接通 icon/color）
p = u"src/components/home/habit-card.tsx"
s = io.open(p, encoding="utf-8").read()
old = u'''      <IllustrationPlaceholder
        label={habit.title.slice(0, 4) || "项目"}
        className="h-[68px] w-[68px] shrink-0 rounded-2xl"
      />'''
new = u'''      <span
        aria-hidden
        className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl text-[34px] shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)]"
        style={{
          background: "linear-gradient(160deg, #F7FAF8, #EFF3F1)",
          border: "1px solid rgba(0,0,0,0.03)",
        }}
      >
        {habit.icon ?? "📝"}
      </span>'''
assert old in s
s = s.replace(old, new)
io.open(p, "w", encoding="utf-8", newline="").write(s)
print("ok")
