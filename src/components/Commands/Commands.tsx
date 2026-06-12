import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import useStore from "@/store/useStore";
import { CalculatorIcon, CalendarIcon, CreditCardIcon, SettingsIcon, SmileIcon, UserIcon } from "lucide-react";

export default function Commands() {
  // const [open, setOpen] = useState(false);

  const isCommandsOpen = useStore((s) => s.isCommandsOpen);

  return (
    <div className="Commands flex flex-col gap-4">
      {/* <Button onClick={() => setOpen(true)} variant="outline" className="w-fit">
        Open Menu
      </Button> */}
      <CommandDialog
        open={isCommandsOpen}
        onOpenChange={() => {
          useStore.setState({ isCommandsOpen: false });
        }}
      >
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <CalendarIcon />
                <span>Calendar</span>
              </CommandItem>
              <CommandItem>
                <SmileIcon />
                <span>Search Emoji</span>
              </CommandItem>
              <CommandItem>
                <CalculatorIcon />
                <span>Calculator</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <UserIcon />
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <CreditCardIcon />
                <span>Billing</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <SettingsIcon />
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
