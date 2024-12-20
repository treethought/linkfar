import { useInFrame } from "@/hooks/frame";
import sdk from "@farcaster/frame-sdk";

type Props = {
  href: string;
  passHref?: boolean;
  children: React.ReactNode;
};

export default function Link(props: Props) {
  const { inFrame } = useInFrame();

  const openUrl = (url: string) => {
    sdk.actions.openUrl(url);
  };

  if (inFrame) {
    return (
      <div onClick={() => openUrl(props.href)}>
        {props.children}
      </div>
    );
  }
  return (
      <a
        href={props.href}
        target="_blank"
      >
        {props.children}
      </a>
  );
}
