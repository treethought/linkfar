import { Metadata } from "next";
import Home from "@/components/Home";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Open LinkFar",
    action: {
      type: "launch_frame",
      name: "LinkFar",
      url: appUrl,
      splashImageUrl: `${appUrl}/icon.svg`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "LinkFar",
    openGraph: {
      title: "LinkFar",
      description: "Bring your links to Farcaster",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Page() {
  return <Home />;
}
