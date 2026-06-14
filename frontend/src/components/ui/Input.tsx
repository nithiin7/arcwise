import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ style, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          padding: "8px 12px",
          color: "var(--color-text)",
          fontSize: 13,
          fontFamily: "inherit",
          outline: "none",
          ...style,
        }}
      />
    );
  }
);
