import { useWriteRegistryCreateAccount } from "@/generated";
import { useAccount } from "wagmi";

export default function CreateAccount() {
  const { isConnected } = useAccount();
  const { writeContract } = useWriteRegistryCreateAccount();
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
