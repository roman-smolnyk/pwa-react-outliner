import { buildPagesAsMarkdownDocs } from "esm-treero-api";
import * as Y from "yjs";
import yjs from "../store/yjsManager";
import JSZip from "jszip";
import log from "loglevel";
import { reload } from "@/api/api";

export function downloadExport() {
  const zip = new JSZip();

  // BACKUP
  // @ts-ignore
  const update = Y.encodeStateAsUpdate(yjs.ydoc);
  const blob = new Blob([update as BlobPart], { type: "application/octet-stream" });
  zip.file("treero-backup.bin", blob);

  // JSON
  zip.file("account.json", JSON.stringify(yjs.yaccount.toJSON()));
  zip.file("blocks.json", JSON.stringify(yjs.yblocks.toJSON()));
  zip.file("explorer.json", JSON.stringify(yjs.yexplorer.toJSON()));

  // MARKDOWN
  const result = buildPagesAsMarkdownDocs(yjs.ydoc);
  for (const [key, value] of Object.entries(result)) {
    zip.file(`${key}.md`, value);
  }

  // Generate ZIP (in memory)
  zip.generateAsync({ type: "blob" }).then((zipBlob) => {
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "treero-export.zip";
    a.click();
    URL.revokeObjectURL(url);
  });
}

export async function importBackup(file: File) {
  try {
    const zip = await JSZip.loadAsync(file);

    const backupFile = zip.file("treero-backup.bin");
    if (!backupFile) {
      throw new Error("Invalid backup: 'treero-backup.bin' not found in ZIP.");
    }

    const updateArray = await backupFile.async("uint8array");

    await yjs.applyBackup(updateArray);

    yjs.idbPersistence?.whenSynced.then(() => {
      reload();
    });
  } catch (error) {
    log.error("Failed to restore backup:", error);
  }
}
