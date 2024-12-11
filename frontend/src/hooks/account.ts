import { useReadAccountUri, useReadRegistryAccounts } from "@/generated";
import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { getCIDJson } from "@/lib/ipfs";
type AccountData = {
  Links: Record<string, string>;
};

export function useAccountContract() {
  const { address } = useAccount();
  const { data: accountContract } = useReadRegistryAccounts({
    account: address,
    args: [address || zeroAddress],
  });
  return { accountContract };
}

export function useAccountUri() {
  const { accountContract } = useAccountContract();
  const { data: uri, isLoading, error } = useReadAccountUri({
    address: accountContract,
    args: [],
  });
  return { uri, isLoading, error };
}

export function useAccountData() {
  const { uri } = useAccountUri();
  const [data, setData] = useState<AccountData | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uri) {
      setData(undefined);
      return;
    }
    const getData = async () => {
      setLoading(true);
      console.log("getting data for uri: ", uri);
      try {
        const data = await getCIDJson(uri);
        setData(data);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [uri]);
  return { data, error, loading };
}
