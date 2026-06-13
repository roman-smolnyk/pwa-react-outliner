import { memo } from "react";
import ReactMarkdown from "react-markdown";

const PlainMarkdown = memo(function PlainMarkdown({ children }: { children: string }) {
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
        hr: () => null,
      }}
    >
      {children}
    </ReactMarkdown>
  );
});
PlainMarkdown.displayName = "PlainMarkdown";

export default PlainMarkdown;
