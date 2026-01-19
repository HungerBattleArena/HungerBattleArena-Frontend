import { Transaction } from '@mysten/sui/transactions';
import { useMutation } from '@tanstack/react-query';
import { PackageID, Registry } from '../../../constants/contract';
import type { CustomSuiObjectChange } from '../../../contract-modules/type';
import { setFighterRoom } from '../../../store/gameSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import useCustomSign from './useCustomSign';

const useOpenRoom = () => {
  const { mutateAsync: signAndExecute } = useCustomSign();
  const fighterRoom = useAppSelector((state) => state.game.fighterRoom);
  const dispatch = useAppDispatch();
  const setFighterRoomAction = (room: Parameters<typeof setFighterRoom>[0]) => {
    dispatch(setFighterRoom(room));
  };

  const mutation = useMutation({
    mutationFn: async (values: { roomName: string, roomId: string }) => {
      const { roomName, roomId } = values;

      try {
        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::bet_engine::create_match_with_bet_vault`,
          arguments: [
            tx.object(Registry),
            tx.pure.vector("u8", new TextEncoder().encode(roomName))
          ],
        });

        const result = await signAndExecute({
          transaction: tx,
        });

        if (result?.objectChanges?.length && result.objectChanges.length > 0) {
          const match = result.objectChanges.find((change) => {
            const currObj = change as unknown as CustomSuiObjectChange;
            return currObj.objectType.toLowerCase().includes("match_manager::match")
          }) as unknown as CustomSuiObjectChange;

          setFighterRoomAction({
            ...fighterRoom,
            name: roomName,
            id: roomId,
            state: "OPEN",
            totalBet: 0,
            winBet: 0,
            loseBet: 0,
            winCount: 0,
            loseCount: 0,
            matchId: match?.objectId || null,
          });
        }
      } catch (error) {
        throw new Error("Failed to open room", { cause: error });
      }
    },
  });

  return mutation;
}

export default useOpenRoom