import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import Mark from "mark.js";
import { useEffect, useRef, useState } from "react";
import { scrollIntoView2, useDebouncedCallback } from "../etc/utilities";

function ButtonComponent({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button type="button" className={`cursor-pointer active:scale-90 transition text-gray-600 ${className ?? ""}`} {...props}>
      {children}
    </button>
  );
}

export function DocumentSearchComponent() {
  const refInput = useRef<HTMLInputElement | null>(null);
  const instancerRef = useRef<Mark | null>(null);

  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [markElements, setMarkElements] = useState<NodeListOf<Element> | Array<Element>>([]);

  // const currentDocumentId = useStore((state) => state.localConfig.currentDocumentId);

  const callback = useDebouncedCallback((query: string) => {
    const container = document.querySelector(".Document-scroll");
    if (container) {
      const instance = new Mark(container as HTMLElement);

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
  }, 200);

  useEffect(() => {
    callback(query);

    // Does not work for some reason
    return () => {
      if (instancerRef.current) {
        instancerRef.current.unmark();
      }
    };
  }, [query]);

  useEffect(() => {}, [query]);

  // const filteredNodes = useMemo(() => {
  //   if (!debouncedQuery.trim()) return [];

  //   const lowerQuery = debouncedQuery.toLowerCase();
  //   const nodeList = Array.from(TreeRoAPI.getNodes(currentDocumentId));

  //   return nodeList.filter((node) => node.content.toString().toLowerCase().includes(lowerQuery));
  // }, [debouncedQuery]);

  useEffect(() => {
    refInput.current?.focus();
  }, []);

  return (
    <div
      className="DocumentSearch min-w-xs
                mt-14 sm:mt-10
                px-5 sm:px-16 lg:px-32 xl:px-56 2xl:px-70
                "
    >
      <div className="flex items-center gap-2 text-base px-1">
        <input
          ref={refInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="flex-1 rounded px-2 py-1 min-w-0
                    border border-gray-300 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
        <div className="text-gray-500">{`${index}/${markElements?.length || 0}`}</div>
        <ButtonComponent
          onPointerDown={(e) => {
            e.preventDefault();
            if (index > 1) {
              const newIndex = index - 1;
              const element = markElements[newIndex - 1];
              const container = document.querySelector(".Document-scroll");
              if (element && container) {
                scrollIntoView2(element as HTMLElement, container as HTMLElement);
              }
              setIndex(newIndex);
            } else {
              const newIndex = markElements?.length || 0;
              const element = markElements[newIndex - 1];
              const container = document.querySelector(".Document-scroll");
              if (element && container) {
                scrollIntoView2(element as HTMLElement, container as HTMLElement);
              }
              setIndex(newIndex);
            }
          }}
        >
          <ArrowUpIcon />
        </ButtonComponent>
        <ButtonComponent
          onPointerDown={(e) => {
            e.preventDefault();

            if (index < markElements?.length || 0) {
              const newIndex = index + 1;
              const element = markElements[newIndex - 1];
              const container = document.querySelector(".Document-scroll");
              if (element && container) {
                console.log("ArrowDownIcon", index);
                scrollIntoView2(element as HTMLElement, container as HTMLElement);
              }
              setIndex(newIndex);
            } else {
              const newIndex = 1;
              const element = markElements[newIndex - 1];
              const container = document.querySelector(".Document-scroll");
              if (element && container) {
                console.log("ArrowDownIcon", index);
                scrollIntoView2(element as HTMLElement, container as HTMLElement);
              }
              setIndex(newIndex);
            }
          }}
        >
          <ArrowDownIcon />
        </ButtonComponent>
      </div>
    </div>
  );
}
