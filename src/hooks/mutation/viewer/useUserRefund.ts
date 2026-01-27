import { Transaction } from '@onelabs/sui/transactions';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { PackageID } from '../../../constants/contract';
import useCustomSign from '../match/useCustomSign';

const useUserRefund = () => {
  const { mutateAsync: signAndExecute } = useCustomSign();

  const mutation = useMutation({
    mutationKey: ['user-refund'],
    mutationFn: async (values: { matchId: string; vaultId: string }) => {
      const { matchId, vaultId } = values;
      if (!matchId || matchId === '' || !vaultId || vaultId === '') {
        toast.error('Match ID is required');
        return;
      }

      try {
        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::bet_engine::refund_bet`,
          arguments: [tx.object(vaultId), tx.object(matchId)],
        });

        const result = await signAndExecute({
          transaction: tx,
        });

        toast.success('Bet refunded');
        return result;
      } catch (error) {
        console.error('useUserRefund error:', error);
        toast.error('Failed to refund');
        return;
      }
    },
  });

  return mutation;
};

export default useUserRefund;
