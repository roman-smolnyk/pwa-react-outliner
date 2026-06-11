import { autoUpdate, flip, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import type { Placement } from "@floating-ui/react-dom";
import React, { useState } from "react";
import IconedButton from "./IconedButton";
import LucideIcon from "./LucideIcon";
import { EllipsisVerticalIcon } from "lucide-react";

export default function FloatingMenu({
  children,
  trigger,
  placement = "bottom-start",
  offsetValue = 10,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  trigger?: React.ReactElement<React.HTMLProps<HTMLElement> & { ref?: React.Ref<any> }>;
  placement?: Placement;
  offsetValue?: number;
  className?: string;
} & React.ComponentPropsWithoutRef<"button">) {
  // Combined inline here
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    middleware: [offset(offsetValue), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, { event: "click" });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const defaultTrigger = (
    <IconedButton className={className} {...props}>
      <LucideIcon icon={<EllipsisVerticalIcon />} />
    </IconedButton>
  );

  const triggerToRender = trigger || defaultTrigger;

  const clonedTrigger = React.cloneElement(triggerToRender, {
    ref: refs.setReference,
    ...getReferenceProps(triggerToRender.props),
  });

  return (
    <>
      {clonedTrigger}

      {isOpen && (
        <FloatingPortal>
          <div
            className="FloatingMenu py-1 text-popover-foreground bg-popover border border-border rounded shadow-lg z-50 flex flex-col"
            style={floatingStyles}
            ref={refs.setFloating}
            {...getFloatingProps()}
            onClick={() => setIsOpen(false)}
          >
            {children}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
