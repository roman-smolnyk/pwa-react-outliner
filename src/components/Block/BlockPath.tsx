import { traverseBlockPath } from "esm-treero-api";
import yjs from "../../store/yjsManager";
import PlainMarkdown from "../Markdown/PlainMarkdown";
import useZustandStore from "../../store/useZustandStore";
import { openBlock } from "../../api/api";

export function BlockPathPart({ id, text }: { id: string; text: string }) {
  return (
    <span className="text-sm text-gray-500 inline-flex items-center">
      <span
        className="hover:underline cursor-pointer max-w-30 truncate"
        onClick={() => {
          openBlock(id);
        }}
      >
        <PlainMarkdown>{text}</PlainMarkdown>
      </span>
      <span className="mx-1">/</span>
    </span>
  );
}

export default function BlockPath({ id }: { id: string }) {
  const yblocksArray = traverseBlockPath(yjs.ydoc, id);

  return (
    <div className="mb-5">
      {yblocksArray.map((item, idx) => {
        // biome-ignore lint/suspicious/noArrayIndexKey: explanation
        return <BlockPathPart key={`BlockPathPart-${idx}`} id={item.get("id")} text={item.get("content").toString()} />;
      })}
    </div>
  );
}
