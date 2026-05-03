import useZustandStore from "../../store/useZustandStore";
import Page from "./Page";

export default function PageWin() {
  const rootId = useZustandStore((state) => state.rootId);

  return (
    <div className="PageWin relative z-1 min-w-xs min-h-0 flex flex-col">
      <div
        className="flex-1 overflow-y-auto overscroll-y-contain
                 px-5 sm:px-16 lg:px-32 xl:px-56 2xl:px-70
                 pt-12 pb-100
                 "
        // style={{
        //   height: `calc(100dvh - 2.5rem)`, // example if header/footer 2.5rem each
        // }}
      >
        <Page rootId={rootId} />
      </div>
      <div className="Spacer mb-12 sm:mb-8" />
    </div>
  );
}
