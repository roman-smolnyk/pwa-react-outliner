// import log from "loglevel";

export default function PlainTextContent({ children }: { children: string }) {
  // log.debug("PlainTextContent");
  if (children.endsWith("\n")) {
    children += "\n";
  }

  return <div className="whitespace-pre-wrap wrap-break-word leading-tight">{children}</div>;
}
