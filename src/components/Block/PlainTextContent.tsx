export default function PlainTextContent({ children }: { children: string }) {
  if (children.endsWith("\n")) {
    children += "\n";
  }

  return <div className="whitespace-pre-wrap wrap-break-word leading-tight">{children}</div>;
}
