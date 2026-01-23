import { useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { PackageID } from '../../../constants/contract';
import useMatchInfo from '../../query/useMatchInfo';
import useCustomSign from './useCustomSign';

const useFighterClaim = () => {
  const { mutateAsync: signAndExecute } = useCustomSign();
  const currentAccount = useCurrentAccount();
  const { data: matchInfo } = useMatchInfo();

  const mutation = useMutation({
    mutationKey: ['fighter-claim', matchInfo?.match_id],
    mutationFn: async () => {
      try {
        if (!matchInfo?.match_id || !matchInfo?.vault_id) {
          throw new Error('Match ID is required');
        }
        if (!currentAccount?.address) {
          throw new Error('No account connected');
        }

        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::bet_engine::claim_fighter_reward`,
          arguments: [tx.object(matchInfo.vault_id!), tx.object(matchInfo.match_id!)],
        });

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
