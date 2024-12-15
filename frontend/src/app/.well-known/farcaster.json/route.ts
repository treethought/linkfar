export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    frame: {
      version: "0.0.1",
      name: "LinkFar",
      iconUrl: `${appUrl}/icon.png`,
      splashImageUrl: `${appUrl}/icon.png`,
      splashBackgroundColor: "#f7f7f7",
      homeUrl: appUrl,
      // webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
