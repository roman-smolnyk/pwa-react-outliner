import { BoltIcon, EllipsisVerticalIcon, HardDriveDownloadIcon, HardDriveUploadIcon, LogInIcon, UserRoundIcon } from "lucide-react";
import { useState } from "react";

interface MenuPosition {
  x: number;
  y: number;
}

export default function MenuComponent() {
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent default browser menu
    setMenuPos({ x: e.pageX, y: e.pageY });
  };

  const handleClick = () => {
    setMenuPos(null); // Close menu on click elsewhere
  };

  return (
    <div className="" onContextMenu={handleContextMenu} onClick={handleClick}>
      <button className="cursor-pointer active:scale-90 transition" type="button">
        <EllipsisVerticalIcon className="text-gray-600" />
      </button>

      {menuPos && (
        <div className="absolute w-40 py-2 bg-white shadow-lg rounded-md flex flex-col gap-1" style={{ top: menuPos.y, left: menuPos.x }}>
          <button className="p-1 hover:bg-gray-200 cursor-pointer flex gap-2" type="button">
            <UserRoundIcon className="text-gray-600" />
            <span>Profile</span>
          </button>
          <button className="p-1 hover:bg-gray-200 cursor-pointer flex gap-2" type="button">
            <BoltIcon className="text-gray-600" />
            <span>Settings</span>
          </button>
          <button className="p-1 hover:bg-gray-200 cursor-pointer flex gap-2" type="button">
            <HardDriveDownloadIcon className="text-gray-600" />
            <span>Export Backup</span>
          </button>
          <button className="p-1 hover:bg-gray-200 cursor-pointer flex gap-2" type="button">
            <HardDriveUploadIcon className="text-gray-600" />
            <span>Import Backup</span>
          </button>
          <hr className="m-1! text-gray-300!" />
          <button className="p-1 hover:bg-gray-200 cursor-pointer text-red-600 flex gap-2" type="button">
            <LogInIcon className="" />
            <span>Exit</span>
          </button>
        </div>
      )}
    </div>
  );
}
