"use client";
import NavBar from "@/components/navBar";
import OverDue from "@/components/overDue";
import TaskStatus from "@/components/taskStatus";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./style.css";
import Spaces from "@/components/spaces";
import Image from "next/image";
import smile from "@/public/images/smile-img.png";
import { useGlobalContext } from "@/context/store";
import ReactMentions from "@/components/react-mentions";
import Footer from "../footer/page";


const Home = () => {
  const route = useRouter();
  const { userId } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [taskTrigger, setTaskTrigger] = useState(false);
  const [notifyMobTrigger, setNotifyMobTrigger] = useState(false);

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
        <div className="w-full h-screen flex justify-center items-center">
          <div id="wifi-loader">
            <svg className="circle-outer" viewBox="0 0 86 86">
              <circle className="back" cx="43" cy="43" r="40"></circle>
              <circle className="front" cx="43" cy="43" r="40"></circle>
              <circle className="new" cx="43" cy="43" r="40"></circle>
            </svg>
            <svg className="circle-middle" viewBox="0 0 60 60">
              <circle className="back" cx="30" cy="30" r="27"></circle>
              <circle className="front" cx="30" cy="30" r="27"></circle>
            </svg>
            <svg className="circle-inner" viewBox="0 0 34 34">
              <circle className="back" cx="17" cy="17" r="14"></circle>
              <circle className="front" cx="17" cy="17" r="14"></circle>
            </svg>
            <div className="text" data-text="Loading"></div>
          </div>
        </div>
      ); // Simple loader UI
  }

    return ( 
        <>
        
        <NavBar />
        {
          (
            (userId?.role === "owner" ||
              (userId?.role === "User" &&
                ((userId?.access?.task !== true &&
                  userId?.access?.all === true) ||
                  userId?.access?.task === true))) && (
                  <ReactMentions setTaskTrigger={setTaskTrigger} setNotifyMobTrigger={setNotifyMobTrigger} />
            )
          )
        }
        
        <TaskStatus />
        <OverDue taskTrigger={taskTrigger} />
        <Spaces />

{/* <ReactMentions /> */}

        <div className="flex justify-center items-center py-5 font-geist gap-1">
            <Image src={smile} alt="smile-img" width={300} height={300} className="w-[42px] h-[42px] grayscale" />
            <p className="text-[#A7A7AB] text-[12px]">That's all for today !!!!</p>
        </div>

        <Footer notifyMobTrigger = {notifyMobTrigger} setNotifyMobTrigger = {setNotifyMobTrigger} test = {''} setTest={''}/>
        </>
     );
}
 
export default Home;