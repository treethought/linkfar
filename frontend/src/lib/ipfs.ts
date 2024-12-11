import IPFSGatewayTools from "@pinata/ipfs-gateway-tools/dist/browser";
const gatewayTools = new IPFSGatewayTools();

const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "ipfs.io";

export const getCIDJson = async (uri: string) => {
  const url = toGatewayUrl(uri);
  console.log("Fetching CID JSON", url);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${uri}`);
  }
  return res.json();
};

export const uploadAccountData = async (
  data: any,
  meta: object,
) => {
  const body = {
    pinataMetadata: meta,
    pinataContent: data,
  };
  const bodyJson = JSON.stringify(body);
  console.log("Uploading data to Pinata", bodyJson);
  const res = await fetch(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: bodyJson,
    },
  );
  const json = await res.json();
  console.log("Uploaded data to Pinata", json);
  const { IpfsHash } = json;
  return IpfsHash;
};

export const parseCID = (uri: string): string => {
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "");
  }
  const { containsCid, cid } = gatewayTools.containsCID(uri);
  if (containsCid) {
    return cid;
  }
  return "";
};

export const toGatewayUrl = (uri: string) => {
  return gatewayTools.convertToDesiredGateway(
    uri,
    "https://" + gateway,
  );
};

export const buildIpfsUrl = (cid: string) => {
  return `ipfs://${cid}`;
};

export const toIpfsUrl = (uri: string) => {
  return gatewayTools.convertToDesiredGateway(uri, "ipfs://");
};
