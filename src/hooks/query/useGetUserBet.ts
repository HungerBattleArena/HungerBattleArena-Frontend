import { useCurrentAccount, useSuiClientContext } from '@onelabs/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { OCT_COIN_DECIMALS, PackageID } from '../../constants/contract';
import { Transaction } from '@onelabs/sui/transactions';
import { useSearchParams } from 'react-router-dom';
import { UserBetView } from '../../utils/helper';
import { BN } from '../../utils/utils';
import { bcs } from '@onelabs/sui/bcs';

const useGetUserBet = (interval?: number) => {
  const { client } = useSuiClientContext();
  const currentAccount = useCurrentAccount();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('room');

  const initData = { amount: 0, side: 'none' };

  const query = useQuery({
    queryKey: ['user-bet', matchId, currentAccount?.address],
    queryFn: async () => {
      try {
        if (!matchId || !currentAccount?.address) {
          throw new Error('Match ID is required');
        }

        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::bet_engine::user_bet_view`,
          arguments: [tx.object(matchId), tx.object(currentAccount.address)],
        });

        const result = await client.devInspectTransactionBlock({
          sender: currentAccount.address,
          transactionBlock: tx,
        });

        const decode = bcs.option(UserBetView);
        const [bytes] = result.results?.[0]?.returnValues?.[0] || [];
        const decodedUserBets = decode.parse(Uint8Array.from(bytes || []));

        if (!decodedUserBets) return initData;

        return {
          amount: BN(decodedUserBets.amount).dividedBy(BN(10).pow(OCT_COIN_DECIMALS)).toNumber(),
          side: decodedUserBets.side == 0 ? 'WIN' : 'LOSE',
        };
      } catch (error) {
        console.error('useGetUserBet error:', error);
        return initData;
      }
    },
    enabled: !!matchId && !!currentAccount?.address,
    staleTime: 0,
    refetchInterval: interval, // default 5 seconds
  });

  return query;
};

export default useGetUserBet;
