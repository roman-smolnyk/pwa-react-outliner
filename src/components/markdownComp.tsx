// import Markdown from "react-markdown";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
// import { MarkdownHooks } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { toast } from "react-toastify";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { remarkHighlight } from "../etc/markdownPlugins";
// import { getMarkdownWorker } from "../webworkerClient";

function ButtonCopyCodeComponent({ textToCopy }: { textToCopy: string }) {
  return (
    <button
      type="button"
      className="absolute top-1 right-1 px-2 p-1 z-5 rounded-md cursor-pointer
                border border-gray-400 bg-white opacity-0 hover:opacity-100 transition-opacity 
                text-xs"
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onPointerUp={async (e) => {
        // console.debug("onPointerUp -> Copy");
        e.preventDefault();
        e.stopPropagation();
        // toast.dismiss();
        try {
          await navigator.clipboard.writeText(textToCopy);
          toast("Copied", {
            containerId: "main",
            className: "min-h-0! h-10! w-30! rounded-xl! top-5! sm:top-0! right-5! sm:right-0!",
          });
        } catch (err) {
          toast.error("Failed to copy");
          console.error("Failed to copy:", err);
        }
      }}
    >
      Copy
    </button>
  );
}

function SyntaxHighlighterPreTagComponent(props: any) {
  // console.debug("SyntaxHighlighterPreTagComponent");
  return (
    <div
      className="p-2! rounded-lg text-base! sm:text-[0.95rem]! bg-gray-100!"
      {...props}
      onPointerDownCapture={(event) => {
        // console.debug("onPointerDown DIV");
        const el = event.currentTarget;
        const rect = el.getBoundingClientRect();

        const scrollbarX = event.clientY > rect.bottom - 16; // horizontal scrollbar height
        const scrollbarY = event.clientX > rect.right - 16; // vertical scrollbar width

        const style = window.getComputedStyle(event.currentTarget);
        const overflowY = style.overflowY;
        const overflowX = style.overflowX;

        const hasVerticalScroll = event.currentTarget.scrollHeight > event.currentTarget.clientHeight;
        const hasHorizontalScroll = event.currentTarget.scrollWidth > event.currentTarget.clientWidth;

        const canScrollY = hasVerticalScroll && (overflowY === "auto" || overflowY === "scroll");
        const canScrollX = hasHorizontalScroll && (overflowX === "auto" || overflowX === "scroll");

        if ((canScrollX || canScrollY) && (scrollbarX || scrollbarY)) {
          // console.debug("stopPropagation");
          // User is interacting with the scrollbar → don't toggle edit mode
          event.stopPropagation();
        }
      }}
    />
  );
}

export const MarkdownComponent = memo(({ children }: { children: string }) => {
  // console.debug("MarkdownComponent");
  // Replaces all \n in code blocks with \n{whitespace} so in next block it won't be affected
  const markdownText = String(children);
  let preProcessedMD = markdownText.replace(/```[\s\S]*?```/g, (m) => m.replace(/\n/g, "\n ")).replace(/\$\$[\s\S]*?\$\$/g, (m) => m);
  // ```code``` forgiving, but maybe teach user to add newlines
  // preProcessedMD = preProcessedMD.replace(/```([^\n`]+)```/g, "```\n$1\n```");

  // Convert \n\n 2+ into "&nbsp;\n " except if next is list *-
  preProcessedMD = preProcessedMD.replace(/(?<=\n)(?![*-])\n/g, "&nbsp;\n ");
  // Preserve trailing
  if (preProcessedMD.endsWith("\n") || preProcessedMD.endsWith("\n ")) {
    preProcessedMD = `${preProcessedMD}<br>`;
  }
  // For exactly 2 newlines
  // preprocessedContent = preprocessedContent.replace(/(?<!\n)\n\n(?!\n)(?![*-])/g, "&nbsp;\n ");
  // For 3+ newlines
  // preprocessedContent = preprocessedContent.replace(/(\n\n)\n+(?![*-])/g, "$1&nbsp;\n ");
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks, remarkMath, remarkHighlight]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      // fallback={<div>Rendering markdown…</div>}
      components={{
        span({ node, className, ...props }) {
          // console.debug("md-highlight", node, props);
          if (className?.includes("md-highlight")) {
            return <span {...props} className={`${className} bg-yellow-200`} />;
          }
          return <span {...props} className={className} />;
        },
        input(props) {
          // Always normalize checked to boolean
          const { checked, ...rest } = props;
          return <input {...rest} checked={!!checked} readOnly />;
        },
        code(props) {
          // ...rest
          const { children, className } = props;
          // console.info("className", className);
          // console.info("children", children);
          // console.info("rest", rest);

          const match = /language-(\w+)/.exec(className || "");
          const isInline = match ? false : !String(children).endsWith("\n");
          const codeString = String(children).replace(/\n$/, "");

          // const CustomDiv = (props) => <div className="p-2! rounded-lg" {...props} />;

          // console.debug("MarkdownComponent.code", isInline, match, codeString);

          return !isInline ? (
            <div className="relative">
              <ButtonCopyCodeComponent textToCopy={codeString} />
              {/* showLineNumbers */}
              <SyntaxHighlighter PreTag={SyntaxHighlighterPreTagComponent} language={match?.[1] ? match[1] : ""}>
                {codeString}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className={`px-1 rounded-md text-red-600 bg-gray-100 text-[1rem] sm:text-[0.9rem]`}>{children}</code>
          );
        },
      }}
    >
      {/* {nodeContent.replace(/\n/gi, '\n &nbsp;')} */}
      {preProcessedMD}
    </ReactMarkdown>
  );
});
MarkdownComponent.displayName = "MarkdownComponent";

export const PlainMarkdownComponent = memo(({ children }: { children: string }) => {
  return (
    <ReactMarkdown
      components={{
        // block elements
        p: ({ children }) => <>{children}</>,
        h1: ({ children }) => <>{children}</>,
        h2: ({ children }) => <>{children}</>,
        h3: ({ children }) => <>{children}</>,
        h4: ({ children }) => <>{children}</>,
        h5: ({ children }) => <>{children}</>,
        h6: ({ children }) => <>{children}</>,
        li: ({ children }) => <>{children} </>,
        ul: ({ children }) => <>{children}</>,
        ol: ({ children }) => <>{children}</>,
        blockquote: ({ children }) => <>{children}</>,
        pre: ({ children }) => <>{children}</>,

        // inline elements
        strong: ({ children }) => <>{children}</>,
        em: ({ children }) => <>{children}</>,
        del: ({ children }) => <>{children}</>,
        code: ({ children }) => <>{children}</>,
        a: ({ children }) => <>{children}</>,
        img: () => null,

        // tables
        table: ({ children }) => <>{children}</>,
        thead: ({ children }) => <>{children}</>,
        tbody: ({ children }) => <>{children}</>,
        tr: ({ children }) => <>{children}</>,
        td: ({ children }) => <>{children} </>,
        th: ({ children }) => <>{children} </>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
});
PlainMarkdownComponent.displayName = "PlainMarkdownComponent";

// export const MarkdownComponent2 = ({ children }) => {
//   console.debug("MarkdownComponent2", Date.now());
//   const [html, setHtml] = useState("");

//   // useEffect(() => {
//   //   let cancelled = false;

//   //   (async () => {
//   //     const result = await getMarkdownWorker().renderMarkdown(children);
//   //     if (!cancelled) setHtml(result);
//   //   })();

//   //   return () => {
//   //     cancelled = true;
//   //   };
//   // }, [children]);

//   // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
//   return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
// };
