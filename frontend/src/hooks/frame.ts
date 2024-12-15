import sdk, { FrameContext } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";

export function useFrameContext() {
  const [isLoaded, setLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();

  useEffect(() => {
    const load = async () => {
      setContext(await sdk.context);
      sdk.actions.ready();
    };
    if (sdk && !isLoaded) {
      setLoaded(true);
      load();
    }
  }, [isLoaded]);
  return { context };
}

export function useInFrame() {
  const { context } = useFrameContext();
  return {
    inFrame: !!context?.user,
  };
}
