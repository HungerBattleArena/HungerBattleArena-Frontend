import { Transaction } from '@mysten/sui/transactions';
import { useQuery } from '@tanstack/react-query';
import { PackageID, Registry } from '../../constants/contract';
import { useCurrentAccount, useSuiClientContext } from '@mysten/dapp-kit';
import { bcs } from '@mysten/sui/bcs';
import type { TMatchInfo } from '../../types/game';
import { fetchMatchView } from '../../utils/helper';
import { queryClient } from '../../constants';

const useListMatchInfo = () => {
  const { client } = useSuiClientContext();
  const currentAccount = useCurrentAccount();

  // const matchInfos: TMatchInfo[] = [];

  const query = useQuery({
    queryKey: ['rooms-info'],
    queryFn: async () => {
      const endedResult: TMatchInfo[] = [];

      try {
        if (!currentAccount?.address) {
          console.error('No account connected');
          return endedResult;
        }

        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::match_manager::get_match_ids`,
          arguments: [tx.object(Registry)],
        });

        const result = await client.devInspectTransactionBlock({
          sender: currentAccount.address,
          transactionBlock: tx,
        });

        const decode = bcs.vector(bcs.Address);
        const [bytes] = result.results?.[0]?.returnValues?.[0] || [];
        const decodedMatchIds = decode.parse(Uint8Array.from(bytes || [])).reverse();

        for (const matchId of decodedMatchIds) {
          const matchInfo = await queryClient.ensureQueryData({
            queryKey: ['match-info', matchId],
            queryFn: async () => {
              return await fetchMatchView(client, matchId, currentAccount.address);
            },
          });

          if (matchInfo) {
            endedResult.push(matchInfo);
          }
        }

        return endedResult;
      } catch (error) {
        console.error('Error fetching rooms info:', error);
        return endedResult;
      }
    },
    // initialData: matchInfos,
    enabled: !!currentAccount?.address,
    staleTime: 0,
    refetchInterval: 10000,
    // refetchOnWindowFocus: true,
  });

  return { ...query, data: query.data };
};

export default useListMatchInfo;
