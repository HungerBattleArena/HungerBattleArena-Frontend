import { useCurrentAccount, useSuiClientContext } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Transaction } from '@mysten/sui/transactions';
import { PackageID } from '../../constants/contract';
import { bcs } from '@mysten/sui/bcs';

const useGetPreviewReward = () => {
  const currentAccount = useCurrentAccount();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('room');
  const { client } = useSuiClientContext();

  const query = useQuery({
    queryKey: ['preview-reward', matchId],
    queryFn: async () => {
      try {
        if (!matchId || !currentAccount?.address) {
          throw new Error('Match ID is required');
        }

        const tx = new Transaction();
        tx.moveCall({
          target: `${PackageID}::bet_engine::preview_reward`,
          arguments: [tx.object(matchId), tx.object(currentAccount.address)],
        });

        const result = await client.devInspectTransactionBlock({
          sender: currentAccount.address,
          transactionBlock: tx,
        });
        console.log('🚀 ~ useGetPreviewReward ~ result:', result);

        const decode = bcs.vector(bcs.u64());
        console.log('🚀 ~ useGetPreviewReward ~ decode:', decode);
        const [bytes] = result.results?.[0]?.returnValues?.[0] || [];
        const decodedReward = decode.parse(Uint8Array.from(bytes || []));

        return decodedReward;
      } catch (error) {
        console.log('preview reward error', error);
        throw error;
      }
    },
  });

  return query;
};

export default useGetPreviewReward;
