import useStore from "@/store/useStore";
import log from "loglevel";
import LogInForm from "./LogInForm";
import SignUpForm from "./SignUpForm";

export default function Authorization() {
  log.debug("Authorization");

  const isSignUp = useStore((s) => s.isSignUp);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-5">
      <div className="w-full max-w-sm">{isSignUp ? <SignUpForm /> : <LogInForm />}</div>
    </div>
  );
}
