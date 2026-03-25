import { useCurrentAccount } from '@onelabs/dapp-kit';
import { Transaction } from '@onelabs/sui/transactions';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { coinType, PackageID } from '../../../constants/contract';
import useCustomSign from './useCustomSign';

const useClaimCancelStake = () => {
  const { mutateAsync: signAndExecute } = useCustomSign();
  const currentAccount = useCurrentAccount();

  const mutation = useMutation({
    mutationKey: ['claim-cancel-stake'],
    mutationFn: async (values: { matchId?: string; vaultId?: string | null }) => {
      try {
        if (!values.matchId || !values.vaultId) {
          throw new Error('Match ID and Vault ID are required');
        }
        if (!currentAccount?.address) {
          throw new Error('No account connected');
        }

        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::bet_engine::claim_cancelled_stake`,
          arguments: [tx.object(values.vaultId), tx.object(values.matchId)],
          typeArguments: [coinType],
        });

        const result = await signAndExecute({
          transaction: tx,
        });
        console.log('🚀 ~ useClaimCancelStake ~ result:', { result, tx });

        toast.success('Claim cancel stake success');
        return result;
      } catch (error) {
        console.error('useClaimCancelStake error:', error);
        toast.error('Failed to claim cancel stake');
        throw new Error('Failed to claim cancel stake', { cause: error });
      }
    },
  });

  return mutation;
};

export default useClaimCancelStake;
