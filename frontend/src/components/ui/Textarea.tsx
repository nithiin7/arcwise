import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  bordered?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ bordered = true, style, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        style={{
          width: "100%",
          color: "var(--color-text)",
          fontSize: 15,
          lineHeight: 1.6,
          fontFamily: "inherit",
          outline: "none",
          resize: "none",
          ...(bordered
            ? {
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
              }
            : {
                background: "transparent",
                border: "none",
              }),
          ...style,
        }}
      />
    );
  }
);
