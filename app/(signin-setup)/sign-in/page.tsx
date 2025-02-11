"use client";
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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import Loading from "@/components/ui/loading";
import { getLoggedInUserData, signIn } from "./action";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/utils/supabase/supabaseClient";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
// import Lottie from "lottie-react";
// import LottielabLogin1 from "@/public/images/login_animation.json";
import "./style.css";
import Image from "next/image";

interface SupabaseError {
  message: string;
}

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password is not recognised. Please try again.",
  }),
});

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const route = useRouter();
  const [signinLoading, setSigninLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [signedInUserId, setSignedInUserId] = useState<string | null>("");

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [folderError, setFolderError] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState("");

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
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSigninLoading(true);
    try {
      const res = await signIn(values.email, values.password);
      setSigninLoading(false);
      if (res?.error) {
        notify(`Sign in failed: ${res.error}`, false);
      } else {
        const user = await getLoggedInUserData();
        if (user?.user_metadata.status !== "Active") {
          notify("Your account is not active", false);
          return;
        }
        notify("Sign in successful", true);

        // console.log(user?.id);
        // localStorage.setItem("userId", user?.id!);
        // localStorage.setItem("userEmail", user?.email!);
        // Check the screen width and redirect accordingly
        const screenWidth = window.innerWidth;

        if (screenWidth >= 992) {
          route.push("/dashboard"); // Large devices
        } else if (screenWidth <= 991) {
          route.push("/home"); // Medium devices
        }
      }
    } catch (error) {
      setSigninLoading(false);
      notify(`Sign in failed: ${error}`, false);
    }
  }

  const handleSendEmail = async () => {
    setEmailLoading(true);
    const newErrors = { name: !folderNameInput };
    setFolderError(newErrors.name);

    if (newErrors.name) {
      notify("Please enter a valid email address", false); // Display error message if input is invalid
      setEmailLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        folderNameInput,
        {
          redirectTo: `${window.location.origin}/forget-password`,
        }
      );

      if (error) {
        notify(`Error: ${error.message}`, false); // Display error message if Supabase call fails
      } else {
        notify("Password reset link sent to your email", true); // Success notification
      }

      setCreateFolderOpen(false);
      setFolderNameInput("");
    } catch (error) {
      const typedError = error as SupabaseError;
      notify(`Error: ${typedError.message}`, false);
    } finally {
      setEmailLoading(false);
    }
  };

  // useEffect(() => {
  //   setIsLoading(true);
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 2000);

  //   return () => clearTimeout(timer);
  // }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      const user = await getLoggedInUserData();
      if (user) {
        setSignedInUserId(user.id);
      }
    };
    fetchUserId();
  }, [signedInUserId]);

  //   if (isLoading) {
  //     return <Loading />;
  //   }

  return (
    <div className="md:flex sm:block justify-end min-h-screen font-inter">
      <Toaster />
      <div className="md:w-1/2 sm:w-full h-screen flex flex-col justify-center relative">
        <div className="lg:w-[515px] p-10 md:w-full w-full md:p-12 lg:p-0 m-auto lg_start_width">
          <div className="absolute top-4 left-4"></div>
          <h1 className="text-3xl font-bold mb-7">Sign In</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Email here" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="relative pb-3">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        {...field}
                        className="w-[90%]"
                      />
                    </FormControl>
                    <span
                      className="absolute md:right-0 -right-0 top-6 cursor-pointer border border-border_gray rounded w-7 md:w-8 lg:w-11 h-9 flex items-center justify-center"
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
              <Dialog
                open={createFolderOpen}
                onOpenChange={setCreateFolderOpen}
              >
                <DialogTrigger asChild>
                  <p className="font-medium text-[13px] underline underline-offset-4 cursor-pointer inline">
                    Forget Password
                  </p>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[397px] sm:max-h-[342px]">
                  <DialogHeader className="flex flex-col space-y-0">
                    <DialogTitle className="text-2xl font-semibold">
                      Forget Password
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3 pb-2">
                    <div>
                      <Label htmlFor="name" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="folderName"
                        className={`col-span-3 mt-1.5 ${
                          folderError ? "border-red-500" : "border-border_gray"
                        }`}
                        placeholder="example@gmail.com"
                        value={folderNameInput}
                        onChange={(e) => {
                          setFolderNameInput(e.target.value);
                          if (folderError) setFolderError(false);
                        }}
                      />
                      <p className="text-xs mt-1.5 text-gray-500">
                        Please enter the email address associated with your
                        account *
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="mb-2">
                    <DialogClose asChild>
                      <Button variant={"outline"} className="w-2/4">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      className="bg-primaryColor-700 hover:bg-primaryColor-700 hover:opacity-75 w-2/4"
                      onClick={handleSendEmail}
                      disabled={emailLoading}
                    >
                      {emailLoading ? (
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
                        "Send Email"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                type="submit"
                className="w-full bg-primaryColor-700 hover:bg-primaryColor-700"
                style={{ marginTop: "30px" }}
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
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <div className="w-1/2 lottie_img sm:none md:block flex justify-center items-center h-screen">
        <div className="w-full h-full relative flex justify-center items-center">
          <Image
            src="/images/signin-image.png"
            alt="lottie"
            className="lottie_img w-full h-full"
            width={500}
            height={500}
          />
          {/* <Lottie
            animationData={LottielabLogin1}
            loop={true}
            style={{ width: "100%", height: "80%" }}
            className="lottie_img"
          />
          <div className="w-[200px] h-[100px] bg-white absolute md:bottom-[0px] lg:bottom-[25px] right-20 lottie_hide"></div> */}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
