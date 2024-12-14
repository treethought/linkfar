import { linkFarAbi } from "@/generated";
import { useEffect, useState } from "react";
import { getAddress, zeroAddress } from "viem";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { buildIpfsUrl, uploadAccountData } from "@/lib/ipfs";
import ConnectButton, { truncMiddle } from "./ConnectButton";
import CreateAccount from "./CreateAccount";
import { AccountData, useProfile } from "@/hooks/profile";
import { useWriteLinkFarUpdateProfile } from "@/generated";

type FormProps = {
  accountData?: AccountData;
  onClose?: () => void;
};

export function AccountForm(props: FormProps) {
  const [cid, setCid] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [sent, setSent] = useState(false);
  const { address } = useAccount();
  const { profile } = useProfile(address);
  const { writeContract, data: txHash, isPending } =
    useWriteLinkFarUpdateProfile();

  const { data: receipt, isLoading: isConfirming, error: txError } =
    useWaitForTransactionReceipt({
      hash: txHash,
      confirmations: 1,
    });

  const [localAccountData, setLocalAccountData] = useState<AccountData>({
    name: props.accountData?.name || "",
    description: props.accountData?.description || "",
    properties: props.accountData?.properties || {},
  });

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
      const updatedProperties = { ...prev.properties };
      delete updatedProperties[currentKey];
      return { ...prev, properties: updatedProperties };
    });
    closeModal();
  };

  const handleSaveModal = () => {
    setLocalAccountData((prev) => {
      const updatedProperties = { ...prev.properties };
      if (modalMode === "edit") {
        delete updatedProperties[currentKey];
        updatedProperties[currentKey] = currentValue;
      } else if (modalMode === "add") {
        updatedProperties[currentKey] = currentValue;
      }
      return { ...prev, properties: updatedProperties };
    });
    closeModal();
  };

  const upload = async () => {
    console.log("uploading data");
    setUploading(true);
    setError(null);
    try {
      const metadata = {
        name: localAccountData.name || address,
        // description: localAccountData.description || "",
        keyvalues: {
          owner: profile?.owner || "",
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
      args: [uri],
    });
    setSent(true);
  };

  if (!profile || address === zeroAddress) {
    return <CreateAccount />;
  }

  return (
    <div className="flex flex-col w-full justify-center items-center gap-4 p-4 border border-pink-50">
      {/* Name Field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-bold text-lg">Account Name</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          value={localAccountData.name}
          onChange={(e) =>
            setLocalAccountData((prev) => ({
              ...prev,
              name: e.target.value,
            }))}
          placeholder="Enter account name"
        />
      </div>

      {/* Description Field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium text-md">Description</span>
        </label>
        <textarea
          className="textarea textarea-bordered"
          value={localAccountData.description}
          onChange={(e) =>
            setLocalAccountData((prev) => ({
              ...prev,
              description: e.target.value,
            }))}
          placeholder="Enter account description"
        />
      </div>

      {/* Properties */}
      {!(localAccountData?.properties)
        ? (
          <button
            className="btn btn-primary"
            onClick={() => openModal("add")}
          >
            Add First Link
          </button>
        )
        : (
          Object.entries(localAccountData.properties).map(([key, value]) => (
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

      {localAccountData.properties && (
        <button
          className="btn btn-outline w-full"
          onClick={() => openModal("add")}
        >
          Add Link
        </button>
      )}

      {uploading && <span className="loading loading-ring"></span>}

      {(localAccountData.properties && !uploading && !cid) && (
        <button className="btn btn-primary w-full" onClick={upload}>
          Upload
        </button>
      )}

      {(sent && isPending) && <span className="loading loading-bars"></span>}

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

      {/* Modal */}
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
