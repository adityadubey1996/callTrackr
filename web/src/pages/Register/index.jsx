"use client";

import * as React from "react";
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
import { useNavigate } from "react-router-dom";
import PasswordField from "@/components/passwordField";
import { google, signup } from "../../config/api";
import { GoogleLogin } from "@react-oauth/google";

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    surname: z.string().min(2, {
      message: "Surname must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function RegisterForm() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values) {
    try {
      console.log("values from onSubmit", values);
      await signup(values);
      toast({
        title: "Registration Successful",
        description:
          "Well done! You've braved the email-password gauntlet and emerged victorious.",
        variant: "success",
      });
    } catch (error) {
      console.error("Registration Error:", error); // Error handling is already in the interceptor
    }
  }
  const handleGoogleResponse = async (response) => {
    if (response.credential) {
      console.log("Google ID Token:", response.credential);
      await google({ token: response.credential, isRegister: true });
      // Send the ID token to your backend
      toast({
        title: "Welcome!",
        description: "You've successfully signed in with Google!",
        variant: "success",
      });
      navigate("/profile");
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
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-md m-20">
        <h2 className="text-3xl font-bold text-center text-white">
          Create an Account
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your name"
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
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Surname</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your surname"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
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
                  <FormLabel className="text-white">Password</FormLabel>
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Confirm Password</FormLabel>
                  <PasswordField
                    id="confirmPassword"
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    {...field} // Pass value, onChange, and onBlur
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Register
            </Button>
          </form>
        </Form>
        <Button
          onClick={() => navigate("/login")}
          className="w-full "
          variant="outline"
        >
          Login
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-900 px-2 text-gray-400">
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
