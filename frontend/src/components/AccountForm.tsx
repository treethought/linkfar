import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { buildIpfsUrl, uploadAccountData } from "@/lib/ipfs";
import CreateAccount from "./CreateAccount";
import { AccountData, useProfile } from "@/hooks/profile";
import { Pencil, X } from "lucide-react";
import { FrameContext } from "@farcaster/frame-sdk";
import { useSetSlug, useUpdateProfile } from "@/hooks/contract";

type FormProps = {
  profileSlug?: string;
  accountData?: AccountData;
  ctx?: FrameContext;
  onClose?: () => void;
};

export function AccountForm(props: FormProps) {
  const [cid, setCid] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sent, setSent] = useState(false);
  const { address } = useAccount();
  const { profile } = useProfile(address);
  const { writeContract: updateProfile, data: txHash, isPending } =
    useUpdateProfile();
  const setSlug = useSetSlug();

  const { onClose } = props;

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
  });

  const fcLinks: Record<string, string> = props.ctx?.user
    ? {
      "Farcaster": `https://warpcast.com/${props.ctx?.user?.username}`,
    }
    : {};

  const [localAccountData, setLocalAccountData] = useState<AccountData>({
    name: props.accountData?.name || props.ctx?.user.displayName || "",
    image: props.accountData?.image || props.ctx?.user.pfpUrl || "",
    description: props.accountData?.description || "",
    properties: props.accountData?.properties || fcLinks || {},
  });

  const [slug, setSlugField] = useState<string>(props.profileSlug || "");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentKey, setCurrentKey] = useState<string>("");
  const [currentValue, setCurrentValue] = useState<string>("");

  const [debouncedImage, setDebouncedImage] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localAccountData.image === debouncedImage) return;
      setDebouncedImage(localAccountData.image || "");
    }, 1000); // Adjust the debounce delay as needed

    return () => {
      clearTimeout(handler); // Cleanup on component unmount or value change
    };
  }, [localAccountData.image]);

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

    updateProfile([uri]);
    setSent(true);
  };

  const doSetSlug = async () => {
    if (!slug) {
      console.error("Slug cannot be empty");
      return;
    }
    try {
      console.log("Setting slug: ", slug);
      setSlug(slug);
      console.log("Slug set successfully");
    } catch (e) {
      console.error("Error setting slug: ", e);
    }
  };

  if (!profile || address === zeroAddress) {
    return <CreateAccount />;
  }

  return (
    <div className="flex flex-col w-full justify-center items-center gap-4 p-4">
      {/* Header / title of form */}
      <div className="flex flex-row justify-between items-center w-full">
        <h1 className="text font-bold text-lg">Edit Profile</h1>
        <button className="btn btn-sm" onClick={onClose}>
          <X />
        </button>
      </div>

      {/* Slug Field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Slug</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          value={slug}
          onChange={(e) => setSlugField(e.target.value)}
          placeholder="Enter slug"
        />
        <div className="label">
          <span className="label-text">
            {`https://linkfar.link/@${slug}`}
          </span>
        </div>

        <button className="btn btn-secondary mt-2" onClick={doSetSlug}>
          Set Slug
        </button>
      </div>

      {/* Avatar and Name Field */}
      <div className="flex flex-row justify-between items-center w-full">
        {debouncedImage.length > 8 && (
          <div className="avatar">
            <div className={`w-12 rounded-full`}>
              <img
                src={debouncedImage}
                className="rounded-full w-64"
              />
            </div>
          </div>
        )}
        <div className="form-control w-1/2">
          <label className="label">
            <span className="label-text">Avatar</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            value={localAccountData?.image || ""}
            onChange={(e) =>
              setLocalAccountData((prev) => ({
                ...prev,
                image: e.target.value,
              }))}
            placeholder="Enter avatar URL"
          />
        </div>

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

      <EditLinkModal
        isOpen={isModalOpen}
        mode={modalMode}
        currentKey={currentKey}
        currentValue={currentValue}
        onClose={closeModal}
        onSave={handleSaveModal}
        onDelete={handleDeleteItem}
        setKey={setCurrentKey}
        setValue={setCurrentValue}
      />
    </div>
  );
}

type EditLinkModalProps = {
  isOpen: boolean;
  mode: "add" | "edit";
  currentKey: string;
  currentValue: string;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  setKey: (key: string) => void;
  setValue: (value: string) => void;
};

export function EditLinkModal(props: EditLinkModalProps) {
  if (!props.isOpen) return null;

  return (
    <div className={`modal modal-open`}>
      <div className="modal-box">
        <div className="flex flex-row justify-between items-center">
          <h3 className="font-bold text-lg">
            {props.mode === "edit" ? "Edit Link" : "Add New Link"}
          </h3>
          <button
            className="btn btn-primary btn-ghost btn-sm"
            onClick={props.onClose}
          >
            <X />
          </button>
        </div>

        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Key</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            value={props.currentKey}
            onChange={(e) => props.setKey(e.target.value)}
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
            value={props.currentValue}
            onChange={(e) => props.setValue(e.target.value)}
            placeholder="Enter value"
          />
        </div>

        <div className="modal-action justify-between">
          <button className="btn btn-error" onClick={props.onDelete}>
            Delete
          </button>

          <button
            className="btn btn-primary btn-outline"
            onClick={props.onSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
