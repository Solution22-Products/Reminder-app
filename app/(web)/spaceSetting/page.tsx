"use client";
import SpaceSetting from '@/app/(web)/components/spaceSetting';
import WebNavbar from '../components/navbar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getLoggedInUserData } from '@/app/(signin-setup)/sign-in/action';
import { supabase } from '@/utils/supabase/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';
import "./style.css";

// export default function SettingPage()
// {
//     return 
//     (
//         <>
//         <SpaceSetting/>
//         </>
//     )
    
// }
const SettingsPage = () => {

    const route = useRouter();
  const [loading, setLoading] = useState(true);
  const [loggedUserData, setLoggedUserData] = useState<any>(null);

  useEffect(() => {
    const redirectToTask = () => {
      route.push("/home");
    };

    if (window.innerWidth <= 992) {
      redirectToTask();
      setLoading(false);
      return;
    } else {
      route.push("/spaceSetting");
      setLoading(false);
    }

    const getUser = async () => {
      const user = await getLoggedInUserData();

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("userId", user?.id)
        .single();

      if (error) {
        console.log(error);
        return;
      }
      console.log(data);
      setLoggedUserData(data);
    };

    getUser();
  }, [route]);

  if (loading) {
    return (
      <div className="loader w-full h-screen flex justify-center items-center">
        <div className="flex items-center gap-1">
          <p className="w-5 h-5 bg-black rounded-full animate-bounce"></p>
          <p className="text-2xl font-bold">Loading...</p>
        </div>
      </div>
    ); // Simple loader UI
  }

  if (loggedUserData?.role === 'User'){
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="https://res.cloudinary.com/razeshzone/image/upload/v1588316204/house-key_yrqvxv.svg"
            alt="denied"
            width={200}
            height={200}
            className="w-[100px] h-[100px]"
          />
          <h1 className="text-9xl font-bold">403</h1>
          <p className="text-2xl font-bold">Access Denied!</p>
          <h4 className="text-sm text-gray-500 text-center font-inter">You don’t have access to this area of application. Speak <br /> to your administrator to unblock this feature. <br /> You can go back to <Link href="/dashboard" className="text-primaryColor-700 underline font-bold">Dashboard</Link></h4>
        </div>
      </div>
    );
  }

  return (
    <>
    {/* <WebNavbar
       loggedUserData={loggedUserData as any}
       navbarItems={false}
       searchValue=''
       setSearchValue=''
      //  teamFilterValue=''
       setTeamFilterValue=''
      //  taskStatusFilterValue=''
       setTaskStatusFilterValue=''
       setDateFilterValue=''
       filterFn=''
       filterDialogOpen={''}
        setFilterDialogOpen={''}
        teamResetFn = {() => {}}
        notificationTrigger=''
        setNotificationTrigger=''
        allTasks={[]}
        /> */}
      <SpaceSetting/> 
    </>
  );
};

export default SettingsPage;