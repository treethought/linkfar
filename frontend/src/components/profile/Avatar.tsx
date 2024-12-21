import Link from "next/link";

type Props = {
  src?: string;
  link?: string;
  className?: string;
};

export default function Avatar(props: Props) {
  if (!props.src) {
    return null;
  }
  return (
    <div className="avatar">
      <div className={`w-12 rounded-full ${props.className}`}>
        {props.link
          ? (
            <Link href={props.link} passHref>
              <img
                src={props.src}
                alt={"pfp"}
                className="rounded-full"
              />
            </Link>
          )
          : (
            <img
              src={props.src}
              alt={"pfp"}
              className="rounded-full"
            />
          )}
      </div>
    </div>
  );
}
