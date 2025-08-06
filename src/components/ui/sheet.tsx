import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

// Context for managing sheet state
interface SheetContextValue {
  onOpenChange: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right"
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const Sheet: React.FC<SheetProps> = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <SheetContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={() => onOpenChange(false)}
        />
        {children}
      </div>
    </SheetContext.Provider>
  )
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", size = "md", className, children, ...props }, ref) => {
    const sizeClasses = {
      sm: "max-w-sm",
      md: "max-w-md", 
      lg: "max-w-lg",
      xl: "max-w-xl",
      full: "max-w-full"
    }

    const sideClasses = {
      top: "top-0 left-0 right-0 h-auto animate-in slide-in-from-top",
      bottom: "bottom-0 left-0 right-0 h-auto animate-in slide-in-from-bottom",
      left: "left-0 top-0 bottom-0 w-full animate-in slide-in-from-left",
      right: "right-0 top-0 bottom-0 w-full animate-in slide-in-from-right"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed z-50 bg-background p-6 shadow-lg border-l flex flex-col",
          sideClasses[side],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SheetContent.displayName = "SheetContent"

const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
      {...props}
    />
  )
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef<HTMLHeadingElement, SheetTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
)
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<HTMLParagraphElement, SheetDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
SheetDescription.displayName = "SheetDescription"

const SheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const context = React.useContext(SheetContext)
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e)
    }
    if (context) {
      context.onOpenChange(false)
    }
  }

  return (
    <button
      ref={ref}
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
})
SheetClose.displayName = "SheetClose"

export {
  Sheet,
  SheetContent,
  SheetHeader,  
  SheetTitle,
  SheetDescription,
  SheetClose
}
