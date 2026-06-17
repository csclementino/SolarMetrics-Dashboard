import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "darkCta" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-action-primary text-[#1A1A1A] hover:bg-action-hover rounded-[24px]": variant === "primary",
            "bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] hover:opacity-90 rounded-full": variant === "darkCta",
            "border border-text-muted bg-transparent hover:bg-surface-section text-text-primary rounded-[24px]": variant === "outline",
            "hover:bg-surface-section text-text-primary rounded-[24px]": variant === "ghost",
            "h-14 px-8 py-4 text-base": size === "default",
            "h-9 px-4 text-sm": size === "sm",
            "h-16 px-10 text-lg": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
