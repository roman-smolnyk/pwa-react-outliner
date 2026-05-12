import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { toast } from "react-toastify";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { remarkHighlight } from "./markdownPlugins";

function CopyCodeButton({ textToCopy }: { textToCopy: string }) {
  return (
    <button
      type="button"
      className="CopyCodeButton absolute top-1 right-1 px-2 p-1 z-1 rounded-md cursor-pointer
                border border-gray-400 bg-white opacity-0 hover:opacity-100 transition-opacity duration-300 ease-in-out
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
          toast("Copied", { containerId: "toaster" });
        } catch (err) {
          toast.error("Failed to copy", { containerId: "toaster" });
          console.error("Failed to copy:", err);
        }
      }}
    >
      Copy
    </button>
  );
}

function SyntaxHighlighterPreTag(props: any) {
  // console.debug("SyntaxHighlighterPreTag");
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

const Markdown = memo(({ children }: { children: string }) => {
  console.debug("Markdown");

  // const [text, setText] = useState("");

  // useEffect(() => {
  //   (async () => {

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

  // setText(preProcessedMD);
  //   })();
  // }, [children]);

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
              <CopyCodeButton textToCopy={codeString} />
              {/* showLineNumbers */}
              <SyntaxHighlighter PreTag={SyntaxHighlighterPreTag} language={match?.[1] ? match[1] : ""}>
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
      {/* {text} */}
    </ReactMarkdown>
  );
});
Markdown.displayName = "Markdown";

export default Markdown;
