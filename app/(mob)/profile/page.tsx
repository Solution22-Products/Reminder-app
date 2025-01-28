"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { Eye, EyeOff, Plus } from "lucide-react";
import { passwordReset } from "./action";
import { Router } from "next/router";
import { OverdueListSkeleton } from "@/app/(web)/components/skeleton-ui";
import { getLoggedInUserData } from "@/app/(signin-setup)/sign-in/action";
import { useGlobalContext } from "@/context/store";

interface UserData {
  id: string;
  username: string;
  email: string;
  mobile: string;
  password: string;
  entityName: string;
  profile_image: string;
}

const formSchema = z
  .object({
    picture: z.any(),
    //   .custom<FileList>((fileList) => fileList && fileList.length === 1, {
    //     message: "Please upload profile image",
    //   })
    //   .refine(
    //     (fileList) =>
    //       fileList[0]?.type === "image/png" ||
    //       fileList[0]?.type === "image/jpeg",
    //     {
    //       message: "Only JPEG and PNG formats are supported",
    //     }
    //   )
    //   .refine((fileList) => fileList[0]?.size <= 5_000_000, {
    //     message: "Image size must be less than 5MB",
    //   }),
    name: z.string().min(2, {
      message: "Please enter the name",
    }),
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    mobile: z
      .string()
      .min(10, {
        message: "Please enter a valid mobile number with at least 10 digits",
      })
      .max(11, {
        message:
          "Please enter a valid mobile number with no more than 11 digits",
      })
      .regex(/^[0-9]+$/, {
        message:
          "Please enter a valid mobile number with no special characters",
      }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters long.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters long.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password doesn't match with password",
    path: ["confirmPassword"],
  });

const UserProfile = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      picture: "",
      name: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleImageChange = (files: FileList) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      setFile(file);
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const router = useRouter();
  const { userId } = useGlobalContext();
  const [loggedUserData, setLoggedUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoader, setSaveLoader] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [modalPassword, setModalPassword] = useState("");
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);
  const [modalShowPassword, setModalShowPassword] = useState(false);

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    setModalPassword(password);
    form.setValue("password", password);
    form.setValue("confirmPassword", password);
  };

  const onSubmit = async (data: any) => {
    // const entityName = data.name.split(" ").join("_");
    try {
      setSaveLoader(true);
      let imageUrl = data.profile_image;
      if (file) {
        const { error: uploadError } = await supabase.storage
          .from("profiles")
          .upload(`profiles/${file.name}`, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError)
          throw new Error(`Image upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from("profiles")
          .getPublicUrl(`profiles/${file.name}`);
        imageUrl = publicUrlData?.publicUrl || "";
      }

      // const signUpResponse = await createUser1(data.email, data.password);
      // if (signUpResponse?.data == null) {
      //   console.error("Sign up error:", signUpResponse);
      // }

      const { data: memberData, error: memberError } = await supabase
        .from("users")
        .update({
          username: data.name || loggedUserData?.username,
          mobile: data.mobile || loggedUserData?.mobile,
          password: data.password || loggedUserData?.password,
          profile_image: imageUrl || loggedUserData?.profile_image,
        })
        .eq("id", loggedUserData?.id)
        .select("*")
        .single();

      if (memberError) {
        console.log(memberError);
        toast({
          title: "Error",
          description: "Something went wrong, please try again later.",
        });
        setSaveLoader(false);
        return;
      }

      if (memberData) {
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        });
        passwordReset(data.password);
        setSaveLoader(false);
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: "Something went wrong, please try again later.",
      });
      setSaveLoader(false);
    }
  };

  useEffect(() => {
    console.log(userId);
    const redirectToTask = () => {
      router.push("/profile");
    };

    if (window.innerWidth <= 992) {
      redirectToTask();
      setLoading(false);
      return;
    } else {
      router.push("/dashboard");
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const getUser = async () => {
        const user = await getLoggedInUserData();
          console.log(user, " user");
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
        form.setValue("name", data.username);
        form.setValue("email", data.email);
        form.setValue("mobile", data.mobile);
        form.setValue("password", data.password);
        form.setValue("confirmPassword", data.password);
        setImageUrl(data.profile_image);
        setLoggedUserData(data);
      };
  
      getUser();
  }, []);

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
      <div className="px-3">
        <div className="w-full pb-4 pt-14">
          <div className="bg-white pt-4 pb-10 mt-5 rounded-[10px]">
            {loading ? (
              <OverdueListSkeleton />
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-3"
                >
                  <FormField
                    control={form.control}
                    name="picture"
                    render={({ field }) => (
                      <FormItem className="mt-0 pb-2">
                        <FormControl>
                          <div className="flex justify-center mt-5">
                            <div className="relative w-32 h-32 rounded-full border-2 border-gray-300">
                              <Input
                                type="file"
                                accept="image/png, image/jpeg"
                                placeholder="Upload Image"
                                className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                                onChange={(e) => {
                                  field.onChange(e.target.files);
                                  handleImageChange(e.target.files as any);
                                }}
                              />
                              <Image
                                src={imageUrl || ""}
                                alt="Profile Image"
                                layout="fill"
                                objectFit="cover"
                                className="rounded-full z-0 text-transparent"
                              />
                              <Plus
                                size={20}
                                className="bg-primaryColor-700 text-gray-300 p-0.5 rounded-full absolute top-[8px] right-[8px]"
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-center" />
                      </FormItem>
                    )}
                  />

                  <div className="w-full mx-auto px-4">
                    <div className="mb-1 flex flex-col justify-center items-center gap-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                className="border border-gray-300"
                                placeholder="Enter Company Name here"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="mt-0 w-full relative">
                            <FormLabel className="mb-0">Email</FormLabel>
                            <FormControl>
                              <Input
                                disabled
                                className="border border-gray-300"
                                placeholder="Email"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div
                      className="my-2 flex flex-col justify-center items-center gap-2"
                    >
                      <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Mobile Number</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                className="border border-gray-300"
                                placeholder="+61 0000 0000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="w-full mt-2 relative">
                            <div className="flex justify-between items-center">
                              <FormLabel className="mb-1">Password</FormLabel>
                              <p
                                className="w-fit bg-primaryColor-700 text-white px-1 rounded text-xs cursor-pointer"
                                onClick={generatePassword}
                              >
                                Generate
                              </p>
                            </div>
                            <FormControl>
                              <Input
                                placeholder="**********"
                                type={modalShowPassword ? "text" : "password"}
                                className="border border-gray-300"
                                {...field}
                                value={field.value}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setModalPassword(e.target.value);
                                }}
                              />
                            </FormControl>
                            <span
                              className="absolute md:right-0 -right-0 top-[25px] cursor-pointer w-7 md:w-8 lg:w-11 flex items-center justify-center"
                              onClick={() =>
                                setModalShowPassword(!modalShowPassword)
                              }
                            >
                              {modalShowPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </span>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div
                      className="flex justify-start gap-5 items-center mt-1"
                      // style={{ marginTop: "32px !important" }}
                    >
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="relative w-full">
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type={confirmShowPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                className="border border-gray-300 -mt-5"
                                {...field}
                              />
                            </FormControl>
                            <span
                              className="absolute md:right-0 -right-0 top-[32px] cursor-pointer w-7 md:w-8 lg:w-11 flex items-center justify-center"
                              onClick={() =>
                                setConfirmShowPassword(!confirmShowPassword)
                              }
                            >
                              {confirmShowPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </span>
                            <FormMessage className="" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="bg-white w-[94%] h-[60px] absolute top-[12px] rounded-[10px] flex justify-between items-center px-3">
                    <h2 className="text-[16px] font-geist font-bold text-[#000000]">
                      User profile
                    </h2>
                    <div className="flex items-center gap-5">
                      
                      <Button
                        type="submit"
                        className={`bg-primaryColor-700 hover:bg-primaryColor-700 w-[128px] h-[40px] hover:opacity-75`}
                        disabled={saveLoader}
                      >
                        {saveLoader ? (
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
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
