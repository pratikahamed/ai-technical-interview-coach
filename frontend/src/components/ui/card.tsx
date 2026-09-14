import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "active";
}

export function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-surface-container-low border-outline specular-rim",
    subtle: "bg-surface-container-lowest border-outline-variant",
    active:
      "bg-surface-container border-primary specular-rim-strong shadow-[0_0_24px_rgba(56,189,248,0.2)] ring-1 ring-primary",
  }[variant];

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
