"use client";

import {
  NavbarItem,
} from "@heroui/navbar";
import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

export const Navbar = () => {
  const pathname = usePathname();

  return (
<nav className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-gray-900 px-4 py-2 flex justify-between sm:justify-evenly shadow-[0_-1px_3px_rgba(0,0,0,0.1)] dark:shadow-[0_-1px_3px_rgba(255,255,255,0.05)]">
  {siteConfig.navItems.map((item) => {
    const isActive = pathname === item.href;

    return (
      <NextLink
        key={item.href}
        href={item.href}
        className={clsx(
          "flex flex-col items-center justify-center text-[8px] sm:text-xs transition",
          isActive
            ? "text-blue-600 font-semibold"
            : "text-gray-500 hover:text-blue-500",
        )}
      >
        <item.icon size={22} className="mb-1" />
        {item.label}
      </NextLink>
    );
  })}
</nav>

  );
};
