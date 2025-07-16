"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // your custom hook

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard"); // or redirect anywhere else
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <section className="flex flex-col gap-4 py-4 md:py-10 px-4 sm:px-8">
      <div className="w-full max-w-7xl mx-auto">{children}</div>
    </section>
  );
}
