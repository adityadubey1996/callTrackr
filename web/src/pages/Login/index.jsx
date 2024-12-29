"use client";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/components/ui/form";
import { Input } from "@/components/components/ui/input";
import { useToast } from "@/components/hooks/use-toast";
import { google, login } from "../../config/api";
import PasswordField from "@/components/passwordField";
import { GoogleLogin } from "@react-oauth/google";
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export function LoginForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const [enableButton, setEnableButton] = React.useState(false);

  async function onSubmit(values) {
    try {
      await login(values);

      toast({
        title: "Welcome Back!",
        description:
          "You successfully navigated the login labyrinth. Let's roll!",
        variant: "success",
      });
      navigate("/file-upload"); // Redirect to the profile page
    } catch (error) {
      toast({
        title: "Oops! Something Went Wrong",
        description:
          "The login gremlins are at it again. Double-check your details and try again!",
        variant: "destructive",
      });
      console.error("Login Error:", error); // Error handling is already in the interceptor
    }
  }

  // const handleGoogleResponse = async (response) => {
  //   try {
  //     const token = response.credential;
  //     console.log("Google Token:", token);

  //     // Send token to backend
  //     await google(JSON.stringify({ token }));

  //     toast({
  //       title: "Welcome!",
  //       description: "You've successfully signed in with Google!",
  //       variant: "success",
  //     });
  //   } catch (error) {
  //     console.error("Google Sign-In Error:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to sign in with Google. Try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };
  function checkCookiesEnabled() {
    document.cookie = "testcookie=1";
    const cookiesEnabled = document.cookie.indexOf("testcookie") !== -1;

    if (!cookiesEnabled) {
      alert(
        "Cookies are disabled in your browser. Please enable cookies to log in with Google OAuth."
      );
    }

    // Optionally clear the test cookie
    document.cookie =
      "testcookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  React.useEffect(() => {
    checkCookiesEnabled();
  }, []);

  const handleGoogleResponse = async (response) => {
    if (response.credential) {
      console.log("Google ID Token:", response.credential);
      await google({ token: response.credential, isLogin: true });
      // Send the ID token to your backend
      toast({
        title: "Welcome!",
        description: "You've successfully signed in with Google!",
        variant: "success",
      });
      navigate("/file-upload");
    } else {
      console.error("Google Sign-In Error:", response);
      toast({
        title: "Error",
        description: "Google sign-in failed. Try again.",
        variant: "destructive",
      });
    }
  };

  const handleErrorResponse = (response) => {
    console.error("Google Sign-In Error:", response);

    toast({
      title: "Error",
      description: "Google sign-in failed. Try again.",
      variant: "destructive",
    });
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
          Login
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      {...field}
                      className="bg-gray-800 text-white border border-gray-700 focus:ring-blue-500 focus:border-blue-500"
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
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <PasswordField
                    id="password"
                    label="Password"
                    placeholder="Enter your password"
                    {...field} // Pass value, onChange, and onBlur
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button
              onClick={() => navigate("/register")}
              className="w-full "
              variant="outline"
            >
              Register
            </Button>
          </form>
        </Form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={handleGoogleResponse}
            onError={handleErrorResponse}
          />
        </div>
      </div>
    </div>
  );
}
