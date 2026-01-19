// import { useMutation } from "@tanstack/react-query";
// import useCustomSign from "./useCustomSign";
// import { useSuiClientContext } from "@mysten/dapp-kit";
// import { useAppSelector } from "../../../store/hooks";
// import { PackageID } from "../../../constants/contract";
// import { Transaction } from "@mysten/sui/transactions";

// const useEndMatch = () => {
//   const { mutateAsync: signAndExecute } = useCustomSign();
//   const { client } = useSuiClientContext();
//   const fighterRoom = useAppSelector((state) => state.game.fighterRoom);

//   const mutation = useMutation({
//     mutationKey: ["end-match", fighterRoom.matchId],
//     mutationFn: async () => {
//       try {
//         const tx = new Transaction();
//         tx.moveCall({
//           target: `${PackageID}::match_manager::match_view`,
//           arguments: [
//             tx.object(fighterRoom.matchId!),
//           ],
//         });

//         const result = await client.devInspectTransactionBlock({
//           sender: currentAccount.address,
//           transactionBlock: tx,
//         });
//       } catch (error) {
//         throw new Error("Failed to end match", { cause: error });
//       }
//     },
//   });


//   return mutation;
// }

// export default useEndMatch