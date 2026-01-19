import { v4 as uuidv4 } from "uuid";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const generateRoomId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const uuid = uuidv4().replace(/-/g, "");
  let roomId = "";
  for (let i = 0; i < 6; i++) {
    const index = parseInt(uuid.substring(i * 5, i * 5 + 5), 16) % chars.length;
    roomId += chars[index];
  }
  
  return roomId;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}