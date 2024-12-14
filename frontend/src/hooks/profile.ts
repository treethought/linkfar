import { useEffect, useState } from "react";
import { getAddress, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { getCIDJson } from "@/lib/ipfs";
import { useReadLinkFar, useReadLinkFarGetProfile } from "@/generated";

export type AccountData = {
  name?: string;
  description?: string;
  image?: string;
  properties?: Record<string, string>;
};

export function useContract() {
  const { address } = useAccount();
  const { data: accountContract } = useReadLinkFar({
    account: address,
    args: [address || zeroAddress],
  });
  return { accountContract };
}

export function useProfile(address?: string) {
  if (!address) {
    address = zeroAddress;
  }
  const { data: profile, isLoading, error } = useReadLinkFarGetProfile({
    args: [getAddress(address)],
  });
  const hasProfile = profile && profile.owner && profile.owner !== zeroAddress;
  return { profile, hasProfile, isLoading, error };
}

export function useProfileUri(address: string) {
  const { profile, isLoading, error } = useProfile(address);
  return { uri: profile?.uri, isLoading, error };
}

export function useAccountData(address: string) {
  const { uri } = useProfileUri(address);
  const [data, setData] = useState<AccountData | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("useAccountData effect", uri);
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
