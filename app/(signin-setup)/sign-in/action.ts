"use server";

import { createClient } from "@/utils/supabase/server";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

// Fetch user data
export async function getLoggedInUserData() {
  const supabase = createClient();

  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    return data.user;
  } else {
    return null;
  }
}

// Sign in function
export async function signIn(email : string, password : string) {
  const supabase = createClient();
  console.log("Attempting sign-in with email:", email);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign-in error:", error.message);
    return { error: error.message };
  }

  console.log("Sign-in successful:", data);

  // Fetch user data
  const user = await getLoggedInUserData();
  if (!user) {
    return { error: "Failed to fetch user data after sign-in." };
  }
}
