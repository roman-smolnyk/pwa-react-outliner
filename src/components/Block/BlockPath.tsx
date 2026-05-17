import { traverseItemPath } from "esm-treero-api";
import { handleBlockOpen } from "../../api/api";
import yjs from "../../store/yjsManager";
import PlainMarkdown from "../Markdown/PlainMarkdown";

export function BlockPathPart({ id, text }: { id: string; text: string }) {
  return (
    <div className="text-sm text-theme-fg-muted flex items-center">
      <span
        className="inline-block hover:underline cursor-pointer min-h-5 min-w-10 max-w-30 truncate"
        onClick={async () => {
          await handleBlockOpen(id);
        }}
      >
        <PlainMarkdown>{text}</PlainMarkdown>
      </span>
      <span className="mx-1">/</span>
    </div>
  );
}

export default function BlockPath({ id }: { id: string }) {
  // const yblocksArray = traverseBlockPath(yjs.ydoc, id);
  const yblocksArray = traverseItemPath(yjs.yblocks, id);

  console.debug("BlockPath", yblocksArray);

  return (
    <div className="BlockPath mb-5 flex flex-wrap items-center">
      {yblocksArray.map((item, idx) => {
        return <BlockPathPart key={`BlockPathPart-${idx}`} id={item.get("id")} text={item.get("content").toString()} />;
      })}
    </div>
  );
}
