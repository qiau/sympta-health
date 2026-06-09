import {
  CloseSquare,
  Home2,
  LogoutCurve,
  MessageQuestion,
  RefreshLeftSquare,
  FolderOpen,
  DocumentUpload,
} from "iconsax-reactjs";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import type { User } from "../../types/userType";

interface SidebarProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    onClose();
  };

  const menuByRole = {
    user: [
      {
        label: "Beranda",
        path: "/home",
        icon: <Home2 size="20" />,
      },
      {
        label: "Keluhan Medis",
        path: "/input-symptom",
        icon: <MessageQuestion size="20" />,
      },
      {
        label: "Riwayat",
        path: "/history",
        icon: <RefreshLeftSquare size="20" />,
      },
    ],
    admin: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: <Home2 size="20" />,
      },
      {
        label: "Upload Dataset",
        path: "/admin/upload-dataset",
        icon: <DocumentUpload size="20" />,
      },
      {
        label: "Manage Dataset",
        path: "/admin/manage-dataset",
        icon: <FolderOpen size="20" />,
      },
    ],
  };

  const menus = menuByRole[user?.role || "user"] || [];

  return (
    <div
      className={`fixed inset-y-0 left-0 w-1/2 bg-white border-r border-gray-200 transform transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-bold">
          {user?.role === "admin" ? "Admin Panel" : "Menu"}
        </h2>

        <button onClick={onClose} className="hover:text-gray-700">
          <CloseSquare size={24} />
        </button>
      </div>

      <ul className="p-4 space-y-2 font-normal text-gray-900">
        {menus.map((menu) => (
          <li key={menu.path}>
            <button
              type="button"
              onClick={() => handleNav(menu.path)}
              className="w-full flex items-center hover:bg-gray-50 gap-4 p-2 rounded-lg text-left"
            >
              {menu.icon}
              {menu.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="p-4 mt-auto">
        <button
          type="button"
          className="flex justify-center gap-2 w-full p-2 rounded-lg font-normal text-red-500 hover:bg-gray-50 border border-red-500"
          onClick={handleLogout}
        >
          <LogoutCurve size="24" />
          Keluar
        </button>
      </div>
    </div>
  );
}
