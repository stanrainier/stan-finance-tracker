"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { GoArrowUpRight } from "react-icons/go";
import { FiArrowDownLeft } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { HiArrowDownLeft } from "react-icons/hi2";
import { MdArrowOutward } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const transactions = [
    {
      id: 1,
      title: "Pay",
      category: "Salary",
      amount: 17000,
      type: "income",
      date: "Jul 16",
      icon: <FaArrowUp size={16} className="text-white" />,
      iconBg: "bg-green-500",
    },
    {
      id: 2,
      title: "Food",
      category: "Food & Dining",
      amount: -200,
      type: "expense",
      date: "Jul 16",
      icon: <FaArrowDown size={16} className="text-white" />,
      iconBg: "bg-red-500",
    },
    {
      id: 3,
      title: "basta",
      category: "Shopping",
      amount: -50,
      type: "expense",
      date: "Jul 16",
      icon: <HiArrowDownLeft size={16} className="text-white" />,
      iconBg: "bg-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <section className="space-y-1">
        <h2 className="text-2xl font-bold">Hello there!</h2>
        <p className="text-muted-foreground">July 2025</p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Income */}
        <Card className="shadow-md">
          <CardBody className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-3">
                <MdArrowOutward className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-green-600 font-bold text-lg">₱17,000.00</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Expenses */}
        <Card className="shadow-md">
          <CardBody className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-3">
                <FiArrowDownLeft  className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-red-600 font-bold text-lg">₱250.00</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Current Balance */}
      <Card className="shadow-md">
        <CardBody>
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-green-600 font-bold text-2xl">+ ₱16,750.00</p>
        </CardBody>
      </Card>

      {/* Recent Transactions */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg">Recent Transactions</h2>
        <Button variant="light" size="sm" onClick={() => router.push("/transactions")}>
          Add New
        </Button>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <Card key={tx.id} className="shadow-sm">
            <CardBody className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`${tx.iconBg} rounded-full p-2`}>
                  {tx.icon}
                </div>
                <div>
                  <p className="font-semibold">{tx.title}</p>
                  <p className="text-sm text-muted-foreground">{tx.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold ${
                    tx.amount > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.amount > 0 ? `+ $${tx.amount.toFixed(2)}` : `- $${Math.abs(tx.amount).toFixed(2)}`}
                </p>
                <p className="text-sm text-muted-foreground">{tx.date}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Floating Add Button */}
      <Button
        isIconOnly
        size="lg"
        className="fixed bottom-20 right-6 rounded-full shadow-lg"
        onClick={() => router.push("/transactions/new")}
      >
        <IoMdAdd size={24} />
      </Button>
    </div>
  );
}
