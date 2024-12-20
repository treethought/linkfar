"use client";

import Account from "@/components/Account";
import { useProfileBySlug } from "@/hooks/profile";
import { useEffect, useState } from "react";

export default function Profile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
    <div className="flex flex-col items-center gap-4 w-full">
      {hasProfile ? <Account address={profile?.owner} /> : "No profile"}
    </div>
  );
}
