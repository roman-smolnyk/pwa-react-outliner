import debounce from "lodash/debounce";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import Mark from "mark.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { scrollIntoView } from "../../utils/utilities";
import IconedButton from "../Common/IconedButton";
import Input from "../Common/Input";
import LucideIcon from "../Common/LucideIcon";

export default function PageSearch() {
  const refInput = useRef<HTMLInputElement | null>(null);
  const instancerRef = useRef<Mark | null>(null);

  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [markElements, setMarkElements] = useState<NodeListOf<Element> | Array<Element>>([]);

  const debouncedCallback = useCallback(
    debounce((query: string) => {
      const container = document.querySelector(".Page");
      if (!container) return;

      const instance = new Mark(container as HTMLElement);
      instancerRef.current = instance;

      if (query.length < 2) {
        instance.unmark({
          done: () => {
            setMarkElements([]);
            setIndex(0);
          },
        });
        return;
      }

      instance.unmark({
        done: () => {
          instance.mark(query, {
            done: () => {
              const elements = document.querySelectorAll("mark[data-markjs='true']");
              setMarkElements(elements);
              setIndex(elements.length > 0 ? 1 : 0);
            },
            exclude: ["[data-no-mark]"],
            className: "bg-warning px-0.5 rounded shadow transition-all duration-200", // Added transition
          });
        },
      });
    }, 250),
    [],
  );

  useEffect(() => {
    debouncedCallback(query);
    return () => {
      instancerRef.current?.unmark();
    };
  }, [query, debouncedCallback]);

  useEffect(() => {
    markElements.forEach((el) => {
      el.classList.remove("scale-105", "ring-2", "ring-ring");
    });

    if (index > 0 && markElements[index - 1]) {
      const activeElement = markElements[index - 1];

      activeElement.classList.add("scale-105", "ring-2", "ring-foreground");
    }
  }, [index, markElements]);

  useEffect(() => {
    refInput.current?.focus();
  }, []);

  const totalMatches = markElements?.length || 0;

  return (
    <div
      className="PageSearch fixed top-15 sm:top-11 right-0 flex items-center justify-center"
      style={{
        left: `var(--explorer-width)`,
      }}
    >
      <div
        className="min-w-xs max-w-xl w-full p-2 mx-5
                  rounded-lg text-popover-foreground bg-popover border border-border
                  flex items-center gap-2"
      >
        <Input placeholder="Search..." ref={refInput} value={query} onChange={(e) => setQuery(e.target.value)} />

        <div className="Counter min-w-15 flex items-center justify-center">
          <div className="text-muted-foreground">{`${index}/${totalMatches}`}</div>
        </div>

        <IconedButton
          disabled={totalMatches === 0}
          onPointerDown={(e) => {
            e.preventDefault();
            if (totalMatches === 0) return;

            let newIndex = index - 1;
            if (newIndex < 1) newIndex = totalMatches;

            const element = markElements[newIndex - 1];
            const container = document.querySelector(".PageContainer");
            if (element && container) {
              scrollIntoView(element as HTMLElement, container as HTMLElement);
            }
            setIndex(newIndex);
          }}
        >
          <LucideIcon icon={<ArrowUpIcon />} />
        </IconedButton>

        <IconedButton
          disabled={totalMatches === 0}
          onPointerDown={(e) => {
            e.preventDefault();
            if (totalMatches === 0) return;

            let newIndex = index + 1;
            if (newIndex > totalMatches) newIndex = 1;

            const element = markElements[newIndex - 1];
            const container = document.querySelector(".PageContainer");
            if (element && container) {
              scrollIntoView(element as HTMLElement, container as HTMLElement);
            }
            setIndex(newIndex);
          }}
        >
          <LucideIcon icon={<ArrowDownIcon />} />
        </IconedButton>
      </div>
    </div>
  );
}
