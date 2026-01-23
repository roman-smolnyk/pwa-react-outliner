import { expose } from "comlink";
// import { unified } from "unified";
// import remarkParse from "remark-parse";
// import remarkRehype from "remark-rehype";
// import rehypeStringify from "rehype-stringify";
// import remarkHtml from "remark-html";

import { marked } from "marked";

async function renderMarkdown(markdown: string): Promise<string> {
  // console.debug("renderMarkdown");

  // const html = DOMPurify.sanitize(marked.parse(content));
  return await marked.parse(markdown);

  // const result = await unified().use(remarkParse).process(markdown);
  // console.debug("renderMarkdown", result);
  // const result = await unified().use(remarkParse).use(remarkRehype).use(remarkHtml).process(markdown);

  // return result.toString();
  // return `<div>${markdown}</div>`;
}

expose({ renderMarkdown });
