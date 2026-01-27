import { Transaction } from '@onelabs/sui/transactions';
import { useMutation } from '@tanstack/react-query';
import { PackageID } from '../../../constants/contract';
import { useAppSelector } from '../../../store/hooks';
import useCustomSign from './useCustomSign';
import { toast } from 'react-toastify';

const useStartMatch = () => {
  const { mutateAsync: signAndExecute } = useCustomSign();
  const fighterRoom = useAppSelector((state) => state.game.fighterRoom);

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        if (!fighterRoom.match_id) {
          throw new Error('Match ID is required');
        }

        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::match_manager::start_match`,
          arguments: [tx.object(fighterRoom.match_id!)],
        });

        const result = await signAndExecute({
          transaction: tx,
        });

        return result;
      } catch (error) {
        console.error('useStartMatch error:', error);
        toast.error('Failed to start match');
        throw new Error('Failed to start match', { cause: error });
      }
    },
  });

  return mutation;
};

export default useStartMatch;
