"use client";

import { Card, CardBody } from "@heroui/card";
import {
  FaUniversity,
  FaWallet,
} from "react-icons/fa";
import { SiCashapp } from "react-icons/si";
import { GiPayMoney } from "react-icons/gi";
import { MdSavings } from "react-icons/md";
import { TbCurrencyCent } from "react-icons/tb";

export default function AccountsPage() {
  const accounts = [
    {
      id: 1,
      name: "Bank Account",
      type: "BPI Savings",
      balance: 12000.0,
      icon: <FaUniversity size={20} className="text-white" />,
      iconBg: "bg-blue-600",
    },
    {
      id: 2,
      name: "GCash",
      type: "Mobile Wallet",
      balance: 3500.0,
      icon: <SiCashapp size={20} className="text-white" />,
      iconBg: "bg-indigo-500",
    },
    {
      id: 3,
      name: "Cash",
      type: "On Hand",
      balance: 1000.0,
      icon: <GiPayMoney size={20} className="text-white" />,
      iconBg: "bg-green-600",
    },
    {
      id: 4,
      name: "SeaBank",
      type: "Digital Bank",
      balance: 5200.0,
      icon: <MdSavings size={20} className="text-white" />,
      iconBg: "bg-teal-600",
    },
    {
      id: 5,
      name: "PayMaya",
      type: "E-Wallet",
      balance: 2400.0,
      icon: <SiCashapp size={20} className="text-white" />,
      iconBg: "bg-emerald-500",
    },
    {
      id: 6,
      name: "GoTyme",
      type: "Digital Bank",
      balance: 3100.0,
      icon: <TbCurrencyCent size={20} className="text-white" />,
      iconBg: "bg-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Accounts</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card key={account.id} className="shadow-sm hover:shadow-md transition">
            <CardBody className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`${account.iconBg} p-3 rounded-full`}>
                  {account.icon}
                </div>
                <div>
                  <p className="font-semibold">{account.name}</p>
                  <p className="text-sm text-muted-foreground">{account.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  ₱{account.balance.toFixed(2)}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
