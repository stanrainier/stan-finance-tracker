"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Divider } from "@heroui/divider";
import { IoMdAdd } from "react-icons/io";
import { MdArrowOutward } from "react-icons/md";
import { FiArrowDownLeft } from "react-icons/fi";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
// Removed import of Modal, ModalBody, ModalHeader, ModalFooter
import { AddTransactionForm } from "@/components/transactions/AddTransactionForm";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
  description?: string;
  name?: string;
  date_incurred?: { toDate: () => Date };
  account_name: string;

}

interface Account {
  balance: number;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [accountBalance, setAccountBalance] = useState(0);
  const [today, setToday] = useState("");
  const [name, setName] = useState<string | null>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calculateTotals = (data: Transaction[]) => {
    let income = 0;
    let expense = 0;
    data.forEach(({ amount, type }) => {
      if (type === "income") income += amount;
      else if (type === "expense") expense += amount;
    });
    setTotalIncome(income);
    setTotalExpense(Math.abs(expense));
  };

  const fetchDashboardData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    setName(user.displayName ?? "");
    setToday(
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date())
    );

    const txnSnapshot = await getDocs(collection(db, `users/${user.uid}/transactions`));
    const txnData: Transaction[] = txnSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];

    setTransactions(txnData);
    calculateTotals(txnData);

    const accSnapshot = await getDocs(collection(db, `users/${user.uid}/accounts`));
    const total = accSnapshot.docs.reduce((sum, doc) => {
      const data = doc.data() as Account;
      return sum + (data.balance || 0);
    }, 0);

    setAccountBalance(total);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getIconAndBg = (type: "income" | "expense") => {
    return type === "income"
      ? {
          icon: <FaArrowUp size={16} className="text-white" />,
          bg: "bg-green-500",
        }
      : {
          icon: <FaArrowDown size={16} className="text-white" />,
          bg: "bg-red-500",
        };
  };

  return (
    <div className="space-y-6 ">
      <h1 className="text-4xl font-semibold">Dashboard</h1>

      <section>
        <h2 className="text-2xl font-bold">Hello there! {name}</h2>
        {today && <p className="text-muted-foreground">Today is {today}</p>}
      </section>

      <Divider className="my-8" />
      {/* Balance */}
      <Card className="shadow-md">
        <CardBody>
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-green-600 font-bold text-2xl">
            ₱{accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </CardBody>
      </Card>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-md">
          <CardBody className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-3">
                <MdArrowOutward className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-green-600 font-bold text-lg">
                  ₱{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-md">
          <CardBody className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-3">
                <FiArrowDownLeft className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-red-600 font-bold text-lg">
                  ₱{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>



      <Divider className="my-8" />

      {/* Transactions Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg">Recent Transactions</h2>
        <Button variant="light" size="sm" onClick={() => setIsModalOpen(true)}>
          Add New
        </Button>
      </div>

      {/* Recent Transactions List */}
      <div className="space-y-3">
        {transactions.slice(0, 5).map((tx) => {
          const { icon, bg } = getIconAndBg(tx.type);
          return (
          <div
            key={tx.id}
            className={`shadow-sm border rounded-md p-4 flex justify-between items-start  ${tx.type === "income" ? "border-green-300" : "border-red-300"}`}
          >
            {/* Left section: date + description + category */}
            <div>
              <p className="font-semibold text-2xl ">{tx.account_name || tx.name || "Transaction"}</p>
              <p className="text-sm text-muted-foreground mb-4">{tx.category || "-"}</p>
              <p className="font-semibold text-xl mb-2">{tx.description || tx.name || "Transaction"}</p>
              <Divider className="my-4"/>
              <p className="text-sm text-muted-foreground mb-1">
                {tx.date_incurred?.toDate().toLocaleDateString() || "-"}
              </p>
            </div>

            {/* Right section: amount + icon */}
            <div className="flex items-center gap-3 ">
              <p className={`font-bold text-2xl ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {tx.type === "income" ? "+" : "-"}₱{Math.abs(tx.amount).toFixed(2)}
              </p>
              <div className={`${bg} rounded-full p-2`}>{icon}</div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Floating Action Button */}
      <Button
        isIconOnly
        size="lg"
        className="fixed bottom-20 right-6 rounded-full shadow-lg"
        onClick={() => setIsModalOpen(true)}
      >
        <IoMdAdd size={24} />
      </Button>

      {/* Custom Modal implemented with div */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm ">
          <div className="bg-default rounded-lg shadow-lg w-full max-w-md relative p-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg font-bold"
              aria-label="Close modal"
              type="button"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">Add New Transaction</h3>
            <AddTransactionForm
              onSuccess={() => {
                setIsModalOpen(false);
                fetchDashboardData();
              }}
            />
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
