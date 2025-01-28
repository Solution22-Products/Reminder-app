"use client";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

const formSchema = z
  .object({
    password: z.string().min(6, {
      message: "Password is not recognised. Please try again.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password is not recognized. Please try again.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password is not matched. Please try again.",
    path: ["confirmPassword"],
  });

const SuperAdminSignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [signinLoading, setSigninLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const route = useRouter();

  const notify = (message: string, success: boolean) =>
    toast[success ? "success" : "error"](message, {
      style: {
        borderRadius: "10px",
        background: "#fff",
        color: "#000",
      },
      position: "top-right",
      duration: 2000,
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSigninLoading(true);
  
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: values.password,
      });
  
      setSigninLoading(false);
  
      if (error) {
        notify(`Failed to update: ${error.message}`, false); // Show error message using notify
        console.error("Error updating password:", error);
      } else {
        notify("Password updated successfully!", true); // Success notification using notify
        console.log("Password changed successfully", data);
        route.push("/sign-in?message=Password updated successfully");
      }
    } catch (err) {
      setSigninLoading(false);
      notify("Sign in failed: An error occurred", false); // Notify for any unexpected error
      console.error("Error occurred:", err);
    }
  }

  return (
    <div className="md:flex sm:block justify-end min-h-screen">
      <Toaster />
      <div className="md:w-3/5 sm:w-full h-screen flex flex-col justify-center">
        <div className="lg:w-[515px] p-10 md:w-full w-full md:p-12 lg:p-0 m-auto">
          <h1 className="text-2xl font-semibold mb-6">Forget Password</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="*****"
                        {...field}
                        className="w-[90%]"
                      />
                    </FormControl>
                    <span
                      className="absolute md:right-0 -right-0 top-6 cursor-pointer border border-border_gray rounded w-7 md:w-8 lg:w-11 h-10 flex items-center justify-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </span>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="*****"
                        {...field}
                        className="placeholder:text-placeholder w-[90%]"
                      />
                    </FormControl>
                    <span
                      className="absolute md:right-0 -right-0 top-6 cursor-pointer border border-border_gray rounded w-7 md:w-8 lg:w-11 h-10 flex items-center justify-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </span>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-xs font-normal text-placeholder pt-[10px]">
                Password must be at least 8 characters long, including an
                uppercase letter, a lowercase letter, a number, and a special
                character.
              </p>
              <div className="flex justify-between items-center gap-[24px]">
                <Button
                  type="button"
                  variant={"outline"} className="w-2/4"
                  style={{ marginTop: "8px" }}
                  onClick={() => route.push("/sign-in")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primaryColor-700 hover:bg-primaryColor-700 hover:opacity-75 w-2/4"
                  style={{ marginTop: "8px" }}
                  disabled={signinLoading}
                >
                  {signinLoading ? (
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
                        stroke="#fff"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="#fff"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
      <div className="w-2/5 relative sm:none md:block">
        <Image
          src="/images/forget-image.png"
          alt="sign in"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default SuperAdminSignIn;
