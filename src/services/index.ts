import { API_END_POINTS } from "./api";
import { API_URL } from "./constant";

export const handleEndMatch = async (matchId: string, isWin: boolean) => {
  const response = await fetch(`${API_URL}${API_END_POINTS.endMatch}`, {
    method: 'POST',
    body: JSON.stringify({ matchId, isWin }),
  });

  return response.json();
}

export const handleCancelMatch = async (matchId: string) => {
  const response = await fetch(`${API_URL}${API_END_POINTS.cancelMatch}`, {
    method: 'POST',
    body: JSON.stringify({ matchId }),
  });

  return response.json();
}