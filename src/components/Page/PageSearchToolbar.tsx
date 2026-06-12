import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import debounce from "lodash/debounce";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import Mark from "mark.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { scrollIntoView } from "../../utils/utilities";
import { Input } from "@/components/ui/input";
import FloatingToolbar from "../Common/FloatingToolbar";

export default function PageSearchToolbar() {
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
    <FloatingToolbar className="PageSearchToolbar">
      <Input placeholder="Search..." ref={refInput} value={query} onChange={(e) => setQuery(e.target.value)} />

      <div className="Counter text-muted-foreground flex items-center justify-center">{`${index}/${totalMatches}`}</div>

      <Button
        variant="ghost"
        size="icon"
        title="Previous"
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
        <ArrowUpIcon />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        title="Next"
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
        <ArrowDownIcon />
      </Button>
    </FloatingToolbar>
  );
}
