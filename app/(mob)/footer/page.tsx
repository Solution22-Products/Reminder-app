"use client";
import { usePathname } from "next/navigation";
import { ListChecks } from "lucide-react";
import Link from "next/link";
import { House } from "lucide-react";
import { BellDot } from "lucide-react";

const Footer = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <footer className="fixed  z-[1] bottom-0 w-full h-[83px] pt-[12px] pb-[30px] px-[18px] border border-gray-300 bg-white flex justify-around items-center">
      {/* Home Link */}
      <Link href="/home">
        <div className="flex flex-col items-center">
          <House
            className={`w-[22px] h-[22px] ${
              isActive("/home") ? "text-primaryColor-700" : "text-gray-400"
            } hover:text-[#1A56DB]`}
            style={{
              transition: "color 0.2s ease-in-out, text-shadow 0.2s ease-in-out",
              ...(isActive("/home") && {
                textShadow: "0 0 8px #1A56DB, 0 0 15px #1A56DB",
              }),
            }}
          />
          <p
            className={`font-inter font-medium text-xs  ${
              isActive("/home") ? "text-[#1A56DB]" : "text-gray-400"
            } hover:text-[#1A56DB]`}
            style={{
              transition: "color 0.2s ease-in-out",
            }}
          >
            Home
          </p>
        </div>
      </Link>

      {/* Task Link */}
      <Link href="/task">
        <div className="flex flex-col items-center">
          <ListChecks
            className={`w-[22px] h-[22px] ${
              isActive("/task") ? "text-[#1A56DB]" : "text-gray-400"
            } hover:text-[#1A56DB]`}
            style={{
              transition: "color 0.2s ease-in-out, text-shadow 0.2s ease-in-out",
              ...(isActive("/task") && {
                textShadow: "0 0 8px #1A56DB, 0 0 15px #1A56DB",
              }),
            }}
          />
          <p
            className={`font-inter font-medium text-xs ${
              isActive("/task") ? "text-[#1A56DB]" : "text-gray-400"
            } hover:text-[#1A56DB]`}
            style={{
              transition: "color 0.2s ease-in-out",
            }}
          >
            Task
          </p>
        </div>
      </Link>

      {/* Notification Link */}
      <Link href="/notification">
        <div className="flex flex-col items-center">
          <BellDot
            className={`w-[22px] h-[22px] ${
              isActive("/notification") ? "text-[#1A56DB]" : "text-gray-400"
            } hover:text-[#1A56DB]`}
            style={{
              transition: "color 0.2s ease-in-out, text-shadow 0.2s ease-in-out",
              ...(isActive("/notification") && {
                textShadow: "0 0 8px #1A56DB, 0 0 15px #1A56DB",
              }),
            }}
          />
          <p
            className={`font-inter font-medium text-xs ${
              isActive("/notification") ? "text-[#1A56DB]" : "text-gray-400"
            } hover:text-[#1A56DB]`}
            style={{
              transition: "color 0.2s ease-in-out",
            }}
          >
            Notification
          </p>
        </div>
      </Link>
    </footer>
  );
};

export default Footer;
