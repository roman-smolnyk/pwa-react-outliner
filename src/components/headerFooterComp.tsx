import {
  ArrowDownIcon,
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  ArrowUpIcon,
  CalendarDays,
  // RefreshCwIcon,
  CloudCheckIcon,
  ListChecksIcon,
  MoveIcon,
  PanelLeftIcon,
  // EllipsisVerticalIcon,
  PencilIcon,
  PencilOffIcon,
  RedoIcon,
  RotateCwIcon,
  SearchIcon,
  // CloudAlertIcon,
  SquarePlusIcon,
  // ZoomInIcon,
  Trash2Icon,
  UndoIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { TreeRoAPI } from "../api";
import { useReadOnly } from "../etc/readonlyContext";
import { useStore } from "../stateStore";
import MainMenuComponent from "./menuComp";

function ButtonComponent({ children, onClick }: { children: React.ReactNode; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button className="cursor-pointer active:scale-90 transition" type="button" onClick={onClick}>
      {children}
    </button>
  );
}

export function HeaderComponent() {
  const { readOnly, setReadOnly } = useReadOnly();

  const explorerIsOpened = useStore((state) => state.explorerIsOpened);

  return (
    <div
      className="Header fixed top-0 right-0 min-h-8 overflow-x-auto z-50
      bg-white shadow-[0_1px_5px_rgba(0,0,0,0.15)]"
      style={{ left: `${explorerIsOpened ? "var(--sidebar-width)" : "0px"}` }}
    >
      <div className="px-2 py-3 md:py-1 flex items-center">
        {/* Left icons */}
        <div className="flex items-center gap-2">
          {!explorerIsOpened && (
            <ButtonComponent
              onClick={(_) => {
                TreeRoAPI.useStore.setState({ explorerIsOpened: true });
              }}
            >
              <PanelLeftIcon className="text-gray-600" />
            </ButtonComponent>
          )}
          <div></div>
          <ButtonComponent
            onClick={(_) => {
              TreeRoAPI.Yjs.undoManager.undo();
            }}
          >
            <UndoIcon className="text-gray-600" />
          </ButtonComponent>
          <ButtonComponent
            onClick={(_) => {
              TreeRoAPI.Yjs.undoManager.redo();
            }}
          >
            <RedoIcon className="text-gray-600" />
          </ButtonComponent>
          <div></div>
          <ButtonComponent
            onClick={(event) => {
              event.currentTarget.classList.add("animate-spin");
              window.location.replace(window.location.href);
            }}
          >
            <RotateCwIcon className="text-gray-600" />
          </ButtonComponent>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-3" />

        {/* Right icons */}
        <div className="flex ml-auto items-center gap-2">
          {/* <RefreshCwIcon className="text-gray-600 animate-spin" /> */}
          {/* <CloudAlertIcon className="text-gray-600" /> */}
          <CloudCheckIcon className="text-gray-600" />
          <ListChecksIcon className="text-gray-600" />
          {readOnly ? (
            <ButtonComponent
              onClick={(_) => {
                setReadOnly(false);
              }}
            >
              <PencilOffIcon className="text-gray-600" />
            </ButtonComponent>
          ) : (
            <ButtonComponent
              onClick={(_) => {
                setReadOnly(true);
              }}
            >
              <PencilIcon className="text-gray-600" />{" "}
            </ButtonComponent>
          )}

          <SearchIcon className="text-gray-600" />
          {/* <EllipsisVerticalIcon className="text-gray-600" /> */}
          <MainMenuComponent />
        </div>
      </div>
    </div>
  );
}

export function useKeyboardOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!window.visualViewport) return;

    const vv = window.visualViewport;

    const update = () => {
      const overlap = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));

      setOffset(overlap);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return offset;
}

export function FooterComponent() {
  const keyboardOffset = useKeyboardOffset();

  const explorerIsOpened = useStore((state) => state.explorerIsOpened);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 min-h-8
                 overflow-x-auto
                 bg-white shadow-[0_-1px_5px_rgba(0,0,0,0.15)]
                 flex items-center"
      style={{
        transform: `translateY(-${keyboardOffset}px)`,
        paddingBottom: "env(safe-area-inset-bottom)",
        left: `${explorerIsOpened ? "var(--sidebar-width)" : "0px"}`,
      }}
    >
      <div className="w-full px-2 m-3 md:m-1 flex items-center justify-center gap-2">
        <div className="flex gap-2 flex-nowrap min-w-max">
          <div onPointerDown={(e) => e.preventDefault()}>
            <ButtonComponent>
              <ArrowLeftToLineIcon className="text-gray-600" />
            </ButtonComponent>
          </div>

          <ArrowRightToLineIcon className="text-gray-600" />
          <ArrowUpIcon className="text-gray-600" />
          <ArrowDownIcon className="text-gray-600" />
          <SquarePlusIcon className="text-gray-600" />
          <MoveIcon className="text-gray-600" />
          <CalendarDays className="text-gray-600" />
          <Trash2Icon className="text-gray-600" />
        </div>
      </div>
    </div>
  );
}
