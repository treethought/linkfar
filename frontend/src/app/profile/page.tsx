"use client";
import { useAccount } from "wagmi";

import Profile from "@/components/Profile";

export default function ProfilePage() {
  const { address } = useAccount();
  return <Profile address={address} />;
}
