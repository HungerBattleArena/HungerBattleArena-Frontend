import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useQuery } from "@tanstack/react-query";
import { PackageID } from "../../constants/contract";
import { useAppSelector } from "../../store/hooks";
import { bcs } from "@mysten/sui/bcs";
import type { TMatchInfo } from "../../types/game";

const useMatchInfo = () => {
  const { client } = useSuiClientContext();
  const currentAccount = useCurrentAccount();
  const matchId = useAppSelector((state) => {
    return state.game.fighterRoom.matchId;
  });

  const query = useQuery<TMatchInfo | null>({
    queryKey: ["match-info", matchId],
    queryFn: async () => {
      if (!currentAccount?.address) {
        throw new Error("No account connected");
      }

      try {
        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::match_manager::match_view`,
          arguments: [
            tx.object(matchId!),
          ],
        });

        const result = await client.devInspectTransactionBlock({
          sender: currentAccount.address,
          transactionBlock: tx,
        });

        const MatchView = bcs.struct("MatchView", {
          match_id: bcs.Address,              // ObjectID
          vault_id: bcs.option(bcs.Address),  // Option<ObjectID>
          name: bcs.string(),
          fighter: bcs.Address,
          status: bcs.u8(),
          result: bcs.option(bcs.bool()),
          total_pool: bcs.u64(),
          total_bet_viewers: bcs.u64(),
          win_bets_total: bcs.u64(),
          lose_bets_total: bcs.u64(),
          win_bettors_count: bcs.u64(),
          lose_bettors_count: bcs.u64(),
        });

        const [bytes] = result.results?.[0]?.returnValues?.[0] || [];
        const decoded = MatchView.parse(Uint8Array.from(bytes || []));

        return decoded;
      } catch (error) {
        console.error("Error fetching match info:", error);
        return null;
      }
    },
    enabled: !!matchId && !!currentAccount?.address,
    retryDelay: 1000,
    retry: 3,
    staleTime: 0,
  });

  return query;
};

export default useMatchInfo;
