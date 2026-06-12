import * as React from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";

// A quick helper hook to detect mobile viewports
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const listener = () => setIsMobile(media.matches);
    listener(); // Initial check
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [breakpoint]);

  return isMobile;
}

export default function CustomSidebarLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // 1. The Shared Sidebar Content
  const SidebarInnerContent = () => (
    <div className="flex flex-col h-full p-4 bg-sidebar text-sidebar-foreground">
      <div className="font-semibold mb-4">My Custom App</div>
      <nav className="space-y-2">
        <a href="#" className="block p-2 rounded hover:bg-accent">
          Dashboard
        </a>
        <a href="#" className="block p-2 rounded hover:bg-accent">
          Settings
        </a>
      </nav>
    </div>
  );

  // 2. Mobile View: Render using Sheet
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen w-full">
        <header className="flex h-12 items-center border-b px-4 bg-background">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            ></SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarInnerContent />
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    );
  }

  // 3. Desktop View: Render using Resizable Panels
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-screen w-full items-stretch">
      {/* Sidebar Panel */}
      <ResizablePanel defaultSize={20} minSize={15} maxSize={200} className="border-r min-w-[200px]">
        <SidebarInnerContent />
      </ResizablePanel>

      {/* The Resize Handle (The draggable divider) */}
      <ResizableHandle withHandle />

      {/* Main Content Panel */}
      <ResizablePanel defaultSize={80}>
        <main className="h-full p-6 overflow-auto bg-background">{children}</main>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
