"use client";
import { useAccount } from "wagmi";

import ConnectButton from "@/components/ConnectButton";
import Account from "@/components/Account";
import { useProfileBySlug } from "@/hooks/profile";
import { useEffect, useState } from "react";

export default function Profile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { isConnected } = useAccount();
  const [slug, setSlug] = useState<string | null>(null);
  const { profile, hasProfile } = useProfileBySlug(slug || "");

  useEffect(() => {
    const getSlug = async () => {
      const slug = (await params).slug;
      setSlug(slug);
    };
    if (!slug) {
      getSlug();
    }
  }, [params]);

  return (
    <div className="w-full h-screen mx-auto py-4 px-1">
      <div className="flex flex-col items-center gap-4 ">
        <div className="flex flex-row w-full justify-between items-center gap-4 px-2">
          <h1 className="text-2xl font-bold text-center mb-4 primary-content">
            LinkFar
          </h1>
          {isConnected && (
            <div className="mb-4 ">
              <ConnectButton />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 w-full">
        {hasProfile ? <Account address={profile?.owner} /> : "No profile"}
      </div>
    </div>
  );
}
