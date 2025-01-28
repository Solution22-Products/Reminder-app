"use server";
import { createClient } from "@/utils/supabase/server";

export async function passwordReset(password: string) {
  const supabase = createClient();
  const { error: userError } = await supabase.auth.updateUser({
    password: password,
  });
  if (userError) {
    return { error: userError.message };
  }
  return { success_message: "Password changed successfully" };
}
