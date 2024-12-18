import { linkFarAbi, transparentUpgradeableProxyAddress } from "@/generated";
import { useChainId, useWriteContract } from "wagmi";

export function useProxyAddress() {
  const chainId = useChainId();
  const c = chainId as keyof typeof transparentUpgradeableProxyAddress;
  return transparentUpgradeableProxyAddress[c];
}

export function useCreateAccount() {
  const { writeContract: write, data, isPending } = useWriteContract();
  const address = useProxyAddress();
  const writeContract = () => {
    write({
      abi: linkFarAbi,
      address: address,
      functionName: "mint",
      args: [""],
    });
  };
  return { writeContract, data, isPending };
}

export function useSetSlug() {
  const { writeContract } = useWriteContract();
  const address = useProxyAddress();
  const setSlug = (slug: string) => {
    writeContract({
      abi: linkFarAbi,
      address: address,
      functionName: "setSlug",
      args: [slug],
    });
  };
  return setSlug;
}

export function useUpdateProfile() {
  const { writeContract: write, data, isPending } = useWriteContract();
  const address = useProxyAddress();

  const writeContract = (args: [string]) => {
    write({
      abi: linkFarAbi,
      address: address,
      functionName: "updateProfile",
      args: args,
    });
  };

  return { writeContract, data, isPending };
}
