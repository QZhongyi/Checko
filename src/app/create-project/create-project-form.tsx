"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  Pencil,
  Coins,
  HandCoins,
  CalendarCheck,
  Loader2,
  UserRound,
  UsersRound,
  Target,
} from "lucide-react";
import {
  createProject,
  type CreateProjectFormState,
} from "@/app/create-project/actions";
import { AuthInput } from "@/components/auth-input";
import { HABIT_ICONS } from "@/components/home/habit-icons";

export function CreateProjectForm() {
  const [state, action, pending] = useActionState<
    CreateProjectFormState,
    FormData
  >(createProject, undefined);

  // 项目图标：空 = 未选择（首页按名称关键词兜底匹配）
  const [icon, setIcon] = useState("");

  // 项目类型：personal 个人 / group 多人（多人需再选打卡模式）
  const [projectType, setProjectType] = useState<"personal" | "group">(
    "personal",
  );
  const [checkinMode, setCheckinMode] = useState<"any_one" | "all" | "">("");

  // 任务类型：infinite 长期习惯 / finite 有限次挑战（个人与多人）
  const [taskScope, setTaskScope] = useState<"infinite" | "finite">(
    "infinite",
  );

  // 奖励方式（仅个人项目；completed 仅有限次，切回无限次自动回落）
  const [rewardMode, setRewardMode] = useState<
    "every_time" | "every_n" | "completed"
  >("every_time");

  return (
    <form action={action} className="flex flex-col">
      {/* 金额语义说明（AuthInput 无 label，用副标题代替） */}
      <p className="mb-4 text-xs leading-5 text-[var(--color-text-secondary)]">
        完成每日打卡获得奖励金额，漏卡扣除惩罚金额（单位：金币）
      </p>

      {/* 输入框 1：项目名称（1-30 字，原生 maxLength 防超长提交触发表单重置） */}
      <AuthInput
        name="name"
        type="text"
        placeholder="项目名称（1-30 字）"
        label="项目名称"
        maxLength={30}
        icon={<Pencil size={24} />}
      />

      <div className="h-4" />

      {/* 项目图标选择（插画资产自带彩色底板） */}
      <div className="flex h-auto w-full flex-col gap-2 rounded-2xl border border-line bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.025)]">
        <span className="text-sm text-[var(--color-text-secondary)]">
          项目图标
        </span>
        <input type="hidden" name="icon" value={icon} />
        <div className="flex items-center gap-2 py-1">
          <IconOption
            selected={icon === ""}
            onSelect={() => setIcon("")}
            ariaLabel="默认图标"
          >
            <span className="text-[26px] leading-none">📝</span>
          </IconOption>
          {Object.entries(HABIT_ICONS).map(([key, { image, label }]) => (
            <IconOption
              key={key}
              selected={icon === key}
              onSelect={() => setIcon(key)}
              ariaLabel={`${label}图标`}
            >
              <Image src={image} alt="" width={34} height={34} />
            </IconOption>
          ))}
        </div>
      </div>

      <div className="h-4" />

      {/* 项目类型：个人 / 多人 */}
      <div className="flex h-auto w-full flex-col gap-2 rounded-2xl border border-line bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.025)]">
        <span className="text-sm text-[var(--color-text-secondary)]">
          项目类型
        </span>
        <input type="hidden" name="projectType" value={projectType} />
        <div className="flex items-center gap-2 py-1">
          <TypeOption
            selected={projectType === "personal"}
            onSelect={() => setProjectType("personal")}
            icon={<UserRound size={22} />}
            title="个人项目"
            desc="自己打卡"
          />
          <TypeOption
            selected={projectType === "group"}
            onSelect={() => setProjectType("group")}
            icon={<UsersRound size={22} />}
            title="多人项目"
            desc="邀请好友"
          />
        </div>
        {projectType === "group" ? (
          <div className="flex flex-col gap-2 border-t border-line pt-3">
            <input type="hidden" name="checkinMode" value={checkinMode} />
            <ModeOption
              selected={checkinMode === "any_one"}
              onSelect={() => setCheckinMode("any_one")}
              title="任意一人打卡即可"
              desc="适合家庭场景，如「每日做饭」"
            />
            <ModeOption
              selected={checkinMode === "all"}
              onSelect={() => setCheckinMode("all")}
              title="全员完成才算打卡"
              desc="适合团队监督，如「团队学习」"
            />
            <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
              多人项目从明天开始，创建后可邀请好友（含你最多 10 人）
            </p>
          </div>
        ) : null}
      </div>

      <div className="h-4" />

      {/* 任务类型：无限次 / 有限次（个人与多人；多人×有限次 = 团队完成 N 天达标，批次 3） */}
      <div className="flex h-auto w-full flex-col gap-2 rounded-2xl border border-line bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.025)]">
        <span className="text-sm text-[var(--color-text-secondary)]">
          任务类型
        </span>
        <div className="flex flex-col gap-2">
          <ModeOption
            selected={taskScope === "infinite"}
            onSelect={() => {
              setTaskScope("infinite");
              // 完成时奖励仅限有限次任务，切回无限次自动回落
              setRewardMode((m) => (m === "completed" ? "every_time" : m));
            }}
            title="无限次任务"
            desc="长期习惯，如「每日运动」"
          />
          <ModeOption
            selected={taskScope === "finite"}
            onSelect={() => setTaskScope("finite")}
            title="有限次任务"
            desc={
              projectType === "group"
                ? "团队完成 N 天后项目达标，如「21 天亲子运动」"
                : "明确目标的挑战，如「30 天阅读挑战」"
            }
          />
        </div>
        {taskScope === "finite" ? (
          <div className="flex flex-col gap-2 border-t border-line pt-3">
            <AuthInput
              name="targetCount"
              type="number"
              placeholder="目标次数，如：30"
              label={
                projectType === "group"
                  ? "目标天数（团队累计完成 N 天后项目自动完成）"
                  : "目标次数（完成全部目标后项目自动完成）"
              }
              min={2}
              max={999}
              icon={<Target size={24} />}
            />
            {projectType === "group" ? (
              <AuthInput
                name="budgetAmount"
                type="number"
                placeholder="奖励池总预算，如：8（可选）"
                label="奖励池总预算（可选，整个项目最多发放的金币，超支按剩余额发放）"
                min={1}
                max={999}
                icon={<Coins size={24} />}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="h-4" />

      {projectType === "personal" ? (
        <>
          {/* 奖励方式：每次 / 每 N 次 / 完成时（仅个人项目；与 RPC 00083 矩阵一致） */}
          <div className="flex h-auto w-full flex-col gap-2 rounded-2xl border border-line bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.025)]">
            <span className="text-sm text-[var(--color-text-secondary)]">
              奖励方式
            </span>
            <input type="hidden" name="rewardMode" value={rewardMode} />
            <div className="flex flex-col gap-2">
              <ModeOption
                selected={rewardMode === "every_time"}
                onSelect={() => setRewardMode("every_time")}
                title="每次打卡奖励"
                desc="当天打卡成功即时发放"
              />
              <ModeOption
                selected={rewardMode === "every_n"}
                onSelect={() => setRewardMode("every_n")}
                title="每 N 次打卡奖励"
                desc="攒够 N 次发一次里程碑奖励"
              />
              {taskScope === "finite" ? (
                <ModeOption
                  selected={rewardMode === "completed"}
                  onSelect={() => setRewardMode("completed")}
                  title="完成时奖励"
                  desc="达成全部目标后一次性发放"
                />
              ) : null}
            </div>
            {rewardMode === "every_n" ? (
              <div className="flex flex-col gap-2 border-t border-line pt-3">
                <AuthInput
                  name="rewardNValue"
                  type="number"
                  placeholder="每 N 次发放，如：7"
                  label="N 值（每完成 N 次打卡发一次奖励）"
                  min={2}
                  max={999}
                  icon={<Target size={24} />}
                />
              </div>
            ) : null}
          </div>

          <div className="h-4" />
        </>
      ) : null}

      {/* 输入框 2：奖励金额（必填，原生 min/max 与服务端校验同规则）；
          group 项目语义 = 每次完成结算的团队总池（00071 映射）；
          个人项目金额语义随奖励方式变化（每次 / 每里程碑 / 完成时总额） */}
      <AuthInput
        name="rewardAmount"
        type="number"
        placeholder={
          projectType === "group"
            ? "团队奖励池，如：5"
            : rewardMode === "every_n"
              ? "每 N 次发放的金币，如：5"
              : rewardMode === "completed"
                ? "完成时总奖励，如：30"
                : "奖励金额，如：5"
        }
        label={
          projectType === "group"
            ? "团队奖励池（每次完成结算的总金币，团队平分）"
            : rewardMode === "every_n"
              ? "奖励金额（每 N 次打卡发放的金币）"
              : rewardMode === "completed"
                ? "完成时总奖励（达成全部目标后一次性发放的金币）"
                : "奖励金额（每次打卡奖励的金币）"
        }
        min={0}
        max={999}
        icon={<Coins size={24} />}
      />

      <div className="h-4" />

      {/* 输入框 3：惩罚金额（默认 0，与 RPC p_penalty_amount default 0 一致） */}
      <AuthInput
        name="penaltyAmount"
        type="number"
        placeholder="惩罚金额（默认 0）"
        label="惩罚金额（缺卡一天扣除的金币）"
        defaultValue="0"
        min={0}
        max={999}
        icon={<HandCoins size={24} />}
      />

      <div className="h-4" />

      {/* 频率：v1-v4 固定"每日"，静态展示不可交互 */}
      <div className="flex h-14 w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 shadow-[0_2px_8px_rgba(0,0,0,0.025)]">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-primary)]"
          style={{ background: "var(--color-brand-icon-bg)" }}
        >
          <CalendarCheck size={24} />
        </span>
        <span className="flex-1 text-base font-normal leading-[22px] text-[var(--color-text-primary)]">
          每日打卡
        </span>
        <span className="text-sm text-[var(--color-text-secondary)]">固定</span>
      </div>

      {/* 错误提示 */}
      {state?.error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="mt-6" />

      {/* 创建按钮（与登录按钮同规格） */}
      <button
        type="submit"
        disabled={pending}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-[28px] text-lg font-semibold leading-6 text-white shadow-[0_8px_20px_rgba(34,197,94,0.15)] transition active:scale-[0.98] disabled:opacity-60"
        style={{
          background:
            "linear-gradient(90deg, var(--color-primary), var(--color-primary-bright))",
        }}
      >
        {pending && <Loader2 size={20} className="animate-spin" />}
        {pending ? "创建中…" : "创建项目"}
      </button>
    </form>
  );
}

/** 图标选项按钮（原生按钮语义 + aria-pressed，选中态高亮） */
function IconOption({
  selected,
  onSelect,
  ariaLabel,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={ariaLabel}
      aria-pressed={selected}
      className={`flex h-12 w-12 items-center justify-center rounded-2xl transition active:scale-95 ${
        selected
          ? "bg-[var(--color-brand-icon-bg)] ring-2 ring-[var(--color-primary)]"
          : "bg-[#F5F6F8]"
      }`}
    >
      {children}
    </button>
  );
}

/** 项目类型选项（个人 / 多人） */
function TypeOption({
  selected,
  onSelect,
  icon,
  title,
  desc,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex flex-1 items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left transition active:scale-[0.98] ${
        selected
          ? "bg-[var(--color-brand-icon-bg)] ring-2 ring-[var(--color-primary)]"
          : "bg-[#F5F6F8]"
      }`}
    >
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--color-primary)]"
      >
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-medium leading-5 text-[var(--color-text-primary)]">
          {title}
        </span>
        <span className="text-xs leading-4 text-[var(--color-text-secondary)]">
          {desc}
        </span>
      </span>
    </button>
  );
}

/** 打卡模式选项（任意一人 / 全员完成） */
function ModeOption({
  selected,
  onSelect,
  title,
  desc,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left transition active:scale-[0.98] ${
        selected
          ? "bg-[var(--color-brand-icon-bg)] ring-2 ring-[var(--color-primary)]"
          : "bg-[#F5F6F8]"
      }`}
    >
      <span
        aria-hidden
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
            : "border-[#C9CEDB] bg-white"
        }`}
      >
        {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-medium leading-5 text-[var(--color-text-primary)]">
          {title}
        </span>
        <span className="text-xs leading-4 text-[var(--color-text-secondary)]">
          {desc}
        </span>
      </span>
    </button>
  );
}
