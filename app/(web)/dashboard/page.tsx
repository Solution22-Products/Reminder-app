"use client";
import SpaceBar from "../components/spacebar";
import "./style.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/store";
import Notification from "../components/notificationComp";

const WebDashboard1 = () => {
  const { userId } = useGlobalContext();
  const route = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToTask = () => {
      route.push("/home");
    };

    if (window.innerWidth <= 992) {
      redirectToTask();
      setLoading(false);
      return;
    } else {
      route.push("/dashboard");
      setLoading(false);
    }
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

  return (
    <>
      <Notification notificationTrigger="" />
      <h1>Dashboard page</h1>
    </>
  );
};

export default WebDashboard1;
