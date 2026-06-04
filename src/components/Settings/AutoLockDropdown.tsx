import localPreferencesManager from "../../store/preferences";
import useZustandStore from "../../store/useZustandStore";

export default function AutoLockDropdown() {
  const autoLockScreen = useZustandStore((s) => s.autoLockScreen);

  return (
    <select
      className="max-w-50 p-2 border border-border rounded bg-popover text-popover-foreground"
      value={autoLockScreen}
      onChange={async (e) => {
        const value = Number(e.target.value);
        console.log("Selected:", value);
        useZustandStore.setState({ autoLockScreen: value });
        await localPreferencesManager.set("autoLockScreen", value);
      }}
    >
      <option value="-1">Never</option>
      <option value="60000">1 min</option>
      <option value="300000">5 min</option>
      <option value="600000">10 min</option>
      <option value="1800000">30 min</option>
      <option value="3600000">1 hour</option>
    </select>
  );
}
