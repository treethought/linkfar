import { useCreateAccount } from "@/hooks/contract";
import { useAccount } from "wagmi";

export default function CreateAccount() {
  const { isConnected } = useAccount();
  const {writeContract: createAccount} = useCreateAccount();

  return (
    <button className="btn" onClick={() => createAccount()}>
      {isConnected ? "Mint Account" : "Connect to create Account"}
    </button>
  );
}
