"use client";
import Profile from "@/components/Profile";
import { useProfileBySlug } from "@/hooks/profile";
import { useEffect, useState } from "react";

export default function SlugProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const { profile } = useProfileBySlug(slug || "");

  useEffect(() => {
    console.log("params", params);
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
      <Profile address={profile?.owner} />
    </div>
  );
}
