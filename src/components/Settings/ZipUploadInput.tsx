import log from "loglevel";
import React from "react";
import { toast } from "react-toastify";
import { importBackup } from "../../utils/exportImport";

export default function ZipUploadInput({ ...props }) {
  // log.debug("ZipUploadInput")
  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    log.debug("handleFileChange");
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/zip" && !file.name.endsWith(".zip")) {
      toast.error("Please select a valid .zip file.", { containerId: "toaster" });
      return;
    }

    await importBackup(file);
  }

  return (
    <input
      className="ZipUploadInput hidden"
      type="file"
      onChange={handleFileChange}
      accept=".zip,application/zip,application/x-zip-compressed"
      {...props}
    />
  );
}
