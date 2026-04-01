export type ThemeMode = "light" | "dark" | "system"
export type RatingFormat = "default" | "integers" | "stars" | "emojis"

export interface UserSettings {
  profile: {
    displayName: string
    avatarUrl: string | null
  }
  appearance: {
    theme: ThemeMode
    primaryColor: string
  }
  pomodoro: {
    workTime: number
    breakTime: number
  }
  behavior: {
    notifications: boolean
    soundEffects: boolean
    autoSaveNotes: boolean
    showStreaks: boolean
  }
  entertainment: {
    ratingFormat: RatingFormat
  }
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  profile: {
    displayName: "Usuário",
    avatarUrl: null
  },
  appearance: {
    theme: "dark",
    primaryColor: "#600dbf"
  },
  pomodoro: {
    workTime: 25,
    breakTime: 5
  },
  behavior: {
    notifications: false,
    soundEffects: false,
    autoSaveNotes: true,
    showStreaks: true
  },
  entertainment: {
    ratingFormat: "default"
  }
}
