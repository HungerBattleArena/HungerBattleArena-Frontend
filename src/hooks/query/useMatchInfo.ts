import { useCurrentAccount, useSuiClientContext } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import type { TMatchInfo } from '../../types/game';
import { fetchMatchView } from '../../utils/helper';

const useMatchInfo = (matchId?: string | null, refetchInterval?: number) => {
  const { client } = useSuiClientContext();
  const currentAccount = useCurrentAccount();

  const query = useQuery<TMatchInfo | null>({
    queryKey: ['match-info', matchId],
    queryFn: async () => {
      if (!currentAccount?.address || !matchId) {
        console.log('No account connected or match ID missing');
        throw new Error('No account connected or match ID missing');
      }

      return await fetchMatchView(client, matchId, currentAccount.address);
    },
    enabled: !!matchId && !!currentAccount?.address,
    staleTime: Infinity,
    refetchInterval: refetchInterval ?? false,
  });

  return query;
};

export default useMatchInfo;
