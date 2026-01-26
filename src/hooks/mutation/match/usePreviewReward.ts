import { useMutation } from "@tanstack/react-query";
import type { TMatchInfo } from "../../../types/game";
import { BN } from "../../../utils/utils";

const usePreviewReward = () => {
  const mutation = useMutation({
    mutationKey: ['preview-reward'],
    mutationFn: async (values: { match: TMatchInfo, initBet: string }) => {
      try {
        const { initBet, match } = values;
        const { win_bets_total, lose_bets_total, total_pool } = match;

        const winReward = BN(BN(initBet).dividedBy(win_bets_total)).multipliedBy(BN(total_pool));
        const loseReward = BN(BN(initBet).dividedBy(lose_bets_total)).multipliedBy(BN(total_pool));

        console.log('🚀 ~ mutationFn ~ win_bets_total:', {
          match: values.match,
          initBet: values.initBet,
          winReward: winReward.toString(),
          loseReward: loseReward.toString(),
        });

        return {
          winReward: winReward.toString(),
          loseReward: loseReward.toString(),
        };
      } catch (error) {
        console.error('usePreviewReward error:', error);
        throw new Error('Failed to preview reward', { cause: error });
      }
    },
  });

  return mutation;
};

export default usePreviewReward;