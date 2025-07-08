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
import Image from "next/image";
import { Eye, EyeOff, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import { createUser1 } from "../members/action";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import WebNavbar from "../components/navbar";
import Link from "next/link";
import { useGlobalContext } from "@/context/store";
import Notification from "../components/notificationComp";

// Define the validation schema using Zod
const formSchema = z
  .object({
    picture: z
      .custom<FileList>((fileList) => fileList && fileList.length === 1, {
        message: "Please upload profile image",
      })
      .refine(
        (fileList) =>
          fileList[0]?.type === "image/png" ||
          fileList[0]?.type === "image/jpeg",
        {
          message: "Only JPEG and PNG formats are supported",
        }
      )
      .refine((fileList) => fileList[0]?.size <= 5_000_000, {
        message: "Image size must be less than 5MB",
      }),
    name: z.string().min(2, {
      message: "Please enter the name",
    }),
    Designation: z.string().min(2, {
      message: "Please enter the designation",
    }),
    role: z.string().min(2, {
      message: "Please enter the role",
    }),
    department: z.string().min(2, {
      message: "Please enter the department",
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

const AddMember = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      picture: "",
      name: "",
      Designation: "",
      role: "User",
      department: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { userId } = useGlobalContext();
  const route = useRouter();
  const [saveLoader, setSaveLoader] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);
  const [modalShowPassword, setModalShowPassword] = useState(false);
  const [modalPassword, setModalPassword] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [emailCheck, setEmailCheck] = useState(false);
  const [cancelLoader, setCancelLoader] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const onSubmit = async (data: any) => {
    const entityName = data.name.split(" ").join("_");
    try {
      if (!emailCheck) {
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

        const signUpResponse = await createUser1(data.email, data.password);
        if (signUpResponse?.data == null) {
          console.error("Sign up error:", signUpResponse);
        }

        const { error: memberError } = await supabase.from("users").insert({
          id: data.id,
          username: data.name,
          designation: data.Designation,
          role: data.role,
          department: data.department,
          email: data.email,
          mobile: data.mobile,
          profile_image: imageUrl,
          userId: signUpResponse?.data?.user?.id,
          entity_name: entityName,
          password: data.password,
          is_deleted: false,
          access : {
              "all" : false,
              "task" : false,
              "team" : false,
              "space" : false
            }
        });

        if (memberError) {
          console.error("Member creation error:", memberError);
          toast({
            title: "Error",
            description: "Something went wrong, please try again later.",
            variant: "destructive",
          });
          setSaveLoader(false);
          return;
        }
        form.reset();
        setFile(null);
        setImageUrl("");
        const sendEmail = async (to: any, name: any, password: any) => {
          const response = await fetch("/api/send-cred-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to,
              name,
              password,
              link: "http://localhost:3000/dashboard",
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to send email");
          }
        };

        sendEmail(data.email, data.name, data.password);
        toast({
          title: "Member Added Successfully!",
          description: "Member has been added successfully.",
        });
        setSaveLoader(false);
        route.push("/access");
      } else {
        toast({
          title: "Error",
          description: "Email already exists",
          variant: "destructive",
        });
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

  const handleEmailCheck = async (e: any) => {
    const email = e.target.value;
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (error) {
      console.log(error);
    }
    if (data && data.length > 0) {
      setEmailCheck(true);
    } else {
      setEmailCheck(false);
    }
  };

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    setModalPassword(password);
    form.setValue("password", password);
    form.setValue("confirmPassword", password);
  };

  useEffect(() => {
    const redirectToTask = () => {
      route.push("/home");
    };

    if (window.innerWidth <= 992) {
      redirectToTask();
      setLoading(false);
      return;
    } else {
      route.push("/add-member");
      setLoading(false);
    }
  }, [route]);

  if (userId?.role === "User") {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="https://res.cloudinary.com/razeshzone/image/upload/v1588316204/house-key_yrqvxv.svg"
            alt="denied"
            width={200}
            height={200}
            className="w-[100px] h-[100px]"
          />
          <h1 className="text-9xl font-bold">403</h1>
          <p className="text-2xl font-bold">Access Denied!</p>
          <h4 className="text-sm text-gray-500 text-center font-inter">
            You don’t have access to this area of application. Speak <br /> to
            your administrator to unblock this feature. <br /> You can go back
            to{" "}
            <Link
              href="/dashboard"
              className="text-primaryColor-700 underline font-bold"
            >
              Dashboard
            </Link>
          </h4>
        </div>
      </div>
    );
  }

  return (
    <>
      <Notification />
      <div
        className="w-full relative"
        style={{ minHeight: "calc(100vh - 60px)" }}
      >
        <div className="hidden">
          <span>{modalPassword}</span>
          <span>{loading}</span>
        </div>
        <div className="w-full p-3 pt-14">
          <div className="bg-white pt-4 pb-10 mt-7 rounded-[10px]">
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

                <div className="w-[95%] mx-auto">
                  <div className="flex justify-start gap-5 items-center mb-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="w-1/2 relative">
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              className="border border-gray-300"
                              placeholder="Enter Company Name here"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="absolute -bottom-6 left-0" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="mt-0 w-1/2 relative">
                          <FormLabel className="mb-2">Email</FormLabel>
                          <FormControl>
                            <Input
                              className="border border-gray-300"
                              placeholder="Email"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleEmailCheck(e);
                                // console.log(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage className="absolute -bottom-6 left-0" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div
                    className="flex justify-start gap-5 items-center mb-8"
                    style={{ marginTop: "32px !important" }}
                  >
                    <FormField
                      control={form.control}
                      name="Designation"
                      render={({ field }) => (
                        <FormItem className="w-1/2 relative">
                          <FormLabel>Designation</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              className="border border-gray-300"
                              placeholder="Enter Company Name here"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="absolute -bottom-6 left-0" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem className="w-1/2 relative">
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              className="border border-gray-300"
                              placeholder="+61 0000 0000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="absolute -bottom-6 left-0" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div
                    className="flex justify-start gap-5 items-center"
                    style={{ marginTop: "32px !important" }}
                  >
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="w-1/2 relative">
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              className="border border-gray-300"
                              placeholder="Enter role name here"
                              // defaultValue={"User"}
                              disabled
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="absolute -bottom-6 left-0" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem className="w-1/2 relative">
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              className="border border-gray-300"
                              placeholder="Enter department name here"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="absolute -bottom-6 left-0" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div
                    className="flex justify-start gap-5 items-center mt-8"
                    // style={{ marginTop: "32px !important" }}
                  >
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="w-1/2 relative">
                          <div className="flex justify-between items-center">
                            <FormLabel className="mb-3">Password</FormLabel>
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
                            className="absolute md:right-0 -right-0 top-[34px] cursor-pointer w-7 md:w-8 lg:w-11 flex items-center justify-center"
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
                          <FormMessage className="absolute -bottom-6 left-0" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="relative w-1/2">
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
                          <FormMessage className="absolute -bottom-6 left-0" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div
                  style={{ width: "-webkit-fill-available" }}
                  className="bg-white h-[60px] mr-3 absolute top-[0px] rounded-[10px] flex justify-between items-center px-3"
                >
                  <h2 className="text-[16px] font-inter font-bold text-[#000000]">
                    User profile
                  </h2>
                  <div className="flex items-center gap-5">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-[40px] w-20"
                      onClick={() => {
                        setCancelLoader(true);
                        setTimeout(() => {
                          route.push("/members");
                          setCancelLoader(false);
                        }, 1000);
                      }}
                      disabled={cancelLoader}
                    >
                      {cancelLoader ? (
                        <svg
                          className="animate-spin h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="#1A56DB"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-100"
                            fill="#1A56DB"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        "Cancel"
                      )}
                    </Button>
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
                        "Create Member"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddMember;
