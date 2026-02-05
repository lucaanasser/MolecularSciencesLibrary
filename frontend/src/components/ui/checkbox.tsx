import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      `shrink-0
      flex items-center justify-center 
      aspect-square 
      min-w-0 min-h-0 w-[1.5em] 
      rounded-md 
      border border-black`,
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        `flex items-center justify-center text-current w-full h-full`)}
    >
      <Check className="aspect-squarew-[1em]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
