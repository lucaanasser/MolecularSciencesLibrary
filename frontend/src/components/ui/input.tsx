import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, children, ...props }, ref) => {
    const isCheckbox = type === "checkbox";
    if (isCheckbox) {
      return (
        <Label htmlFor={props.id} className="inline-flex items-center gap-2 cursor-pointer select-none align-middle">
          <input
            id={props.id}
            type="checkbox"
            ref={ref}
            className="sr-only peer"
            {...props}
          />
          <span
            className={cn(
              "h-6 w-6 box-border rounded-lg border border-input bg-background flex items-center justify-center transition-all duration-150 peer-checked:bg-gray-400",
              className
            )}
          >
            <Check className="w-4 h-4 text-white hidden peer-checked:inline" />
          </span>
          {children && (
            <span className="leading-5 min-h-5">{children}</span>
          )}
        </Label>
      );
    }
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border prose-sm px-3 py-2 mb-4 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{
          backgroundColor: 'var(--input-background)',
          borderColor: 'var(--input-foreground)',
          color: 'var(--input-foreground)'
        }}
        ref={ref}
        {...props}
      />
    );
  }
  );
Input.displayName = "Input"

export { Input }
