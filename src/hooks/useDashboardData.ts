import { useQuery } from "@tanstack/react-query"
import { getDashboardEvents } from "@/lib/firebase/dashboard"
import { getNotes } from "@/lib/firebase/anotacoes"

export function useDashboardData(userId: string | undefined) {
  // Fetch Events
  const eventsQuery = useQuery({
    queryKey: ["dashboard", "events", userId],
    queryFn: () => getDashboardEvents(userId!),
    enabled: !!userId,
  })

  // Fetch Notes
  const notesQuery = useQuery({
    queryKey: ["dashboard", "notes", userId],
    queryFn: async () => {
      const notes = await getNotes(userId!)
      return notes.slice(0, 5)
    },
    enabled: !!userId,
  })

  return {
    events: eventsQuery.data || [],
    notes: notesQuery.data || [],
    isLoading: eventsQuery.isLoading || notesQuery.isLoading,
    isError: eventsQuery.isError || notesQuery.isError,
    refetch: async () => {
      await Promise.all([eventsQuery.refetch(), notesQuery.refetch()])
    }
  }
}
