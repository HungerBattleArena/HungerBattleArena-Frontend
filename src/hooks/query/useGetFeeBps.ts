import { useCurrentAccount, useSuiClientContext } from '@onelabs/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { Transaction } from '@onelabs/sui/transactions';
import { PackageID } from '../../constants/contract';
import { bcs } from '@onelabs/sui/bcs';

const useGetFeeBps = () => {
  const currentAccount = useCurrentAccount();
  const { client } = useSuiClientContext();

  const query = useQuery({
    queryKey: ['fee-bps'],
    queryFn: async () => {
      try {
        if (!currentAccount?.address) {
          throw new Error('Current account address is required');
        }

        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::bet_engine::fee_bps`,
          arguments: [],
        });

        const result = await client.devInspectTransactionBlock({
          sender: currentAccount.address,
          transactionBlock: tx,
        });

        const decode = bcs.u64();
        const [bytes] = result.results?.[0]?.returnValues?.[0] || [];
        const decodedFeeBps = decode.parse(Uint8Array.from(bytes || []));

        return decodedFeeBps;
      } catch (error) {
        console.log('fee bps error', error);
        throw error;
      }
    },
  });

  return query;
};

export default useGetFeeBps;
