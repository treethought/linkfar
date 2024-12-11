import { accountAbi } from "@/generated";
import { useEffect, useState } from "react";
import { getAddress, zeroAddress } from "viem";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { buildIpfsUrl, uploadAccountData } from "@/lib/ipfs";
import ConnectButton, { truncMiddle } from "./ConnectButton";
import { useAccountContract, useAccountData } from "@/hooks/account";
import CreateAccount from "./CreateAccount";
type AccountData = {
  Links: Record<string, string>;
};

export default function Account() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <ConnectButton />;
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <AccountDataView />
    </div>
  );
}

function AccountDataView() {
  const { accountContract } = useAccountContract();
  const { data, loading, error } = useAccountData();
  const [isEditing, setIsEditing] = useState(false);

  if (!accountContract || accountContract === zeroAddress) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 h-full">
        <span className="loading loading-lg">Loading</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <div className="flex-1">
          <label>Error:</label>
          {error.message}
        </div>
      </div>
    );
  }

  if (!data?.Links) {
    return (
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex flex-row justify-center items-center gap-4">
          <h1>Account Contract</h1>
          <pre>{truncMiddle(accountContract, 8)}</pre>
        </div>
        <AccountForm accountData={data} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full justify-center items-center gap-4 ">
      {isEditing
        ? <AccountForm accountData={data} onClose={() => setIsEditing(false)} />
        : (
          <div className="flex flex-col gap-4">
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
        )}
      <button className="btn" onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? "Done" : "Edit"}
      </button>
    </div>
  );
}

type FormProps = {
  accountData?: AccountData;
  onClose?: () => void;
};

function AccountForm(props: FormProps) {
  const [cid, setCid] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [sent, setSent] = useState(false);
  const { accountContract } = useAccountContract();
  const { writeContract, data: txHash, isPending } = useWriteContract();

  // useWaitForTransaction to wait for the transaction to be mined
  const { data: receipt, isLoading: isConfirming, error: txError } =
    useWaitForTransactionReceipt({
      hash: txHash, // Pass the transaction hash
      confirmations: 3,
    });

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

  useEffect(() => {
    if (receipt?.transactionHash) {
      console.log("transaction mined: ", receipt);
      props.onClose && props.onClose();
      return;
    }
    if (txError) {
      console.error("error: ", error);
      setError(error);
    }
  }, [receipt, txError]);

  const handleDeleteItem = () => {
    setLocalAccountData((prev) => {
      const updatedLinks = { ...prev.Links };
      delete updatedLinks[currentKey];
      return { ...prev, Links: updatedLinks };
    });
    closeModal();
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
    setSent(true);
  };

  if (!accountContract || accountContract === zeroAddress) {
    return <CreateAccount />;
  }

  return (
    <div className="flex flex-col w-full justify-center items-center gap-4 p-4 border border-pink-50">
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

      {Object.keys(localAccountData.Links).length > 0 && (
        <button
          className="btn btn-outline w-full"
          onClick={() => openModal("add")}
        >
          Add Link
        </button>
      )}

      {uploading && <span className="loading loading-ring"></span>}

      {(localAccountData.Links && !uploading && !cid) && (
        <button className="btn btn-primary w-full" onClick={upload}>
          Upload
        </button>
      )}

      {(sent || isConfirming) && <span className="loading loading-bars"></span>}

      {error && (
        <div className="alert alert-error">
          <div className="flex-1">
            <label>Error:</label>
            {error.message}
          </div>
        </div>
      )}

      {sent && txError && (
        <div className="alert alert-error">
          <div className="flex-1">
            <label>Error:</label>
            {txError.message}
          </div>
        </div>
      )}

      {!sent && cid && (
        <button
          className="btn btn-accent w-full"
          onClick={() => setUri()}
        >
          Save
        </button>
      )}

      {/* Modal (Always rendered, controlled visibility) */}
      <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
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
            <div className="flex flex-row gap-1 justify-end">
              <div>
                <button className="btn btn-error" onClick={handleDeleteItem}>
                  Delete
                </button>
              </div>
              <div>
                <button className="btn btn-primary" onClick={handleSaveModal}>
                  Save
                </button>
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
