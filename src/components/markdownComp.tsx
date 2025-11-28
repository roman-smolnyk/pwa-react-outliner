import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { toast } from "react-toastify";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { remarkHighlight } from "../etc/markdownPlugins";

function ButtonCopyCodeComponent({ textToCopy }: { textToCopy: string }) {
  return (
    <button
      onPointerDown={async (e) => {
        console.debug("onPointerDown -> Copy");
        e.preventDefault();
        e.stopPropagation();
        toast.dismiss();
        try {
          await navigator.clipboard.writeText(textToCopy);
          toast("Copied", {
            // style: {
            //   width: "200px",
            //   height: "50px",
            //   padding: "0px",
            //   margin: "0px",
            //   fontSize: "0.85rem",
            // },
          });
        } catch (err) {
          toast.error("Failed to copy");
          console.error("Failed to copy:", err);
        }
      }}
      type="button"
      className="cursor-pointer absolute top-1 right-1 px-2 p-1
                 text-xs rounded-md 
                opacity-0 hover:opacity-100 transition-opacity 
                 border border-gray-400 bg-white"
    >
      Copy
    </button>
  );
}

function SyntaxHighlighterPreTagComponent({ props }: { props: any }) {
  return (
    <div
      className="p-2! rounded-lg"
      {...props}
      onPointerDownCapture={(event) => {
        console.debug("onPointerDown DIV");
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
          console.debug("stopPropagation");
          // User is interacting with the scrollbar → don't toggle edit mode
          event.stopPropagation();
        }
      }}
    />
  );
}

export function MarkdownComponent({ children }: { children: string }) {
  // Replaces all \n in code blocks with \n{whitespace} so in next block it won't be affected
  const markdownText = String(children);
  let preProcessedMD = markdownText.replace(/```[\s\S]*?```/g, (m) => m.replace(/\n/g, "\n "));
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
    <Markdown
      remarkPlugins={[remarkGfm, remarkBreaks, remarkMath, remarkHighlight]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{
        span({ node, className, ...props }) {
          // console.debug("md-highlight", node, props);
          if (className?.includes("md-highlight")) {
            return <span {...props} className={`${className} bg-yellow-200 px-1`} />;
          }
          return <span {...props} />;
        },
        input(props) {
          // Always normalize checked to boolean
          const { checked, ...rest } = props;
          return <input {...rest} checked={!!checked} readOnly />;
        },
        code(props) {
          const { children, className, ...rest } = props;
          // console.info("className", className);
          // console.info("children", children);
          // console.info("rest", rest);

          const match = /language-(\w+)/.exec(className || "");
          const isInline = match ? false : !String(children).endsWith("\n");
          // console.debug("children", `"${String(children).replace("\n", "\\n")}"`, className, rest);
          const codeString = String(children).replace(/\n$/, "");

          // const CustomDiv = (props) => <div className="p-2! rounded-lg" {...props} />;

          return !isInline ? (
            <div className="relative">
              <ButtonCopyCodeComponent textToCopy={codeString} />
              {/* showLineNumbers */}
              <SyntaxHighlighter PreTag={SyntaxHighlighterPreTagComponent} language={match?.[1] ? match[1] : ""}>
                {codeString}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className={`${className} px-1 rounded-md text-red-600 bg-gray-100`}>{children}</code>
          );
        },
      }}
    >
      {/* {nodeContent.replace(/\n/gi, '\n &nbsp;')} */}
      {preProcessedMD}
    </Markdown>
  );
}
