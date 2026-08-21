"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * 底部弹窗骨架（遮罩 + 底部面板）：
 * - Esc 关闭、点击遮罩关闭
 * - 焦点圈定：初始聚焦第一个可用控件（无则面板本身）；Tab/Shift+Tab 循环
 *   限制在面板内（排除 disabled / 不可见控件；焦点逸出面板时拉回首尾）
 * - 关闭后焦点恢复到打开前的元素
 * - 打开期间锁定 body 滚动并对背景内容设置 inert（隔离辅助技术与指针）
 * 内容与操作由 children 提供。
 */
export function BottomSheet({
  titleId,
  onClose,
  children,
}: {
  titleId: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  // 父组件重渲染导致 onClose 引用变化时避免重复初始化/恢复
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const panel = panelRef.current;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex='-1'])",
        ) ?? [],
      ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);

    const firstFocusable = focusables()[0];
    if (firstFocusable) firstFocusable.focus();
    else panel?.focus();

    // 锁定背景滚动 + 隔离背景内容：
    // 从弹窗根节点向上走到 body，对路径上每层的"兄弟节点"设置 inert
    // （弹窗与页面背景同处一个页面子树，仅处理 body 直接子级无法覆盖背景）
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const inerted: HTMLElement[] = [];
    let node: HTMLElement | null = rootRef.current;
    while (node && node !== document.body) {
      const current: HTMLElement = node;
      const parent = current.parentElement;
      if (parent) {
        Array.from(parent.children).forEach((sibling) => {
          if (
            sibling instanceof HTMLElement &&
            sibling !== current &&
            !sibling.hasAttribute("inert")
          ) {
            sibling.setAttribute("inert", "");
            inerted.push(sibling);
          }
        });
      }
      node = parent;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!panel.contains(document.activeElement)) {
        // 焦点逸出到面板外：拉回循环内
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      inerted.forEach((el) => el.removeAttribute("inert"));
      previouslyFocused.current?.focus();
    };
  }, []);

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 flex justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute bottom-0 left-1/2 max-h-[100dvh] w-full max-w-[430px] -translate-x-1/2 overflow-y-auto rounded-t-[24px] bg-white p-5 pb-8 outline-none"
      >
        {children}
      </div>
    </div>
  );
}

/** 弹窗头部：把手 + 关闭按钮 + 居中标题（须置于 BottomSheet 内） */
export function SheetHeader({
  titleId,
  title,
  onClose,
}: {
  titleId: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <>
      <div className="mx-auto h-1.5 w-10 rounded-full bg-[#E5E7EB]" />
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[var(--color-text-secondary)]"
        >
          <X size={20} />
        </button>
        <h3
          id={titleId}
          className="text-[17px] font-bold text-[var(--color-text-primary-2)]"
        >
          {title}
        </h3>
        <span className="w-10" />
      </div>
    </>
  );
}
