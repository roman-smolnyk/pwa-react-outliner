import log from "loglevel";
import React from "react";
import { toast } from "react-toastify";
import { importBackup } from "../../utils/exportImport";

const ZipUploadInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ ...props }, ref) => {
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
      ref={ref}
      onChange={handleFileChange}
      accept=".zip,application/zip,application/x-zip-compressed"
      {...props}
    />
  );
});

export default ZipUploadInput;
