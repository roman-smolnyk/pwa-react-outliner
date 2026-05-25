import { useState } from "react";

export default function ToggleSlider({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const [isChecked, setIsChecked] = useState(checked);

  // log.debug("ToggleSlider", checked, isChecked);

  const handleToggle = () => {
    if (onChange) {
      onChange(!isChecked);
    }
    setIsChecked(!isChecked);
  };

  return (
    <label className={`relative inline-flex w-11 h-6 select-none ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
      {/* Visual Hidden Checkbox for full keyboard & screen reader accessibility */}
      <input className="sr-only peer" type="checkbox" checked={isChecked} onChange={handleToggle} />
      {/* Track */}
      <span
        className="absolute inset-0 rounded-full
                  bg-accent
                  border border-border  
                  peer-checked:bg-primary
                  transition-colors duration-300"
      />
      {/* Thumb */}
      <span
        className={`absolute w-4 h-4 top-1 left-1 rounded-full
                    bg-primary-foreground
                    transition-transform duration-300 ease-in-out
                    ${isChecked ? "translate-x-5" : "translate-x-0"}
                    flex items-center justify-center
                  `}
      ></span>
    </label>
  );
}
