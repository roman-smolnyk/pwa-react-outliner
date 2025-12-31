import {
  ArrowDownIcon,
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  ArrowUpIcon,
  CalendarDays,
  CloudAlertIcon,
  CloudCheckIcon,
  ListChecksIcon,
  MoveIcon,
  PanelLeftIcon,
  // EllipsisVerticalIcon,
  PencilIcon,
  PencilOffIcon,
  RedoIcon,
  RefreshCwIcon,
  RotateCwIcon,
  SearchIcon,
  SquarePlusIcon,
  // ZoomInIcon,
  Trash2Icon,
  UndoIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { TreeRoAPI } from "../api";
import { useReadOnly } from "../etc/readonlyContext";
import { useKeyboardOffset } from "../etc/utilities";
import { useStore } from "../stateStore";
import MainMenuComponent from "./menusComp";

function ButtonComponent({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button type="button" className={`cursor-pointer active:scale-90 transition text-gray-600 ${className ?? ""}`} {...props}>
      {children}
    </button>
  );
}

export function HeaderComponent() {
  const { readOnly, setReadOnly } = useReadOnly();

  const explorerIsOpened = useStore((state) => state.explorerIsOpened);
  const wsStatus = useStore((state) => state.wsStatus);

  return (
    <div
      className="Header fixed top-0 right-0 min-h-8 overflow-x-auto overflow-y-hidden z-50
      bg-white shadow-[0_1px_5px_rgba(0,0,0,0.15)]"
      style={{ left: `${explorerIsOpened ? "var(--sidebar-width)" : "0px"}` }}
    >
      <div className="px-2 py-3 md:py-1 flex items-center">
        {/* Left icons */}
        <div className="flex items-center gap-2">
          {!explorerIsOpened && (
            <ButtonComponent
              onClick={() => {
                TreeRoAPI.useStore.setState({ explorerIsOpened: true });
              }}
            >
              <PanelLeftIcon />
            </ButtonComponent>
          )}
          <div></div>
          <ButtonComponent
            onClick={() => {
              TreeRoAPI.Yjs.undoManager?.undo();
            }}
          >
            <UndoIcon />
          </ButtonComponent>
          <ButtonComponent
            onClick={() => {
              TreeRoAPI.Yjs.undoManager?.redo();
            }}
          >
            <RedoIcon />
          </ButtonComponent>
          <div></div>
          <ButtonComponent
            onClick={(event) => {
              event.currentTarget.classList.add("animate-spin");
              window.location.replace(window.location.href);
            }}
          >
            <RotateCwIcon />
          </ButtonComponent>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-3" />

        {/* Right icons */}
        <div className="flex ml-auto items-center gap-2">
          <ButtonComponent
            onClick={() => {
              toast(`WS Server status: ${wsStatus}`, {
                containerId: "main",
                className: "min-h-0! h-10! w-60! rounded-xl! top-5! md:top-0! right-5! md:right-0!",
              });
            }}
          >
            {wsStatus === "connecting" && <CloudAlertIcon />}
            {wsStatus === "connected" && <CloudCheckIcon />}
            {wsStatus === "disconnected" && <RefreshCwIcon className="animate-spin" />}
          </ButtonComponent>

          <ButtonComponent className="text-yellow-400">
            <ListChecksIcon />
          </ButtonComponent>

          {readOnly ? (
            <ButtonComponent onClick={() => setReadOnly(false)}>
              <PencilOffIcon />
            </ButtonComponent>
          ) : (
            <ButtonComponent onClick={() => setReadOnly(true)}>
              <PencilIcon />{" "}
            </ButtonComponent>
          )}

          <ButtonComponent className="text-yellow-400">
            <SearchIcon />
          </ButtonComponent>

          {/* <EllipsisVerticalIcon /> */}
          <MainMenuComponent />
        </div>
      </div>
    </div>
  );
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
          <ButtonComponent
            className="UnindentNode"
            onPointerDown={(e) => {
              e.preventDefault();
              TreeRoAPI.uiUnindentNode(TreeRoAPI.useStore.getState().activeNodeId);
            }}
          >
            <ArrowLeftToLineIcon />
          </ButtonComponent>

          <ButtonComponent
            className="IndentNode"
            onPointerDown={(e) => {
              e.preventDefault();
              TreeRoAPI.uiIndentNode(TreeRoAPI.useStore.getState().activeNodeId);
            }}
          >
            <ArrowRightToLineIcon />
          </ButtonComponent>

          <ButtonComponent
            className="MoveNodeUp"
            onPointerDown={(e) => {
              e.preventDefault();
              TreeRoAPI.uiMoveNodeUp(TreeRoAPI.useStore.getState().activeNodeId);
            }}
          >
            <ArrowUpIcon />
          </ButtonComponent>

          <ButtonComponent
            className="MoveNodeDown"
            onPointerDown={(e) => {
              e.preventDefault();
              TreeRoAPI.uiMoveNodeDown(TreeRoAPI.useStore.getState().activeNodeId);
            }}
          >
            <ArrowDownIcon />
          </ButtonComponent>

          <ButtonComponent
            className="AddNode"
            onPointerDown={(e) => {
              e.preventDefault();
              const activeNodeId = TreeRoAPI.useStore.getState().activeNodeId;
              const newNodeId = TreeRoAPI.insertNewNodeAfter(activeNodeId);
              // console.debug("onPointerDown", { activeNodeId, newNodeId });
              if (newNodeId) {
                TreeRoAPI.useStore.getState().activateNode(newNodeId);
              }
            }}
          >
            <SquarePlusIcon />
          </ButtonComponent>

          <ButtonComponent className="text-yellow-400">
            <MoveIcon />
          </ButtonComponent>

          <ButtonComponent className="text-yellow-400">
            <CalendarDays />
          </ButtonComponent>

          <ButtonComponent
            // text-red-600
            className="DeleteNode"
            onPointerDown={(e) => {
              e.preventDefault();
              TreeRoAPI.deleteNode(TreeRoAPI.useStore.getState().activeNodeId);
            }}
          >
            <Trash2Icon />
          </ButtonComponent>
        </div>
      </div>
    </div>
  );
}
