"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function forgetPassword(password: string) {
  const supabase = createClient();

  // Validate the code
  // if (!code) {
  //   return redirect(`/forget-password?message=Invalid password reset code.`);
  // }

  // Update password directly without using the token
  const { error } = await supabase.auth.updateUser({
    password: password, 
  });
  console.log("error ", error);
  if (error) {
    return redirect(`/forget-password?message=${error.message}`);
  }

  revalidatePath("/forget-password", "layout");
  return redirect(`/sign-in?message=Password updated successfully`);
}
