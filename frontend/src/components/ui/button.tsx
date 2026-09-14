import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        "bg-primary text-slate-950 font-semibold hover:bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.35)] border border-sky-300 active:scale-[0.98]",
      secondary:
        "bg-surface-container hover:bg-surface-container-high text-slate-100 border border-outline specular-rim active:scale-[0.98]",
      outline:
        "bg-transparent hover:bg-surface-container text-slate-200 border border-outline hover:border-slate-500 specular-rim active:scale-[0.98]",
      ghost:
        "bg-transparent hover:bg-surface-container/60 text-slate-400 hover:text-slate-200 active:scale-[0.98]",
      danger:
        "bg-error/20 hover:bg-error/30 text-rose-300 border border-error/40 shadow-[0_0_16px_rgba(244,63,94,0.2)] active:scale-[0.98]",
    }[variant];

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
      md: "px-4 py-2 text-sm rounded-xl gap-2",
      lg: "px-6 py-3 text-base rounded-xl gap-2.5",
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
