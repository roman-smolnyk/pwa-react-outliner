export default function Title({ title, setIsEdit }: { title: string; setIsEdit: (v: boolean) => void }) {
  return (
    <div
      className="Title w-full cursor-pointer select-none truncate"
      style={{ margin: "0px 6px" }}
      onClick={() => {
        // setIsEdit(true);
      }}
    >
      {title}
    </div>
  );
}
