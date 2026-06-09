//
export default function Title({ title }: { title: string }) {
  return (
    <div className="Title w-full py-1 sm:py-0.5 select-none truncate" style={{ margin: "0px 6px" }}>
      {title}
    </div>
  );
}
