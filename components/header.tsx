"use client";

import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { ThemeSwitch } from "./theme-switch";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
      {/* Toggle for small screens */}
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((prev) => !prev)}
        />
      </NavbarContent>

      {/* Brand logo */}
      <NavbarContent className="sm:flex grow justify-start hidden">
        <NavbarBrand>
          <h1 className="text-xl font-bold tracking-wide">
            Stan Finance App
          </h1>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop-only user + theme + logout */}
      <NavbarContent justify="end" className="hidden sm:flex items-center gap-4">
        {user && (
          <NavbarItem>
            <div className="flex items-center gap-2">
              <img
                src={user.photoURL || ""}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{user.displayName}</span>
            </div>
          </NavbarItem>
        )}

        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>

        <NavbarItem>
          <Button onClick={logout} color="danger" variant="flat">
            Logout
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Mobile dropdown menu */}
      <NavbarMenu open={menuOpen}>
        <NavbarMenuItem>
          {user && (
            <div className="flex items-center gap-3 py-2">
              <img
                src={user.photoURL || ""}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="text-base font-medium">{user.displayName}</div>
            </div>
          )}
        </NavbarMenuItem>

        <NavbarMenuItem>
          <ThemeSwitch />
        </NavbarMenuItem>

        <NavbarMenuItem>
          <Button onClick={logout} color="danger" variant="flat" fullWidth>
            Logout
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </HeroUINavbar>
  );
}
