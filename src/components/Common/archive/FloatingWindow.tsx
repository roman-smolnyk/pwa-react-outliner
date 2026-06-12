import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";

export function FloatingWindow({ isOpen, setIsOpen, children }: { isOpen: boolean; setIsOpen: (open: boolean) => void; children: React.ReactNode }) {
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  // Handle interactions (click to open, escape key/outside click to close)
  const click = useClick(context);
  const dismiss = useDismiss(context, {
    outsidePressEvent: "mousedown",
  });
  const role = useRole(context, { role: "dialog" });

  const { getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    isOpen && (
      <FloatingPortal>
        <FloatingOverlay lockScroll className="fixed p-0 sm:p-10 bg-black/40 z-20 inset-0 flex items-center justify-center">
          <FloatingFocusManager context={context}>
            <div
              ref={refs.setFloating}
              {...getFloatingProps()}
              className="w-full h-full max-w-4xl sm:max-h-[85vh] bg-popover text-popover-foreground border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col"
            >
              {children}
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      </FloatingPortal>
    )
  );
}
