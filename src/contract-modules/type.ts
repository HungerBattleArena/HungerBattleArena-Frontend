export type CustomSuiObjectChange = {
  digest: string;
  objectId: string;
  objectType: string;
  owner: {
    Shared: {
      initial_shared_version: number;
    };
  };
  sender: string;
  type: "created" | "deleted" | "mutated";
  version: number;
}