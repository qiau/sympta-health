import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

export default function AppLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex justify-center bg-gray-100">
      <div className="flex flex-col w-full max-w-lg bg-gray-50 min-h-screen">
        <Navbar user={user} onOpenSidebar={() => setIsOpen(true)} />
        <main className="p-4">
          <Outlet />
        </main>
        <Sidebar user={user} isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    </div>
  );
}
