"use client"

import { cn } from "@/lib/utils"
import { useCalendarStore } from "@/hooks/useCalendarStore"
import type { CalendarCategory } from "@/types/calendario"

export function CategoryFilter() {
    const { categories, categoryFilter, toggleCategoryFilter } = useCalendarStore()

    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat: CalendarCategory) => {
                const isHidden = categoryFilter.includes(cat.id)
                return (
                    <button
                        key={cat.id}
                        onClick={() => toggleCategoryFilter(cat.id)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-medium transition-all",
                            isHidden
                                ? "opacity-40 bg-foreground/5 text-muted"
                                : "text-foreground bg-foreground/5 hover:bg-foreground/10"
                        )}
                    >
                        <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                    </button>
                )
            })}
        </div>
    )
}
