import { useCurrentAccount, useSuiClientContext } from '@onelabs/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { Transaction } from '@onelabs/sui/transactions';
import { PackageID } from '../../constants/contract';
import { bcs } from '@onelabs/sui/bcs';

const useDefaultFighterStake = () => {
  const currentAccount = useCurrentAccount();
  const { client } = useSuiClientContext();

  const query = useQuery({
    queryKey: ['default-fighter-stake', currentAccount?.address],
    queryFn: async () => {
      try {
        if (!currentAccount?.address) {
          throw new Error('Current account address is required');
        }

        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::match_manager::default_fighter_stake`,
          arguments: [],
        });

        const result = await client.devInspectTransactionBlock({
          sender: currentAccount.address,
          transactionBlock: tx,
        });

        const decode = bcs.u64();
        const [bytes] = result.results?.[0]?.returnValues?.[0] || [];
        const decodedDefaultFighterStake = decode.parse(Uint8Array.from(bytes || []));

        return decodedDefaultFighterStake;
      } catch (error) {
        console.log('default fighter stake error', error);
        throw error;
      }
    },
  });

  return query;
};

export default useDefaultFighterStake;
