import { useMutation } from '@tanstack/react-query';
import useCustomSign from '../match/useCustomSign';
import { useCurrentAccount, useSuiClientContext } from '@mysten/dapp-kit';
import { useSearchParams } from 'react-router-dom';
import { Transaction } from '@mysten/sui/transactions';
import { OCT_COIN_DECIMALS, PackageID } from '../../../constants/contract';
import { BN } from '../../../utils/utils';

const usePlaceBet = () => {
  const { mutateAsync: signAndExecute } = useCustomSign();
  const currentAccount = useCurrentAccount();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('room');
  const { client } = useSuiClientContext();

  const mutation = useMutation({
    mutationKey: ['place-bet', matchId, currentAccount?.address],
    mutationFn: async (values: { vaultId: string; side: 'WIN' | 'LOSE'; amount: number }) => {
      const { vaultId, side, amount } = values;
      const sideValue = side === 'WIN' ? 0 : 1;

      if (!matchId || !currentAccount?.address) {
        throw new Error('Match ID and account address are required');
      }

      try {
        const tx = new Transaction();
        const coins = await client.getCoins({
          owner: currentAccount?.address,
          coinType: '0x2::oct::OCT',
        });

        if (coins.data.length === 0) {
          throw new Error('No OCT coins found');
        }

        tx.setGasPayment([
          {
            objectId: coins.data[0].coinObjectId,
            version: coins.data[0].version,
            digest: coins.data[0].digest,
          },
        ]);

        const rawAmount = BN(amount)
          .multipliedBy(10 ** OCT_COIN_DECIMALS)
          .toString();
        const [betCoin] = tx.splitCoins(tx.gas, [tx.pure('u64', rawAmount)]);
        tx.moveCall({
          target: `${PackageID}::bet_engine::place_bet`,
          arguments: [tx.object(vaultId), tx.object(matchId), tx.pure.u8(sideValue), betCoin],
        });

        const result = await signAndExecute({
          transaction: tx,
        });

        return result;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to place bet', { cause: error });
      }
    },
  });

  return mutation;
};

export default usePlaceBet;
