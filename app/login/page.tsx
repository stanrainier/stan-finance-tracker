// app/login/page.tsx
"use client";

import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import { useState } from "react";
import {Card, CardHeader, CardBody, CardFooter} from "@heroui/card";

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/"); // redirect to homepage after successful login
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google sign-in failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <Card className="p-6 rounded shadow-md w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Sign In</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition"
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
          Sign in with Google
        </button>
      </Card>
    </div>
  );
}
