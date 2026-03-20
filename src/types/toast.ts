import type { useToast } from "@/hooks/useToast"

export type ToastFunction = ReturnType<typeof useToast>["toast"]