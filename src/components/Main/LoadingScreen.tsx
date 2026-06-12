import log from "loglevel";
import { logout } from "../../api/api";
import useStore from "../../store/useStore";

import { SpinnerCustom } from "@/components/ui/spinner";

export default function LoadingScreen() {
  log.debug("Spinner");

  const loadingScreenInfo = useStore((s) => s.loadingScreenInfo);
  const isLoadingScreenShowExit = useStore((s) => s.shouldShowLoadingScreenExit);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-5">
      <SpinnerCustom />
      {/* <LoaderIcon className="animate-spin [animation-duration:2s]" size={50} /> */}
      <div className="px-10">{loadingScreenInfo}</div>
      {isLoadingScreenShowExit && (
        <button
          className="min-w-30 p-2 rounded cursor-pointer
                      hover:scale-105 active:scale-100 transition-transform"
          type="button"
          onClick={() => {
            if (confirm("All data on this device will be wiped. Are you sure?")) {
              logout();
            }
          }}
        >
          Exit
        </button>
      )}
    </div>
  );
}
