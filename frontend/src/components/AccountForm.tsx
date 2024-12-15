import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { buildIpfsUrl, uploadAccountData } from "@/lib/ipfs";
import CreateAccount from "./CreateAccount";
import { AccountData, useProfile } from "@/hooks/profile";
import { useWriteLinkFarUpdateProfile } from "@/generated";
import { Pencil, X } from "lucide-react";

type FormProps = {
  accountData?: AccountData;
  onClose?: () => void;
};

export function AccountForm(props: FormProps) {
  const [cid, setCid] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sent, setSent] = useState(false);
  const { address } = useAccount();
  const { profile } = useProfile(address);
  const { writeContract, data: txHash, isPending } =
    useWriteLinkFarUpdateProfile();

  const { onClose } = props;

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
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
      if (onClose) onClose();
      return;
    }
    if (txError) {
      console.error("error: ", txError);
      setError(txError);
    }
  }, [receipt, txError, onClose]);

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
      if (e instanceof Error) {
        setError(e);
      } else {
        setError(new Error("Failed to upload data"));
      }
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
    <div className="flex flex-col w-full justify-center items-center gap-4 p-4">
      {/* Header / title of form */}
      <div className="flex flex-row justify-between items-center w-full">
        <h1 className="text font-bold text-lg">Edit Profile</h1>
        <button
          className="btn btn-sm"
          onClick={onClose}
        >
          <X />
        </button>
      </div>

      {/* Name Field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Display Name</span>
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

      {/* Bio Field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium text-md">Bio</span>
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
      <div className="flex flex-col w-full gap-8">
        <div className="flex flex-row justify-between items-end w-full">
          <h3 className="font-bold text-md pb-4">Links</h3>
          <button
            className="btn btn-outline btn-md"
            onClick={() => openModal("add")}
          >
            Add Link
          </button>
        </div>
        {localAccountData.properties &&
          Object.entries(localAccountData.properties).map(([key, value]) => (
            <div key={key} className="flex gap-2 items-center w-full">
              <span className="w-1/3 text-sm font-medium">{key}</span>
              <span className="grow">{value}</span>
              <button
                className="btn btn-tertiary btn-sm"
                onClick={() =>
                  openModal("edit", key, value)}
              >
                <Pencil />
              </button>
            </div>
          ))}
      </div>
      <div className="divider" />

      {uploading && <span className="loading loading-ring"></span>}

      <div className="flex flex-row justify-center w-full">
        {(localAccountData.properties && !uploading && !cid) && (
          <button className="btn " onClick={upload}>
            Upload
          </button>
        )}

        {!sent && cid && (
          <button
            className="btn btn-accent w-1/2"
            onClick={() => setUri()}
          >
            Save
          </button>
        )}
      </div>

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

      {/* Modal */}
      <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <div className="flex flex-row justify-between items-center">
            <h3 className="font-bold text-lg">
              {modalMode === "edit" ? "Edit Link" : "Add New Link"}
            </h3>

            <button
              className="btn btn-primary btn-ghost btn-sm"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
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
          <div className="modal-action justify-between">
            <div className="flex">
              <button className="btn btn-error" onClick={handleDeleteItem}>
                Delete
              </button>
            </div>
            <div>
              <div>
                <button
                  className="btn btn-primary btn-outline"
                  onClick={handleSaveModal}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
