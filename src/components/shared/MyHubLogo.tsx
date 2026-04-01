import { cn } from "@/lib/utils"

interface MyHubLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function MyHubLogo({ className, size = "md" }: MyHubLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-xl",
    lg: "w-16 h-16 text-2xl"
  }

  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-active text-white font-bold shadow-lg shrink-0",
        sizeClasses[size],
        className
      )}
    >
      M
    </div>
  )
}
