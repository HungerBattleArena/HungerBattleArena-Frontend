import type { SuiClient } from '@mysten/sui/client';
import type { TMatchInfo } from '../types/game';
import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { PackageID } from '../constants/contract';

export const fetchMatchView = async (client: SuiClient, matchId: string, senderAddress: string): Promise<TMatchInfo | null> => {
  try {
    const MatchView = bcs.struct('MatchView', {
      match_id: bcs.Address,
      vault_id: bcs.option(bcs.Address),
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

    const tx = new Transaction();
    tx.moveCall({
      target: `${PackageID}::match_manager::match_view`,
      arguments: [tx.object(matchId)],
    });

    const result = await client.devInspectTransactionBlock({
      sender: senderAddress,
      transactionBlock: tx,
    });

    const [bytes] = result.results?.[0]?.returnValues?.[0] || [];
    const decoded = MatchView.parse(Uint8Array.from(bytes || []));

    const matchStatus: Record<number, 'created' | 'in_game' | 'ended'> = {
      0: 'created',
      1: 'in_game',
      2: 'ended',
    };

    return {
      ...decoded,
      status: matchStatus[decoded.status] || 'created',
    };
  } catch (error) {
    console.error(`Error fetching match view for ${matchId}:`, error);
    return null;
  }
};
