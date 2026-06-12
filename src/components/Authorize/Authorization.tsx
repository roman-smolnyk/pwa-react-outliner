import log from "loglevel";
import LoginForm from "./LoginForm";

export default function Authorization() {
  log.debug("Authorization");

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
