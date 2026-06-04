import log from "loglevel";
import { DeleteIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useZustandStore from "../../store/useZustandStore";
import localPreferencesManager from "../../store/preferences";

export default function LockScreen() {
  log.debug("LockScreen");

  const refInput = useRef<HTMLInputElement | null>(null);
  const [pin, setPin] = useState("");
  const [attempt, setAttempt] = useState(1);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const isLockedOut = lockoutSeconds > 0;

  useEffect(() => {
    refInput.current?.focus();
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      const lockScreenPin = await localPreferencesManager.get("lockScreenPin");
      if (!lockScreenPin || pin.length < lockScreenPin.length) return;

      if (pin === lockScreenPin) {
        log.debug("LockScreen unlock");
        useZustandStore.setState({ isLockScreenOpened: false });
      } else {
        if (attempt >= 3) {
          // Trigger a 30-second lockout penalty on wrong PIN
          setLockoutSeconds(30);
        } else {
          setAttempt(attempt + 1);
        }

        setPin("");
      }
    });
  }, [pin]);

  // Handle lockout countdown timer
  useEffect(() => {
    if (!isLockedOut) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isLockedOut]);

  function onNumberClick(num: number) {
    if (isLockedOut) return;
    setPin((prev) => `${prev}${num}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div
        className="w-full max-w-sm p-7
                   rounded-xl bg-popover border border-border shadow-2xl
                   flex flex-col gap-6 items-center"
      >
        <h1 className="text-2xl font-bold text-center tracking-wide text-foreground">TreeRo</h1>

        <div className="w-full flex flex-col gap-2">
          <input
            className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono
                       rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring 
                       disabled:opacity-50 disabled:bg-muted"
            ref={refInput}
            type="password" /* Obscuring PIN characters for better security */
            inputMode="none"
            placeholder={isLockedOut ? "Locked out" : "••••"}
            value={pin}
            disabled={isLockedOut}
            onChange={(e) => {
              if (isLockedOut) return;
              const value = e.target.value.replace(/[^0-9]/g, "");
              setPin(value);
            }}
          />

          {/* Timeout Banner */}
          {isLockedOut && (
            <p className="text-sm text-destructive text-center font-medium animate-pulse">Too many attempts. Try again in {lockoutSeconds}s</p>
          )}
        </div>

        {/* Numpad Layout */}
        <div className="grid grid-cols-3 gap-4 justify-items-center w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={`pin-${num}`}
              type="button"
              disabled={isLockedOut}
              onClick={() => onNumberClick(num)}
              className="w-16 h-16 bg-secondary text-secondary-foreground text-xl font-semibold rounded-full
                        border border-border shadow-sm hover:scale-105 active:scale-95 disabled:opacity-40
                        transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              {num}
            </button>
          ))}

          {/* Spacer */}
          <div className="w-16 h-16"></div>

          <button
            type="button"
            disabled={isLockedOut}
            onClick={() => onNumberClick(0)}
            className="w-16 h-16 bg-secondary text-secondary-foreground text-xl font-semibold rounded-full
                      border border-border shadow-sm hover:scale-105 active:scale-95 disabled:opacity-40
                      transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            0
          </button>

          <button
            className="w-16 h-16 flex items-center justify-center text-muted-foreground hover:text-foreground 
                       disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
            type="button"
            disabled={isLockedOut || pin.length === 0}
            onClick={() => setPin((prev) => prev.slice(0, -1))}
          >
            <DeleteIcon className="w-7 h-7" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
