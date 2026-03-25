import { Transaction } from '@onelabs/sui/transactions';
import { useMutation } from '@tanstack/react-query';
import { coinType, PackageID, Registry } from '../../../constants/contract';
import type { CustomSuiObjectChange } from '../../../contract-modules/type';
import { setFighterRoom } from '../../../store/gameSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import useCustomSign from './useCustomSign';
import { toast } from 'react-toastify';
import useDefaultFighterStake from '../../query/useDefaultFighterStake';
import { useCurrentAccount, useSuiClientContext } from '@onelabs/dapp-kit';

const useOpenRoom = () => {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useCustomSign();
  const { data: defaultFighterStake } = useDefaultFighterStake();
  const { client } = useSuiClientContext();
  const fighterRoom = useAppSelector((state) => state.game.fighterRoom);
  const dispatch = useAppDispatch();
  const setFighterRoomAction = (room: Parameters<typeof setFighterRoom>[0]) => {
    dispatch(setFighterRoom(room));
  };

  const mutation = useMutation({
    mutationFn: async (values: { roomName: string }) => {
      const { roomName } = values;

      if (!currentAccount?.address) {
        throw new Error('Match ID and account address are required');
      }

      try {
        const fighterStakeValue = defaultFighterStake || 10;

        const tx = new Transaction();

        const betCoins = await client.getCoins({
          owner: currentAccount?.address,
          coinType: coinType,
        });

        const [stakeCoin] = tx.splitCoins(betCoins.data[0].coinObjectId, [tx.pure('u64', fighterStakeValue)]);
        tx.moveCall({
          target: `${PackageID}::bet_engine::create_match_with_bet_vault`,
          arguments: [tx.object(Registry), tx.pure.vector('u8', new TextEncoder().encode(roomName)), stakeCoin],
          typeArguments: [coinType],
        });

        const result = await signAndExecute({
          transaction: tx,
        });

        if (result?.objectChanges?.length && result.objectChanges.length > 0) {
          const match = result.objectChanges.find((change) => {
            const currObj = change as unknown as CustomSuiObjectChange;
            return currObj.objectType.toLowerCase().includes('match_manager::match');
          }) as unknown as CustomSuiObjectChange;

          setFighterRoomAction({
            ...fighterRoom,
            name: roomName,
            status: 'created',
            total_bet_viewers: '0',
            win_bets_total: '0',
            lose_bets_total: '0',
            win_bettors_count: '0',
            lose_bettors_count: '0',
            match_id: match?.objectId || '',
          });

          return match?.objectId || '';
        }
      } catch (error) {
        console.error('useOpenRoom error:', error);
        toast.error('Failed to open room');
        throw new Error('Failed to open room', { cause: error });
      }
    },
  });

  return mutation;
};

export default useOpenRoom;
