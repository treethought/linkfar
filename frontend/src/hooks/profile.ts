import { useEffect, useState } from "react";
import { getAddress, zeroAddress } from "viem";
import { useEnsAvatar, useEnsName, useReadContract } from "wagmi";
import { getCIDJson } from "@/lib/ipfs";
import { linkFarAbi } from "@/generated";
import Profile from "@/app/[slug]/page";
import { useProxyAddress } from "./contract";

export interface Profile {
  owner: string;
  uri: string;
  slug: string;
}

export type FarcasterUserData = {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
};

export type AccountData = {
  name?: string;
  description?: string;
  image?: string;
  properties?: Record<string, string>;

  // not in ERC-1155 metadata
  farcaster?: FarcasterUserData;
};

export function useProfileBySlug(slug: string) {
  const address = useProxyAddress();
  const { data: profile, isLoading, error } = useReadContract({
    abi: linkFarAbi,
    address: address,
    functionName: "getProfileBySlug",
    args: [slug],
  });

  const hasProfile = profile && profile.owner && profile.owner !== zeroAddress;
  return { profile, hasProfile, isLoading, error };
}

export function useProfile(address?: string) {
  const proxyAddress = useProxyAddress();

  if (!address) {
    address = zeroAddress;
  }
  const { data: profile, isLoading, error } = useReadContract({
    abi: linkFarAbi,
    address: proxyAddress,
    functionName: "getProfile",
    args: [getAddress(address)],
  });
  const hasProfile = profile && profile.owner && profile.owner !== zeroAddress;
  const p = profile as Profile;
  return { profile: p, hasProfile, isLoading, error };
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

export function useAccountAvatar(address: string) {
  const { data: ensName } = useEnsName({
    address: getAddress(address),
    chainId: 1,
  });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName!, chainId: 1 });
  const { data, loading, error } = useAccountData(address);

  if (data?.image) {
    return { avatar: data.image, loading, error };
  }
  if (data?.farcaster?.pfpUrl) {
    return { avatar: data.farcaster.pfpUrl, loading, error };
  }

  if (ensAvatar) {
    return { avatar: ensAvatar, loading, error };
  }

  return { avatar: data?.image, loading, error };
}
