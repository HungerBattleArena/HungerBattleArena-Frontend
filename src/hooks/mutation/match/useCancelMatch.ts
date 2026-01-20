import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { handleCancelMatch } from "../../../services";

const useCancelMatch = () => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('room');

  const mutation = useMutation({
    mutationKey: ["cancel-match", matchId],
    mutationFn: async () => {
      if (!matchId) {
        throw new Error("Match ID is required");
      }

      try {
        const result = await handleCancelMatch(matchId);
        return result;
      } catch (error) {
        throw new Error("Failed to cancel match", { cause: error });
      }
    },
  });

  return mutation;
}

export default useCancelMatch