import { useCurrentAccount, useSuiClientContext } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { OCT_COIN_DECIMALS, PackageID } from '../../constants/contract';
import { Transaction } from '@mysten/sui/transactions';
import { useSearchParams } from 'react-router-dom';
import { UserBetView } from '../../utils/helper';
import { BN } from '../../utils/utils';

const useGetUserBet = (interval: number = 5 * 1000) => {
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
        console.log('🚀 ~ useGetUserBet ~ matchId:', matchId);

        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::bet_engine::user_bet_view`,
          arguments: [tx.object(matchId), tx.object(currentAccount.address)],
        });

        const result = await client.devInspectTransactionBlock({
          sender: currentAccount.address,
          transactionBlock: tx,
        });

        const [bytes] = result.results?.[0]?.returnValues?.[0] || [];
        const decodedUserBets = UserBetView.parse(Uint8Array.from(bytes || []));

        return {
          amount: BN(decodedUserBets.amount).dividedBy(BN(10).pow(OCT_COIN_DECIMALS)).toNumber(),
          side: decodedUserBets.side,
        };
      } catch (error) {
        console.error(error);
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
