import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { handleEndMatch } from '../../../services';
import { useAppDispatch } from '../../../store/hooks';
import { defaultFighterRoom, setFighterRoom } from '../../../store/gameSlice';
import { toast } from 'react-toastify';

const useEndMatch = () => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('room');
  const dispatch = useAppDispatch();
  const setFighterRoomAction = (room: Parameters<typeof setFighterRoom>[0]) => {
    dispatch(setFighterRoom(room));
  };

  const mutation = useMutation({
    mutationKey: ['end-match', matchId],
    mutationFn: async (values: { isWin: boolean }) => {
      const { isWin } = values;

      if (!matchId || !isWin) {
        throw new Error('Match ID and isWin are required');
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
