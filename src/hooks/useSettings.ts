import { create } from "zustand"
import { persist } from "zustand/middleware"
import { UserSettings, DEFAULT_USER_SETTINGS } from "@/types/settings"
import { getUserSettings, saveUserSettings } from "@/lib/firebase/settings"

interface SettingsState {
  settings: UserSettings
  loading: boolean
  error: string | null

  // Ações
  loadSettings: (userId: string) => Promise<void>
  updateSettings: (userId: string, partial: Partial<UserSettings>) => Promise<void>
  updateProfile: (userId: string, profile: Partial<UserSettings["profile"]>) => Promise<void>
  updateAppearance: (userId: string, appearance: Partial<UserSettings["appearance"]>) => Promise<void>
  updatePomodoro: (userId: string, pomodoro: Partial<UserSettings["pomodoro"]>) => Promise<void>
  updateBehavior: (userId: string, behavior: Partial<UserSettings["behavior"]>) => Promise<void>
  updateEntertainment: (userId: string, entertainment: Partial<UserSettings["entertainment"]>) => Promise<void>
  resetSettings: () => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_USER_SETTINGS,
      loading: true,
      error: null,

      loadSettings: async (userId: string) => {
        set({ loading: true, error: null })
        try {
          const fbSettings = await getUserSettings(userId)
          set({
            settings: {
              ...DEFAULT_USER_SETTINGS,
              ...fbSettings,
              profile: { ...DEFAULT_USER_SETTINGS.profile, ...(fbSettings.profile || {}) },
              appearance: { ...DEFAULT_USER_SETTINGS.appearance, ...(fbSettings.appearance || {}) },
              pomodoro: { ...DEFAULT_USER_SETTINGS.pomodoro, ...(fbSettings.pomodoro || {}) },
              behavior: { ...DEFAULT_USER_SETTINGS.behavior, ...(fbSettings.behavior || {}) },
              entertainment: { ...DEFAULT_USER_SETTINGS.entertainment, ...(fbSettings.entertainment || {}) },
            },
            loading: false
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          set({ error: errorMessage, loading: false })
        }
      },

      updateSettings: async (userId: string, partial: Partial<UserSettings>) => {
        const current = get().settings
        const newSettings = { ...current, ...partial }

        // UI Otimista
        set({ settings: newSettings })

        const { error } = await saveUserSettings(userId, partial)
        if (error) {
          set({ settings: current, error })
        }
      },

      updateProfile: async (userId: string, profile) => {
        const current = get().settings
        const newProfile = { ...current.profile, ...profile }
        await get().updateSettings(userId, { profile: newProfile })
      },

      updateAppearance: async (userId: string, appearance) => {
        const current = get().settings
        const newAppearance = { ...current.appearance, ...appearance }
        await get().updateSettings(userId, { appearance: newAppearance })
      },

      updatePomodoro: async (userId: string, pomodoro) => {
        const current = get().settings
        const newPomodoro = { ...current.pomodoro, ...pomodoro }
        await get().updateSettings(userId, { pomodoro: newPomodoro })
      },

      updateBehavior: async (userId: string, behavior) => {
        const current = get().settings
        const newBehavior = { ...current.behavior, ...behavior }
        await get().updateSettings(userId, { behavior: newBehavior })
      },

      updateEntertainment: async (userId: string, entertainment) => {
        const current = get().settings
        const newEntertainment = { ...current.entertainment, ...entertainment }
        await get().updateSettings(userId, { entertainment: newEntertainment })
      },

      resetSettings: () => {
        set({ settings: DEFAULT_USER_SETTINGS, loading: false, error: null })
      }
    }),
    {
      name: "hub-settings-storage",
      partialize: (state) => ({ settings: state.settings }),
    }
  )
)
