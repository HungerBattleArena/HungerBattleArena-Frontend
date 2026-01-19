import { Transaction } from "@mysten/sui/transactions";
import { useMutation } from "@tanstack/react-query";
import { PackageID } from "../../../constants/contract";
import { useAppSelector } from "../../../store/hooks";
import useCustomSign from "./useCustomSign";

const useStartMatch = () => {
  const { mutateAsync: signAndExecute } = useCustomSign();
  const fighterRoom = useAppSelector((state) => state.game.fighterRoom);

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        if (!fighterRoom.matchId) {
          throw new Error("Match ID is required");
        }

        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::match_manager::start_match`,
          arguments: [
            tx.object(fighterRoom.matchId!),
          ],
        });

        const result = await signAndExecute({
          transaction: tx,
        });

        return result;
      } catch (error) {
        throw new Error("Failed to start match", { cause: error });
      }
    },
  });

  return mutation;
}

export default useStartMatch