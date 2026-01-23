import { useCurrentAccount } from '@mysten/dapp-kit';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import useCustomSign from '../match/useCustomSign';
import { Transaction } from '@mysten/sui/transactions';
import { PackageID } from '../../../constants/contract';
import { toast } from 'react-toastify';

const useClaimViewerReward = () => {
  const { mutateAsync: signAndExecute } = useCustomSign();
  const currentAccount = useCurrentAccount();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('room');

  const mutation = useMutation({
    mutationKey: ['claim-viewer-reward', matchId, currentAccount?.address],
    mutationFn: async (values: { vaultId: string }) => {
      const { vaultId } = values;

      if (!vaultId || !matchId || !currentAccount?.address) {
        throw new Error('Vault ID, match ID and account address are required');
      }

      try {
        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::bet_engine::claim_viewer_reward`,
          arguments: [tx.object(vaultId), tx.object(matchId)],
        });

        console.log('Transaction to be signed with:', {
          vaultId,
          matchId,
          accountAddress: currentAccount.address,
        });

        const result = await signAndExecute({
          transaction: tx,
        });

        toast.success('Viewer reward claimed');
        return result;
      } catch (error) {
        console.log('useClaimViewerReward error:', error);
        toast.error('Failed to claim reward');
        throw new Error('Failed to claim viewer reward', { cause: error });
      }
    },
  });

  return mutation;
};

export default useClaimViewerReward;
