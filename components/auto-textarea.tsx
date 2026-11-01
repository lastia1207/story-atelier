"use client";

import { useEffect, useRef, type TextareaHTMLAttributes } from "react";

/**
 * A textarea that grows with its content and soft-wraps, so long text always
 * stays fully visible (it flows onto new lines instead of being cut off).
 */
export function AutoTextarea({
  value,
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      wrap="soft"
      className={`resize-none overflow-hidden ${className}`}
      {...rest}
    />
  );
}