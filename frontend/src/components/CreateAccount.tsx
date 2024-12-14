import { useWriteLinkFarMint } from "@/generated";
import { useAccount } from "wagmi";

export default function CreateAccount() {
  const { isConnected } = useAccount();
  const { writeContract } = useWriteLinkFarMint();
  const createAccount = () => {
    console.log("creating account");
    writeContract({
      args: ["test"],
    });
  };

  return (
    <button className="btn" onClick={() => createAccount()}>
      {isConnected ? "Create Account" : "Connect to create Account"}
    </button>
  );
}
