// 
export default function Title({ title }: { title: string }) {
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
