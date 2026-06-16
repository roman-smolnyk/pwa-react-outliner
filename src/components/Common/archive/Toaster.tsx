import { ToastContainer } from "react-toastify";

export default function Toaster() {
  return (
    <ToastContainer
      containerId="toaster"
      position="top-right"
      autoClose={3_000}
      hideProgressBar={true}
      closeButton={false}
      closeOnClick={true}
      draggable={false}
      limit={3}
      style={{ top: 60 }}
      toastClassName={(context) => {
        // log.debug("context", context);
        return `max-w-xs min-w-3xs min-h-0 
                px-4 py-2.5 mb-2 mr-3 
                bg-card text-card-foreground text-sm 
                rounded border border-border shadow 
                break-words leading-snug
                ${context?.type === "error" && "text-error"}
                ${context?.type === "warning" && "text-warning"}
                ${context?.type === "success" && "text-success"}
                ${context?.type === "info" && "text-info"}
                `;
      }}
    />
  );
}
