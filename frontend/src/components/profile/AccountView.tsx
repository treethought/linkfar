import { AccountData, Profile } from "@/hooks/profile";
import Link from "@/components/Link";
import Avatar from "@/components/profile/Avatar";

export type Props = {
  profileAddress?: string;
  accountData: AccountData;
  profile: Profile;
};

export default function AccountView(props: Props) {
  return (
    <>
      <div className="flex flex-col w-full justify-center items-center gap-4">
        <Avatar src={props.accountData?.image} className="w-28" />
        <article className="prose text-center">
          <h2>{props.accountData?.name}</h2>
          <p>{props.accountData?.description}</p>
        </article>
      </div>
      <div className="divider" />
      <div className="flex flex-col gap-4">
        {props.accountData?.properties &&
          Object.entries(props.accountData?.properties).map(([key, value]) => (
            value && (
              <Link
                key={key}
                href={value}
              >
                <button className="btn btn-primary w-64">
                  {key}
                </button>
              </Link>
            )
          ))}
      </div>
    </>
  );
}
