export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    "accountAssociation": {
      "header":
        "eyJmaWQiOjQ2NDksInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg3QzVGZTZkMzg3ODZBOUFlNDAzNTIwNTA5ZjU0MkEyODM3NTFBRjkyIn0",
      "payload": "eyJkb21haW4iOiJsaW5rZmFyLmxpbmsifQ",
      "signature":
        "MHhiY2VhMzE4NzMxMWE2N2Q3NWViMmNkODU3OTQxMmFhNzlmMTBiNDhlY2M3YzNlZGUzZTAzNTkwZmRmOTcwNTMwMTgyYzRlMTBiYzA0YjgzYTMwZTBjZjJiY2FiYzljMGM5OThiNjI0Zjg4MTRmMTgwZWM3ZmUwOGFiNjMyMTZmMjFi",
    },
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
