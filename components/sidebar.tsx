"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ClipboardList, Kanban, LayoutDashboard } from "lucide-react";

const WebSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} className="mr-2" /> },
    { label: "Task View", path: "/admin-view", icon: <ClipboardList size={20} className="mr-2" /> },
    { label: "Kanban View", path: "/canban-view", icon: <Kanban size={20} className="mr-2" /> },
  ];

  const handleNavigation = (path: string) => {
    if (pathname === path) return; // Avoid unnecessary rerenders
    setLoading(true);
    startTransition(() => {
      router.push(path);
    });
  };

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 1000); // fallback for smooth transition
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <>
      <div className="border-b border-gray-400 py-1 pb-2">
        <img
          src="/images/s22_remain.png"
          alt="Logo"
          className="cursor-pointer w-[120px] ml-[25px]"
          onClick={() => handleNavigation("/dashboard")}
        />
      </div>

      <div className="flex flex-col space-y-4 mt-4 px-3">
        {navItems.map(({ label, path, icon }) => {
          const isActive = pathname === path;
          return (
            <button
              key={path}
              onClick={() => handleNavigation(path)}
              className={`flex items-center text-sm font-medium px-3 py-2 transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 rounded-[10px] text-white shadow"
                  : "hover:text-blue-600"
              }`}
            >
              {icon}
              {label}
            </button>
          );
        })}
      </div>

      {(loading || isPending) && (
        <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </>
  );
};

export default WebSidebar;