import { useCurrentAccount, useSuiClientContext } from '@onelabs/dapp-kit';
import { Transaction } from '@onelabs/sui/transactions';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { coinType, PackageID, Treasury } from '../../../constants/contract';
import useCustomSign from '../match/useCustomSign';

const useClaimViewerReward = () => {
  const { mutateAsync: signAndExecute } = useCustomSign();
  const currentAccount = useCurrentAccount();
  const { client } = useSuiClientContext();

  const mutation = useMutation({
    mutationKey: ['claim-viewer-reward', currentAccount?.address],
    mutationFn: async (values: { vaultId: string; matchId: string }) => {
      const { vaultId, matchId } = values;

      if (!vaultId || !matchId || !currentAccount?.address) {
        throw new Error('Vault ID, match ID and account address are required');
      }

      try {
        const tx = new Transaction();
        const coins = await client.getCoins({
          owner: currentAccount?.address,
          coinType: "0x2::oct::OCT",
        });

        if (coins.data.length === 0) {
          throw new Error('No OCT coins found');
        }

        tx.setGasPayment([
          {
            objectId: coins.data[0].coinObjectId,
            version: coins.data[0].version,
            digest: coins.data[0].digest,
          },
        ]);

        tx.moveCall({
          target: `${PackageID}::bet_engine::claim_viewer_reward`,
          arguments: [tx.object(Treasury), tx.object(vaultId), tx.object(matchId)],
          typeArguments: [coinType],
        });

        // const temp = await client.devInspectTransactionBlock({
        //   sender: currentAccount.address,
        //   transactionBlock: tx,
        // });

        // console.log("🚀 ~ useClaimViewerReward ~ temp:", temp)

        const result = await signAndExecute({
          transaction: tx,
        });

        toast.success('Viewer reward claimed');
        return result;
      } catch (error) {
        console.error('useClaimViewerReward error:', error);
        toast.error('Failed to claim reward');
        throw new Error('Failed to claim viewer reward', { cause: error });
      }
    },
  });

  return mutation;
};

export default useClaimViewerReward;
