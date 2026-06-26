import { Button } from "@/components/ui/button";
import { SpinnerCustom } from "@/components/ui/spinner";
import { useConfirm } from "@/contexts/ConfirmationContext";
import log from "loglevel";
import { handleLogout, handlePWAUpdate, handleReload } from "../../api/api";
import useStore from "../../store/useStore";

export default function LoadingScreen() {
  log.debug("LoadingScreen");

  const loadingScreenMessage = useStore((s) => s.loadingScreenMessage);

  const confirm = useConfirm();

  return (
    <div data-component="LoadingScreen" className="h-screen w-screen flex flex-col items-center justify-center gap-5">
      <SpinnerCustom />
      {/* <LoaderIcon className="animate-spin [animation-duration:2s]" size={50} /> */}
      {loadingScreenMessage && (
        <div className="flex flex-col content-center justify-center gap-4">
          <div className="pt-5 text-center">{loadingScreenMessage}</div>
          <div className="flex justify-center gap-2">
            <Button onClick={handleReload}>Reload</Button>
            <Button onClick={handlePWAUpdate}>Update</Button>
            <Button
              onClick={async () => {
                if (await confirm("All data on this device will be wiped", "Are you sure?")) {
                  handleLogout();
                }
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
