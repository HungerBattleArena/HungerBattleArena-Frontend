import { useSignAndExecuteTransaction, useSuiClientContext } from "@mysten/dapp-kit";

const useCustomSign = () => {
  const { client } = useSuiClientContext();
  const mutation = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) => {
      const { digest, rawEffects, objectChanges } = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showObjectChanges: true,
        },
      });

      return {
        digest,
        rawEffects,
        objectChanges,
      };
    },
  });

  return mutation;
}

export default useCustomSign