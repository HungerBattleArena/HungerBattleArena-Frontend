import type { SuiClient } from '@mysten/sui/client';
import type { TMatchInfo } from '../types/game';
import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { OCT_COIN_DECIMALS, PackageID } from '../constants/contract';
import { BN } from './utils';

export const fetchMatchView = async (
  client: SuiClient,
  matchId: string,
  senderAddress: string
): Promise<TMatchInfo | null> => {
  try {
    // NOTE: divide by OCT_COIN_DECIMALS when displaying coin amounts
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

    const matchStatus: Record<number, 'created' | 'in_game' | 'ended' | 'cancelled'> = {
      0: 'created',
      1: 'in_game',
      2: 'ended',
      3: 'cancelled',
    };

    return {
      ...decoded,
      total_pool: BN(decoded.total_pool).dividedBy(BN(10).pow(OCT_COIN_DECIMALS)).toString(),
      win_bets_total: BN(decoded.win_bets_total).dividedBy(BN(10).pow(OCT_COIN_DECIMALS)).toString(),
      lose_bets_total: BN(decoded.lose_bets_total).dividedBy(BN(10).pow(OCT_COIN_DECIMALS)).toString(),
      status: matchStatus[decoded.status] || 'created',
    };
  } catch (error) {
    console.error(`Error fetching match view for ${matchId}:`, error);
    return null;
  }
};

export const UserBetView = bcs.struct('UserBetView', {
  side: bcs.u8(),
  amount: bcs.u64(),
});


export const handleCalcReward = ({ match, initBet, isVictory, betSide }: { match: TMatchInfo | null, initBet: string, isVictory: boolean, betSide: 'WIN' | 'LOSE' }) => {
  if (!match) return '0';
  const { win_bets_total, lose_bets_total, total_pool } = match;
  const winReward = BN(BN(initBet).dividedBy(win_bets_total)).multipliedBy(BN(total_pool));
  const loseReward = BN(BN(initBet).dividedBy(lose_bets_total)).multipliedBy(BN(total_pool));

  console.log('🚀 ~ mutationFn ~ win_bets_total:', {
    match,
    initBet,
    winReward: winReward.toString(),
    loseReward: loseReward.toString(),
  });

  if (isVictory) {
    return betSide === 'WIN' ? winReward.toString() : loseReward.toString();
  } else {
    return '0';
  }
};