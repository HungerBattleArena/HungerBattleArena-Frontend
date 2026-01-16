import type { UserData } from "../types/game";

const STORAGE_KEY = "hba_user_data_v1";

export const defaultUserData: UserData = {
  credits: 5000,
  inventory: [
    "skin_default",
    "char_assault",
    "fists",
    "knife",
    "pistol",
    "bow",
  ],
  skipInstructions: false,
};

export function loadUserData(): UserData {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...defaultUserData, ...parsed };
    } catch {
      return defaultUserData;
    }
  }
  return defaultUserData;
}

export function saveUserData(data: UserData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
