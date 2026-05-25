import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import SyntaxHighlighter from "react-syntax-highlighter";
import { prism, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "react-toastify";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { copyToClipboard } from "../../api/api";
import { remarkHighlight } from "./markdownPlugins";

function CopyCodeButton({ textToCopy }: { textToCopy: string }) {
  return (
    <button
      type="button"
      className="CopyCodeButton absolute top-1 right-1 px-2 p-0.5 z-1 rounded cursor-pointer
                border border-gray-400 bg-background opacity-0 hover:opacity-100 active:opacity-100 transition-opacity duration-500 ease-in-out
                text-xs"
      onPointerDown={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await copyToClipboard(textToCopy);
        toast("Copied", { containerId: "toaster" });
      }}
    >
      Copy
    </button>
  );
}

function PreTag({ children, style, ...rest }: React.HTMLAttributes<HTMLPreElement>) {
  // log.debug("PreTag", { children, style, ...rest });
  const { color, background, textAlign, whiteSpace, wordSpacing, wordBreak, overflowWrap, tabSize, hyphens, overflow } = style!;
  return (
    <pre
      className="PreTag rounded py-1 px-2 my-1"
      // style={style}
      style={{
        color,
        background,
        textAlign,
        whiteSpace,
        wordSpacing,
        wordBreak,
        overflowWrap,
        tabSize,
        hyphens,
        overflow,
      }}
      onPointerDownCapture={(event) => {
        // log.debug("onPointerDown DIV");
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
          // log.debug("stopPropagation");
          // User is interacting with the scrollbar -> don't toggle edit mode
          event.stopPropagation();
        }
      }}
    >
      {children}
    </pre>
  );
}

function CodeTag({ children, style, ...rest }: React.HTMLAttributes<HTMLPreElement>) {
  // log.debug("CodeTag", { children, style, ...rest });
  return <code className="PrismCodeTag">{children}</code>;
}

const Markdown = memo(({ children, isDarkTheme }: { children: string; isDarkTheme: boolean }) => {
  // log.debug("Markdown", isDarkTheme);

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
          // log.debug("md-highlight", node, props);
          if (className?.includes("md-highlight")) {
            return <span {...props} className={`${className} bg-warning text-warning-foreground`} />;
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
          // log.info("className", className);
          // log.info("children", children);
          // log.info("rest", rest);

          const match = /language-(.+)/.exec(className || "");
          const isInline = match ? false : !String(children).endsWith("\n");
          // const codeString = String(children).trim().replace(/\n /g, "\n");
          const codeString = String(children)
            .split("\n")
            .map((line) => line.trimEnd().replace(/^ /, "")) // Removes exactly ONE leading space if it exists
            .join("\n")
            .trim(); // Cleans up the absolute top and bottom of the string

          // log.debug(JSON.stringify(String(children)));

          // log.debug("code", isInline, match, codeString);

          return !isInline ? (
            <div className="relative">
              <CopyCodeButton textToCopy={codeString} />
              {/* showLineNumbers */}
              <SyntaxHighlighter
                PreTag={PreTag}
                CodeTag={CodeTag}
                language={match?.[1] ? match[1] : ""}
                showLineNumbers={false}
                showInlineLineNumbers={false}
                // useInlineStyles={false}
                style={isDarkTheme ? vscDarkPlus : prism}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className={`InlineCode text-md inline-block px-1 my-1 rounded text-error bg-muted`}>{children}</code>
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
