'use client';

import { getLoggedInUserData } from "@/app/(signin-setup)/sign-in/action";
import { supabase } from "@/utils/supabase/supabaseClient";
import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react";

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
  mobile: string;
  password: string;
  profile_image: string;
  entity_name: string;
  access : { space: boolean; team: boolean; task: boolean; all: boolean };
}

interface ContextProps {
  userId: UserData | null;
  setUserId: Dispatch<SetStateAction<UserData | null>>;
  selectedActiveTab: string | number | null;
  setSelectedActiveTab: Dispatch<SetStateAction<string | number | null>>;
}

const GlobalContext = createContext<ContextProps>({
  userId: null,
  setUserId: () => null,
  selectedActiveTab: null,
  setSelectedActiveTab: () => null
});

export const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<UserData | null>(null);
  const [selectedActiveTab, setSelectedActiveTab] = useState<number | string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await getLoggedInUserData();

        if (!user?.id) {
          console.log("No logged-in user found");
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("userId", user?.id) // Ensure the key matches the actual column name in your table
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
          return;
        }

        setUserId(data);
      } catch (error) {
        console.error("Unexpected error fetching user:", error);
      }
    };

    getUser();
  }, []);

  return (
    <GlobalContext.Provider value={{ userId, setUserId, selectedActiveTab, setSelectedActiveTab }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
