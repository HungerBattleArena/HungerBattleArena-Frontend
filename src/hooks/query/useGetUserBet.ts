import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { PackageID } from "../../constants/contract";
import { Transaction } from "@mysten/sui/transactions";
import { useSearchParams } from "react-router-dom";
import { bcs } from "@mysten/sui/bcs";
import { UserBetView } from "../../utils/helper";

const useGetUserBet = (interval: number = 5 * 1000) => {
  const { client } = useSuiClientContext();
  const currentAccount = useCurrentAccount();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('room');
  
  const query = useQuery({
    queryKey: ['user-bet', matchId, currentAccount?.address],
    queryFn: async () => {
      if (!matchId || !currentAccount?.address) {
        throw new Error("Match ID is required");
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

      const decode = bcs.vector(bcs.option(UserBetView));
      const [bytes] = result.results?.[0]?.returnValues?.[0] || [];
      const decodedUserBets = decode.parse(Uint8Array.from(bytes || []));

      return decodedUserBets;
    },
    enabled: !!matchId && !!currentAccount?.address,
    staleTime: 0,
    refetchInterval: interval, // default 5 seconds
  });
  
  return query;
}

export default useGetUserBet