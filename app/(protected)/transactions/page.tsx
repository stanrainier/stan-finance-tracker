"use client";

import { Card, CardBody } from "@heroui/card";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { HiArrowDownLeft } from "react-icons/hi2";

export default function TransactionsPage() {
  const transactionsByDate = {
    "July 16": [
      {
        id: 1,
        title: "Pay",
        category: "Salary",
        amount: 17000,
        type: "income",
        icon: <FaArrowUp size={16} className="text-white" />,
        iconBg: "bg-green-500",
      },
      {
        id: 2,
        title: "Food",
        category: "Food & Dining",
        amount: -200,
        type: "expense",
        icon: <FaArrowDown size={16} className="text-white" />,
        iconBg: "bg-red-500",
      },
      {
        id: 3,
        title: "basta",
        category: "Shopping",
        amount: -50,
        type: "expense",
        icon: <HiArrowDownLeft size={16} className="text-white" />,
        iconBg: "bg-yellow-500",
      },
    ],
    "July 15": [
      {
        id: 4,
        title: "Snacks",
        category: "Food & Dining",
        amount: -75,
        type: "expense",
        icon: <FaArrowDown size={16} className="text-white" />,
        iconBg: "bg-red-500",
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Transactions</h1>

      {Object.entries(transactionsByDate).map(([date, transactions]) => (
        <div key={date} className="space-y-3">
          <h2 className="text-md font-medium text-muted-foreground">{date}</h2>

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
                    {tx.amount > 0
                      ? `+ $${tx.amount.toFixed(2)}`
                      : `- $${Math.abs(tx.amount).toFixed(2)}`}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
