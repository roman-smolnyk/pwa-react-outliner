import { wrap } from "comlink";

export type WorkerApi = {
  renderMarkdown: (markdown: string) => Promise<string>;
};

// const worker = new Worker(new URL("./webworker.ts", import.meta.url), { type: "module" });

// export const markdownWorker = wrap<WorkerApi>(worker);

const SIZE = Math.min(navigator.hardwareConcurrency ?? 4, 4);

const pool = Array.from({ length: SIZE }, () => wrap<WorkerApi>(new Worker(new URL("./webworker.ts", import.meta.url), { type: "module" })));

let i = 0;
export function getMarkdownWorker() {
  const w = pool[i];
  i = (i + 1) % pool.length;
  return w;
}
