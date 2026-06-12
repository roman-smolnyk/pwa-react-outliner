//
export default function Title({ title }: { title: string }) {
  return (
    <div className="Title w-full py-1 select-none truncate">
      {title}
    </div>
  );
}
