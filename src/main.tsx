import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary, getErrorMessage } from "react-error-boundary";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="flex flex-col gap-4" role="alert">
          <p>Something went wrong:</p>
          <pre className="whitespace-pre-wrap">{getErrorMessage(error)}</pre>
          <button
            className="max-w-40 p-1 border border-border rounded bg-secondary text-secondary-foreground"
            type="button"
            onClick={resetErrorBoundary}
          >
            Try again
          </button>
        </div>
      )}
      onError={(error, info) => {
        // Log the error to your error reporting service
      }}
      onReset={() => {
        // Reset any state that may have caused the error
      }}
    > */}
    <App />
    {/* </ErrorBoundary> */}
  </StrictMode>,
);
