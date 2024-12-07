import { useReadLock, useWriteLock } from "@/generated";
import { useReadContract } from "wagmi";

//const getRemainingTime = () => {
//  const { data: remaining } = useReadContract({
//    contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
//    contractName: "Lock",
//    functionName: "remainingTime",
//    args: [],
//  })
//}
//
export default function Lock() {
  const { data } = useReadLock({
    functionName: "timeRemaining",
    args: [],
  });
  const { writeContract } = useWriteLock();

  const withdraw = () => {
    writeContract({
      functionName: "withdraw",
      args: [],
    });
  };

  return (
    <div>
      <h1>Lock</h1>
      <span>Time Remaining: {data}</span>
      <button className="btn" onClick={() => withdraw()}>
        Withdraw
      </button>
    </div>
  );
}
