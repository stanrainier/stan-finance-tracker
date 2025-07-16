"use client";

import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { ThemeSwitch } from "./theme-switch";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <HeroUINavbar isBordered maxWidth="xl" className="mx-auto">
      {/* Left content (Brand) */}
      <NavbarContent justify="start">
        <NavbarBrand>
          <h1 className="text-xl font-bold tracking-wide">Stan Finance App</h1>
        </NavbarBrand>
      </NavbarContent>

      {/* Right content */}
      <NavbarContent justify="end">
        <NavbarItem>
          {user && (
            <div className="flex items-center gap-2">
              <img
                src={user.photoURL || ""}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{user.displayName}</span>
            </div>
          )}
        </NavbarItem>

        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>

        <NavbarItem>
          <Button onClick={logout} color="danger" variant="flat">
            Logout
          </Button>
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
}
