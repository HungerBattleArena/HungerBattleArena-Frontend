import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { handleEndMatch } from "../../../services";

const useEndMatch = () => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('room');

  const mutation = useMutation({
    mutationKey: ["end-match", matchId],
    mutationFn: async (values: { isWin: boolean }) => {
      const { isWin } = values;

      if (!matchId || !isWin) {
        throw new Error("Match ID and isWin are required");
      }

      try {
        const result = await handleEndMatch(matchId, isWin);
        return result;
      } catch (error) {
        throw new Error("Failed to end match", { cause: error });
      }
    },
  });

  return mutation;
}

export default useEndMatch