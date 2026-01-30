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
      h-4 w-4
      rounded-sm
      border border-gray-700
      `,
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        `flex 
        items-center 
        justify-center 
        text-current`)}
    >
      <Check className="h-4 w-4 gray-700" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
