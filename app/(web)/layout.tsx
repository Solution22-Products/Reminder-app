"use client";
import "rsuite/dist/rsuite-no-reset.min.css";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import { getLoggedInUserData } from "@/app/(signin-setup)/sign-in/action";
import { GlobalContextProvider } from "@/context/store";
import { Sidebar } from "lucide-react";
import WebSidebar from "@/components/sidebar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // const [loggedUserData, setLoggedUserData] = useState<any>(null);
  // useEffect(() => {
  //   const getUser = async () => {
  //     const user = await getLoggedInUserData();

  //     const { data, error } = await supabase
  //       .from("users")
  //       .select("*")
  //       .eq("userId", user?.id)
  //       .single();

  //     if (error) {
  //       console.log(error);
  //       return;
  //     }
  //     // console.log(data);
  //     setLoggedUserData(data);
  //   };

  //   getUser();

  //   // localStorage.setItem("user", JSON.stringify(loggedUserData));
  // }, []);
  return (
    <div className="min-h-screen h-full w-full bg-webbg text-black font-inter">
      <main className="w-full">
        <Toaster />
        <div className="w-full flex">
          <div className="w-full h-[100dvh] bg-[#f4f4f5] flex">
            <div className="w-[200px] h-full border-r border-zinc-300 bg-white">
              <WebSidebar />
            </div>
            <GlobalContextProvider>{children}</GlobalContextProvider>
          </div>
        </div>
      </main>
    </div>
  );
}
