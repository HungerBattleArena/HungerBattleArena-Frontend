import { useCurrentAccount } from '@onelabs/dapp-kit';
import { Transaction } from '@onelabs/sui/transactions';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { PackageID, Treasury } from '../../../constants/contract';
import useCustomSign from './useCustomSign';

const useFighterClaim = () => {
  const { mutateAsync: signAndExecute } = useCustomSign();
  const currentAccount = useCurrentAccount();

  const mutation = useMutation({
    mutationKey: ['fighter-claim'],
    mutationFn: async (values: { matchId?: string; vaultId?: string }) => {
      console.log('Fighter claim transaction:', values);

      try {
        if (!values.matchId || !values.vaultId) {
          throw new Error('Match ID and Vault ID are required');
        }
        if (!currentAccount?.address) {
          throw new Error('No account connected');
        }

        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::bet_engine::claim_fighter_reward`,
          arguments: [tx.object(Treasury), tx.object(values.vaultId), tx.object(values.matchId)],
        });

        console.log('Fighter claim transaction downnnnnn:', values);

        const result = await signAndExecute({
          transaction: tx,
        });

        toast.success('Fighter reward claimed');
        return result;
      } catch (error) {
        console.error('useFighterClaim error:', error);
        toast.error('Failed to claim fighter reward');
        throw new Error('Failed to claim fighter reward', { cause: error });
      }
    },
  });

  return mutation;
};

export default useFighterClaim;
