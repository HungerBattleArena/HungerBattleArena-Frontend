import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { handleEndMatch } from '../../../services';
import { defaultFighterRoom, setFighterRoom } from '../../../store/gameSlice';
import { useAppDispatch } from '../../../store/hooks';

const useEndMatch = () => {
  const dispatch = useAppDispatch();
  const setFighterRoomAction = (room: Parameters<typeof setFighterRoom>[0]) => {
    dispatch(setFighterRoom(room));
  };

  const mutation = useMutation({
    mutationKey: ['end-match'],
    mutationFn: async (values: { isWin: boolean, matchId?: string }) => {
      const { isWin, matchId } = values;

      if (!matchId) {
        toast.error('Match ID is required');
        return;
      }

      try {
        const result = await handleEndMatch(matchId, isWin);
        setFighterRoomAction(defaultFighterRoom);

        return result;
      } catch (error) {
        console.error('useEndMatch error:', error);
        toast.error('Failed to end match');
        throw new Error('Failed to end match', { cause: error });
      }
    },
  });

  return mutation;
};

export default useEndMatch;
