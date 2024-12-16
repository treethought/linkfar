import { useAccountAvatar } from "@/hooks/profile";
import Link from "next/link";

type Props = {
  address?: string;
  link?: string;
  className?: string;
};

export default function ProfileAvatar(props: Props) {
  const { avatar } = useAccountAvatar(props.address!);
  if (!avatar) {
    return null;
  }
  return (
    <div className="avatar">
      <div className={`w-12 rounded-full ${props.className}`}>
        {props.link
          ? (
            <Link href={props.link} passHref>
              <img
                src={avatar}
                alt={"pfp"}
                className="rounded-full"
              />
            </Link>
          )
          : (
            <img
              src={avatar}
              alt={"pfp"}
              className="rounded-full"
            />
          )}
      </div>
    </div>
  );
}
