import { useSwitchChain } from "wagmi";

export default function ChainSwitcher() {
  const { chains, switchChain } = useSwitchChain();
  return (
    <div className="dropdown mb-2">
      <div tabIndex={0} role="button" className="btn btn-ghost m-1">
        Chains
        <svg
          width="12px"
          height="12px"
          className="inline-block h-2 w-2 fill-current opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z">
          </path>
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-2xl"
      >
        {chains.map((chain) => (
          <li key={chain.id}>
            <button
              className="btn btn-ghost"
              onClick={() => switchChain({ chainId: chain.id })}
            >
              {chain.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
