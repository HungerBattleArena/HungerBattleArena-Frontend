import { useCurrentAccount } from "@mysten/dapp-kit";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import useCustomSign from "../match/useCustomSign";
import { Transaction } from "@mysten/sui/transactions";
import { PackageID } from "../../../constants/contract";

const useClaimViewerReward = () => {
  const { mutateAsync: signAndExecute } = useCustomSign();
  const currentAccount = useCurrentAccount();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('room');

  const mutation = useMutation({
    mutationKey: ["claim-viewer-reward", matchId, currentAccount?.address],
    mutationFn: async (values: { vaultId: string }) => {
      const { vaultId } = values;

      if (!vaultId || !matchId || !currentAccount?.address) {
        throw new Error("Vault ID, match ID and account address are required");
      }

      try {
        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::bet_engine::claim_viewer_reward`,
          arguments: [
            tx.object(vaultId),
            tx.object(matchId),
          ],
        });

        const result = await signAndExecute({
          transaction: tx,
        });

        return result;
      } catch (error) {
        throw new Error("Failed to open room", { cause: error });
      }
    },
  });

  return mutation
}

export default useClaimViewerReward