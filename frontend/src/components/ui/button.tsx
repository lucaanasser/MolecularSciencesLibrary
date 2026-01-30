import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  `inline-flex 
    items-center justify-center 
    gap-2
    whitespace-nowrap
    rounded-2xl 
    font-semibold
    duration-300
    transition-transform
    hover:scale-105
    hover:shadow-lg`,
  {
    variants: {
      variant: {
        default: 
          "text-default-foreground",
        primary:
          "bg-primary text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground",
        destructive:
          "bg-destructive text-destructive-foreground",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground",
        wide: 
          "bg-primary text-primary-foreground w-full rounded-xl",
      },
      size: {
        default: "h-10 px-4 py-2 text-lg",
        sm: "h-9 px-3 text-md",
        lg: "h-11 px-8 text-2xl",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
