import { useCurrentAccount } from '@onelabs/dapp-kit';
import { Transaction } from '@onelabs/sui/transactions';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { PackageID } from '../../../constants/contract';
import useCustomSign from './useCustomSign';

const useFighterCancel = () => {
  const { mutateAsync: signAndExecute } = useCustomSign();
  const currentAccount = useCurrentAccount();

  const mutation = useMutation({
    mutationKey: ['fighter-cancel'],
    mutationFn: async (values: { matchId?: string }) => {
      try {
        if (!values.matchId) {
          throw new Error('Match ID and Vault ID are required');
        }
        if (!currentAccount?.address) {
          throw new Error('No account connected');
        }

        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::bet_engine::cancel_match`,
          arguments: [tx.object(values.matchId)],
        });

        const result = await signAndExecute({
          transaction: tx,
        });
        console.log('🚀 ~ useFighterCancel ~ result:', { result, tx });

        toast.success('Fighter cancel success');
        return result;
      } catch (error) {
        console.error('useFighterClaim error:', error);
        toast.error('Failed to cancel');
        throw new Error('Failed to cancel', { cause: error });
      }
    },
  });

  return mutation;
};

export default useFighterCancel;
