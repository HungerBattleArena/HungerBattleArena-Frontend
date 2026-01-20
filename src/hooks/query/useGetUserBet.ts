// import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
// import { useQuery } from "@tanstack/react-query";

// const useGetUserBet = () => {
//   const { client } = useSuiClientContext();
//   const currentAccount = useCurrentAccount();
//     // const matchIdByFighter = useAppSelector((state) => {
//     //   return state.game.fighterRoom.match_id;
//     // });
  
//   const query = useQuery({
//     queryKey: ['user-bet'],
//     queryFn: async () => {
//       const bet = await getUserBet();
//       return bet;
//     },
//   });
  
//   return query;
// }

// export default useGetUserBet