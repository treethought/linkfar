import { useInFrame } from "@/hooks/frame";
import farcasterFrame from "@farcaster/frame-wagmi-connector";
import { useAccount, useConnect } from "wagmi";

export default function FrameConnectButton() {
  const { inFrame } = useInFrame();
  const { connect } = useConnect();
  const { isConnected } = useAccount();

  if (!inFrame || isConnected) {
    return null;
  }

  return (
    <button
      className="btn btn-primary"
      onClick={() => connect({ connector: farcasterFrame() })}
    >
      Frame Login
    </button>
  );
}
