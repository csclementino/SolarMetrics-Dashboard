import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "error" | "default"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-status-success/15 text-status-success": variant === "success",
          "bg-status-warning/15 text-status-warning": variant === "warning",
          "bg-status-error/15 text-status-error": variant === "error",
          "bg-surface-section text-text-secondary": variant === "default",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
