import {
  accountAbi,
  useReadAccountUri,
  useReadRegistryAccounts,
} from "@/generated";
import { useEffect, useState } from "react";
import { getAddress, zeroAddress } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { buildIpfsUrl, getCIDJson, uploadAccountData } from "@/lib/pinata";
import { truncMiddle } from "./ConnectButton";
type AccountData = {
  Links: Record<string, string>;
};

function useAccountContract() {
  const { address } = useAccount();
  const { data: accountContract } = useReadRegistryAccounts({
    account: address,
    args: [address || zeroAddress],
  });
  return { accountContract };
}

function useAccountUri() {
  const { accountContract } = useAccountContract();
  const { data: uri, isLoading, error } = useReadAccountUri({
    address: accountContract,
    args: [],
  });
  return { uri, isLoading, error };
}

export default function Account() {
  const { isConnected } = useAccount();
  const { accountContract } = useAccountContract();

  if (!isConnected) {
    return (
      <div className="flex flex-col justify-center items-center gap-4">
        <h1>Connect to view account</h1>
      </div>
    );
  }

  if (!accountContract) {
    return (
      <div className="flex flex-col justify-center items-center gap-4">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <h1>Account</h1>
      <div>
        <span>
          Account Contract : {truncMiddle(accountContract, 8)}
        </span>
      </div>
      <br />
      <AccountDataView />
    </div>
  );
}

function AccountDataView() {
  const { accountContract } = useAccountContract();
  const { uri } = useAccountUri();
  const [data, setData] = useState<AccountData | undefined>();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!uri) {
      return;
    }
    const getData = async () => {
      console.log("getting data for uri: ", uri);
      const data = await getCIDJson(uri);
      setData(data);
    };

    getData();
  }, [uri]);
  if (!accountContract) {
    return <div>Account Contract not found</div>;
  }
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <div className="flex flex-row justify-center items-center gap-4">
        <h2 className="text-xl font-bold">Account Links</h2>
        <button className="btn" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Done" : "Edit"}
        </button>
      </div>
      {isEditing && <AccountForm accountData={data} />}
      {data?.Links && Object.entries(data?.Links).map(([key, value]) => (
        <a
          key={key}
          href={value}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary w-64"
        >
          {key}
        </a>
      ))}
    </div>
  );
}

type FormProps = {
  accountData?: AccountData;
};

function AccountForm(props: FormProps) {
  const [cid, setCid] = useState<string | null>(null);
  const [uriUpdated, setUriUpdated] = useState<boolean | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const { accountContract } = useAccountContract();
  const { writeContract } = useWriteContract();

  // Local state for editable account data
  const [localAccountData, setLocalAccountData] = useState(
    props.accountData || { Links: {} },
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentKey, setCurrentKey] = useState<string>("");
  const [currentValue, setCurrentValue] = useState<string>("");

  const openModal = (mode: "add" | "edit", key = "", value = "") => {
    setModalMode(mode);
    setCurrentKey(key);
    setCurrentValue(value);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentKey("");
    setCurrentValue("");
  };

  const handleSaveModal = () => {
    setLocalAccountData((prev) => {
      const updatedLinks = { ...prev.Links };
      if (modalMode === "edit") {
        delete updatedLinks[currentKey];
        updatedLinks[currentKey] = currentValue;
      } else if (modalMode === "add") {
        updatedLinks[currentKey] = currentValue;
      }
      return { ...prev, Links: updatedLinks };
    });
    closeModal();
  };

  const upload = async () => {
    console.log("uploading data");
    setUploading(true);
    setError(null);
    try {
      const metadata = {
        name: "Account Data",
        keyvalues: {
          accountContract: accountContract || "",
        },
      };

      const cidRes = await uploadAccountData(localAccountData, metadata);
      console.log("cid: ", cidRes);
      setCid(cidRes);
    } catch (e) {
      console.error("error uploading data: ", e);
      setError(e);
    } finally {
      setUploading(false);
    }
  };

  const setUri = () => {
    if (!cid) {
      console.error("no cid to set");
      return;
    }
    const uri = buildIpfsUrl(cid);
    console.log("setting uri: ", uri);

    writeContract({
      abi: accountAbi,
      address: getAddress(accountContract || zeroAddress),
      functionName: "setUri",
      args: [uri],
    });
  };

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <h2 className="text-lg font-bold">Edit Account Links</h2>

      {/* Show Add First Link Button if localAccountData.Links is empty */}
      {Object.keys(localAccountData.Links).length === 0
        ? (
          <button
            className="btn btn-primary"
            onClick={() => openModal("add")}
          >
            Add First Link
          </button>
        )
        : (
          // Render existing links
          Object.entries(localAccountData.Links).map(([key, value]) => (
            <div key={key} className="flex gap-2 items-center w-full">
              <span className="w-1/3 text-sm font-medium">{key}</span>
              <span className="grow">{value}</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  openModal("edit", key, value)}
              >
                Edit
              </button>
            </div>
          ))
        )}

      {/* Add Link Button */}
      {Object.keys(localAccountData.Links).length > 0 && (
        <button
          className="btn btn-outline w-full"
          onClick={() => openModal("add")}
        >
          Add Link
        </button>
      )}

      {!(uploading || cid) && (
        <button className="btn btn-primary w-full" onClick={upload}>
          Upload
        </button>
      )}

      {cid && !uriUpdated && (
        <button
          className="btn btn-accent w-full"
          onClick={() => setUri()}
        >
          Save
        </button>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {modalMode === "edit" ? "Edit Link" : "Add New Link"}
            </h3>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Key</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={currentKey}
                onChange={(e) => setCurrentKey(e.target.value)}
                placeholder="Enter key"
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Value</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="Enter value"
              />
            </div>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleSaveModal}>
                Save
              </button>
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
