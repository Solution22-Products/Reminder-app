import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { } from "@/components/ui/toast";
import { cookies } from 'next/headers';

// const cookieStore = cookies();

type Session = {
  access_token: string;
  refresh_token: string;
};

type Data = {
  session?: Session | null;
};

// Example function to set cookies
export function setAuthCookies(data: Data) {
  const cookieStore = cookies();

  // Check if session exists before setting cookies
  if (data?.session) {
    cookieStore.set('sb-access-token', data.session.access_token);
    cookieStore.set('sb-refresh-token', data.session.refresh_token);
  }
}

export async function login({ email, password }: { email: string; password: string }) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })

  if (error) {
    console.error('Database Error:', error);
    return
  }
  setAuthCookies(data)

  revalidatePath('/', 'layout')
  redirect('/admin')
}


export async function signup({ email, username, password }: { email: string; username: string; password: string }) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        user_name: username,
      },
    },
  })

  if (error) {
    console.error('Database Error:', error);
    return
  }
  setAuthCookies(data)

  revalidatePath('/', 'layout')
  redirect('/admin')

}


export async function fetchTasks() {
  const supabase = createClient()
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
    if (error) throw error
    return tasks;
  } catch (error) {
    console.error('Database Error:', error);
  }
}

export async function createTasks(data: any) {
  const supabase = createClient()
  try {
    const { data: tasks, error } = await supabase.from('tasks').insert(data)
    if (error) throw error
    return tasks;
  } catch (error) {
    console.error('Database Error:', error);
  }
}