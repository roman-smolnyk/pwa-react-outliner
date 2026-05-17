import { LoaderIcon } from "lucide-react";
import useZustandStore from "../../store/useZustandStore";
import { logout } from "../../api/api";
import LucideIcon from "../Common/LucideIcon";

export default function Spinner() {
  console.debug("Spinner");

  const loadingScreenInfo = useZustandStore((s) => s.loadingScreenInfo);
  const isLoadingScreenShowExit = useZustandStore((s) => s.isLoadingScreenShowExit);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-5">
      <LucideIcon className="size-13! animate-spin [animation-duration:2s]">
        <LoaderIcon />
      </LucideIcon>
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
