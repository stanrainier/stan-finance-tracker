import { FaRegCreditCard } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import { HiOutlineCash } from "react-icons/hi";
import { IoMdHome } from "react-icons/io";
import { PiHandCoinsFill } from "react-icons/pi";

export const siteConfig = {
  name: "Stan's Finance App",
  description: "Track your finances.",
  navItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: IoMdHome ,
    },
    {
      label: "Accounts",
      href: "/accounts",
      icon: FaRegCreditCard ,
    },
    {
      label: "Transactions",
      href: "/transactions",
      icon: GrTransaction,
    },
    {
      label: "Receivables",
      href: "/receivables",
      icon: PiHandCoinsFill ,
    },
    {
      label: "Payables",
      href: "/payables",
      icon: HiOutlineCash,
    },
  ],
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: IoMdHome,
    },
    {
      label: "Accounts",
      href: "/accounts",
      icon: FaRegCreditCard ,
    },
    {
      label: "Transactions",
      href: "/transactions",
      icon: GrTransaction,
    },
    {
      label: "Receivables",
      href: "/receivables",
      icon: PiHandCoinsFill ,
    },
    {
      label: "Payables",
      href: "/payables",
      icon: HiOutlineCash,
    },
  ],
};
