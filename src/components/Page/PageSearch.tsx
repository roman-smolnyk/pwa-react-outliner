import { debounce } from "lodash";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import Mark from "mark.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { scrollIntoView } from "../../utils/utilities";
import Button from "../Common/Button";

export default function PageSearch() {
  const refInput = useRef<HTMLInputElement | null>(null);
  const instancerRef = useRef<Mark | null>(null);

  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [markElements, setMarkElements] = useState<NodeListOf<Element> | Array<Element>>([]);

  const debouncedCallback = useCallback(
    debounce((query: string) => {
      if (query.length < 2) return;
      const container = document.querySelector(".Page");
      if (container) {
        const instance = new Mark(container as HTMLElement);
        instancerRef.current = instance;

        instance.unmark({
          done: () => {
            instance.mark(query, {
              done: () => {
                setMarkElements(document.querySelectorAll("mark[data-markjs='true']"));
              },
              exclude: ["[data-no-mark]"],
              className: "bg-yellow-300 text-black px-0.5 rounded-sm shadow-sm",
            });
          },
        });
      }
    }, 250),
    [],
  );

  useEffect(() => {
    debouncedCallback(query);
    return () => {
      instancerRef.current?.unmark();
    };
  }, [instancerRef, query]);

  useEffect(() => {
    refInput.current?.focus();
  }, []);

  return (
    <div
      className="PageSearch fixed top-15 sm:top-11 right-0 flex items-center justify-center"
      style={{
        left: `var(--explorer-width)`,
      }}
    >
      <div className="min-w-xs max-w-xl w-full p-2 mx-5 rounded bg-white  flex items-center gap-2">
        <input
          className="flex-1 rounded px-2 py-1 min-w-0
                    border border-gray-300 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          ref={refInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
        />
        <div className="Counter min-w-15 flex items-center justify-center">
          <div className="text-gray-500">{`${index}/${markElements?.length || 0}`}</div>
        </div>
        <Button
          onPointerDown={(e) => {
            e.preventDefault();
            if (index > 1) {
              const newIndex = index - 1;
              const element = markElements[newIndex - 1];
              const container = document.querySelector(".PageContainer");
              if (element && container) {
                scrollIntoView(element as HTMLElement, container as HTMLElement);
              }
              setIndex(newIndex);
            } else {
              const newIndex = markElements?.length || 0;
              const element = markElements[newIndex - 1];
              const container = document.querySelector(".PageContainer");
              if (element && container) {
                scrollIntoView(element as HTMLElement, container as HTMLElement);
              }
              setIndex(newIndex);
            }
          }}
        >
          <ArrowUpIcon />
        </Button>
        <Button
          onPointerDown={(e) => {
            e.preventDefault();
            if (index < markElements?.length || 0) {
              const newIndex = index + 1;
              const element = markElements[newIndex - 1];
              const container = document.querySelector(".PageContainer");
              if (element && container) {
                scrollIntoView(element as HTMLElement, container as HTMLElement);
              }
              setIndex(newIndex);
            } else {
              const newIndex = 1;
              const element = markElements[newIndex - 1];
              const container = document.querySelector(".PageContainer");
              if (element && container) {
                scrollIntoView(element as HTMLElement, container as HTMLElement);
              }
              setIndex(newIndex);
            }
          }}
        >
          <ArrowDownIcon />
        </Button>
      </div>
    </div>
  );
}
