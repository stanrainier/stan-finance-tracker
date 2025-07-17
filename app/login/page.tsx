// app/login/page.tsx
"use client";

import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { BiSolidBadgeDollar } from "react-icons/bi";

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google sign-in failed.");
    }
  };

  return (
<div className="min-h-screen flex items-center justify-center px-4">
  
  <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl shadow-xl px-6 py-8 space-y-6">
      <h1 className="text-xl font-bold flex items-center  ml-4">
        <BiSolidBadgeDollar size={40}/>
        <span>tan&apos;s Finance Tracker</span>
      </h1>
      <Divider className="my-4"/>
    {/* Header */}
    <div className="text-center">

      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Welcome Back
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        Sign in to your account
      </p>
    </div>

    {/* Error Message */}
    {error && (
      <p className="text-sm text-red-500 text-center font-medium">
        {error}
      </p>
    )}

    {/* Sign in Button */}
    <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-md bg-white text-gray-700 border hover:shadow-md transition dark:bg-zinc-800 dark:text-gray-200 dark:border-zinc-700"
    >
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
      >
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.3-5.7 7-10.3 7-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C34.6 7.1 29.6 5 24 5 12.4 5 3 14.4 3 26s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.1-.1-2.1-.4-3.1z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.2 16.5 18.7 14 24 14c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C34.6 7.1 29.6 5 24 5 16.3 5 9.6 9.2 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 47c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.5 37.7 26.9 39 24 39c-4.6 0-8.7-2.7-10.3-7L6.2 36.3C9.5 41.8 16.2 47 24 47z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-0.9 2.5-2.6 4.7-4.9 6.2l6.6 5.6C40.4 36.1 43 31.4 43 26c0-1.1-.1-2.1-.4-3.1z"
        />
      </svg>
      <span className="text-sm font-semibold">Sign in with Google</span>
    </button>

    {/* Footer */}
    <div className="text-xs text-center text-gray-500 dark:text-gray-400">
      By signing in, you agree to our{" "}
      <span className="underline cursor-pointer">Terms</span> and{" "}
      <span className="underline cursor-pointer">Privacy Policy</span>.
    </div>
    
  </div>
</div>

  );
}
