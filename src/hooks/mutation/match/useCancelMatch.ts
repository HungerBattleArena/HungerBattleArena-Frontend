import { useMutation } from "@tanstack/react-query";
import { handleCancelMatch } from "../../../services";
import { toast } from "react-toastify";

const useCancelMatch = () => {

  const mutation = useMutation({
    mutationKey: ["cancel-match"],
    mutationFn: async (values?: { matchId: string }) => {
      const matchId = values?.matchId || '';
      if (!matchId || matchId === '') {
        toast.error("Match ID is required");
        return;
      }

      try {
        const result = await handleCancelMatch(matchId);
        return result;
      } catch (error) {
        console.log(error);
        toast.error("Failed to cancel match");
        return;
      }
    },
  });

  return mutation;
}

export default useCancelMatch