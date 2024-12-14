declare module "@pinata/ipfs-gateway-tools/dist/browser" {
  export default class IPFSGatewayTools {
    containsCID(uri: string): { containsCid: boolean; cid: string };
    convertToDesiredGateway(uri: string, gateway: string): string;
  }
}
