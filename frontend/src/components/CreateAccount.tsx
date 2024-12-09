import { registryAddress, useWriteRegistryCreateAccount } from "@/generated";
import { useAccount, useBlockNumber, useChainId } from "wagmi";

export default function CreateAccount() {
  const { isConnected } = useAccount();
  const { writeContract } = useWriteRegistryCreateAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const chainId = useChainId({});

  const createAccount = () => {
    console.log("creating account");
    writeContract({
      args: [],
    });
  };

  return (
    <button className="btn" onClick={() => createAccount()}>
      {isConnected ? "Create Account" : "Connect to create Account"}
    </button>
  );
}
