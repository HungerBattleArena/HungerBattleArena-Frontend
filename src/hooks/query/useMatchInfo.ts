import { useCurrentAccount, useSuiClientContext } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '../../store/hooks';
import type { TMatchInfo } from '../../types/game';
import { fetchMatchView } from '../../utils/helper';

const useMatchInfo = (matchId?: string) => {
  const { client } = useSuiClientContext();
  const currentAccount = useCurrentAccount();
  const matchIdByFighter = useAppSelector((state) => {
    return state.game.fighterRoom.match_id;
  });

  const effectiveMatchId = matchId ? matchId : matchIdByFighter;

  const query = useQuery<TMatchInfo | null>({
    queryKey: ['match-info', effectiveMatchId],
    queryFn: async () => {
      if (!currentAccount?.address || !effectiveMatchId) {
        throw new Error('No account connected or match ID missing');
      }

      return await fetchMatchView(client, effectiveMatchId, currentAccount.address);
    },
    enabled: !!effectiveMatchId && !!currentAccount?.address,
  });

  return query;
};

export default useMatchInfo;
