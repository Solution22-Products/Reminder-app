import Image from "next/image";
import logo from "@/public/images/Rectangle 14.png";
import activelogo from "@/public/images/Ellipse 6.png";
import { useGlobalContext } from "@/context/store";
import profile from "@/public/images/img-placeholder.svg";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { LogOut } from "lucide-react";
import { logout } from "@/app/(signin-setup)/logout/action";

export default function NavBar() {
  const { userId } = useGlobalContext();
  const [selectOpen, setSelectOpen] = useState(false);
  const [profileLoader, setProfileLoader] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const route = useRouter();

  const handleLogout = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoggingOut(true); // Show loader when logging out
    await logout();
    setIsLoggingOut(false); // Hide loader after logout completes
  };

  return (
    <>
      <header className="flex justify-between items-center bg-navbg p-[18px] ">
        <Select open={selectOpen} onOpenChange={setSelectOpen}>
          <SelectTrigger className="w-[200px] h-[44px] border-none focus-visible:border-none focus-visible:outline-none text-sm font-bold shadow-none pl-2 justify-start gap-1">
            <div className="flex items-center">
              <Image
                src={userId?.profile_image || profile}
                width={44}
                height={44}
                alt="User Image"
                className="rounded"
              />
              <Image
                src={activelogo}
                alt=""
                className="relative right-3  top-4"
              />
              <div className="pr-[2px] text-left">
                <h3 className="text-sm  text-black font-bold font-geist">
                  {userId?.username}
                </h3>
                <p className="text-[10px] text-black font-geist font-medium">
                  {userId?.email}
                </p>
              </div>
            </div>
          </SelectTrigger>
          <SelectContent className="w-[150px] py-3">
            {/* <div className="py-3 my-3 text-gray-700 border-t border-b border-gray-200 px-3 cursor-pointer"> */}
              <p
                onClick={() => {
                  setProfileLoader(true);
                  setTimeout(() => {
                    route.push("/profile");
                    setProfileLoader(false);
                  }, 1000);
                }}
                className={`text-sm pb-3 mb-3 pl-3.5 border-b border-gray-300 font-medium cursor-pointer`}
              >
                {profileLoader ? (
                  <svg
                    className="animate-spin h-5 w-5 ml-12"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#1A56DB"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-100"
                      fill="#1A56DB"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Your Profile"
                )}
              </p>
            {/* </div> */}
            <form onSubmit={handleLogout} className="flex">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      typeof="submit"
                      className="rounded bg-button_orange text-white cursor-pointer hover:bg-button_orange relative"
                      style={isLoggingOut ? { pointerEvents: "none" } : {}}
                    >
                      {isLoggingOut ? (
                        <div className="ml-20 flex items-center justify-center text-center">
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="#1A56DB"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="#1A56DB"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </div>
                      ) : (
                        <p className="text-sm text-[#F05252] px-3 flex items-center gap-2 cursor-pointer">
                          <LogOut size={20} />
                          Sign Out
                        </p>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Logout</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </form>
          </SelectContent>
        </Select>

        {/* Company Logo */}
        <Image
          src={logo}
          onClick={() => {
            route.push("/home");
          }}
          className="w-[89.872px] h-11"
          alt="Company Logo"
        />
      </header>
    </>
  );
}
