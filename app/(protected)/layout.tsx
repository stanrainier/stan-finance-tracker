"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Providers } from "../providers";
import Header from "@/components/header";
import { Navbar } from "@/components/navbar";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return <>
          <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <Header />
            <div className="relative flex flex-col h-screen">
              <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
                {children}
              </main>
            </div>
            <Navbar />

          </Providers>
          </>;
}
