"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Divider } from "@heroui/divider";
import { IoMdAdd } from "react-icons/io";
import { MdArrowOutward } from "react-icons/md";
import { FiArrowDownLeft } from "react-icons/fi";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { AddTransactionForm } from "@/components/transactions/AddTransactionForm";
import { TransferFundsForm } from "@/components/transactions/TransferFundsForm";
import { useRouter } from "next/navigation";
import { TotalPayablesCard } from "@/components/totals/TotalPayablesCard";
import { TotalReceivablesCard } from "@/components/totals/totalReceivablesCard";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category?: string;
  description?: string;
  name?: string;
  date_incurred?: { toDate: () => Date };
  created_at?: { toDate: () => Date };
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
  const [modalTab, setModalTab] = useState<"transaction" | "transfer">("transaction");

  const router = useRouter();

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

  const txnQuery = query(
    collection(db, `users/${user.uid}/transactions`),
    orderBy("created_at", "desc")
  );
  const txnSnapshot = await getDocs(txnQuery);
  const txnData: Transaction[] = txnSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Transaction[];

  // ✅ Filter only last 24 hours
  const recentOnly = txnData.filter((tx) => {
    const txDate = tx.date_incurred?.toDate();
    if (!txDate) return false;

    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    return txDate >= yesterday && txDate <= now;
  });

  setTransactions(recentOnly);
  calculateTotals(recentOnly);

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

const getIconAndBg = (
  type: "income" | "expense" | "transfer",
  category?: string
) => {
  if (type === "income") {
    return {
      icon: <FaArrowUp size={16} className="text-white" />,
      bg: "bg-green-500",
    };
  }

  if (type === "expense") {
    return {
      icon: <FaArrowDown size={16} className="text-white" />,
      bg: "bg-red-500",
    };
  }

  // Transfer category check
  if (type === "transfer" && category === "Transfer - Sender") {
    return {
      icon: <FiArrowDownLeft size={16} className="text-white" />,
      bg: "bg-indigo-800",
    };
  }

  return {
    icon: <MdArrowOutward size={16} className="text-white" />,
    bg: "bg-blue-500",
  };
};


  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold">Dashboard</h1>

      <section>
        <h2 className="text-2xl font-bold">Hello there! {name}</h2>
        {today && <p className="text-muted-foreground">Today is {today}</p>}
      </section>

      <Divider className="my-8" />

      <Card className="shadow-xl/30 hover:shadow-xl/80 hover:scale-[1.03] transition-all duration-1000 cursor-pointer transform ">
        <CardBody>
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-green-600 font-bold text-2xl">
            ₱{accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-md shadow-xl/30 hover:shadow-xl/80 hover:scale-[1.03] transition-all duration-1000 cursor-pointer transform ">
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

        <Card className="shadow-md shadow-xl/30 hover:shadow-xl/80 hover:scale-[1.03] transition-all duration-1000 cursor-pointer transform ">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TotalReceivablesCard/>
              <TotalPayablesCard/>
        </div>

      <Divider className="my-8" />

      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg">Recent Transactions</h2>
        <Button variant="light" size="sm" onClick={() => router.push("/transactions")}>
          View All Transactions
        </Button>
      </div>

<div className="space-y-3 pb-24">
  {transactions.slice(0, 5).map((tx) => {
    const { icon, bg } = getIconAndBg(tx.type, tx.category);
    return (
      <div
        key={tx.id}
        className={` rounded-xl shadow-xl/30 hover:shadow-xl/80 hover:scale-[1.03] transition-all duration-1000 cursor-pointer transform  border rounded-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
          tx.type === "income"
            ? "border-green-300"
            : tx.type === "expense"
            ? "border-red-300"
            : "border-blue-300"
        }`}
      >
        {/* Left section (main info) */}
        <div className="flex-1 w-full ">
          <p className="font-semibold text-lg sm:text-2xl">
            {tx.account_name || tx.name || "Transaction"}
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            {tx.category || "-"}
          </p>
          <p className="font-semibold text-base sm:text-xl mb-2">
            {tx.description || tx.name || "Transaction"}
          </p>
          <Divider className="my-2 sm:my-4" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            {tx.date_incurred
              ? new Intl.DateTimeFormat("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }).format(tx.date_incurred.toDate())
              : "-"}
          </p>
        </div>

        {/* Right section (amount + icon) */}
        <div className="flex flex-row sm:flex-col items-center justify-between sm:items-end sm:justify-center gap-3 sm:gap-2 w-full sm:w-auto">
          <p
            className={`font-bold text-lg sm:text-2xl ${
              tx.type === "income"
                ? "text-green-600"
                : tx.type === "expense"
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            {tx.type === "income"
              ? "+"
              : tx.type === "expense"
              ? "-"
              : "⇄"}
            ₱{Math.abs(tx.amount).toFixed(2)}
          </p>
          <div className={`${bg} rounded-full p-2`}>{icon}</div>
        </div>
      </div>
    );
  })}
</div>


      <Button
        isIconOnly
        size="lg"
        className="fixed bottom-20  shadow-md  right-6 rounded-full hover:scale-[1.03] shadow-xl  transition-all duration-1000 transform"
        onClick={() => {
          setIsModalOpen(true);
          setModalTab("transaction");
        }}
      >
        <IoMdAdd size={24} />
      </Button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-default rounded-lg shadow-lg w-full max-w-md relative p-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg font-bold"
              aria-label="Close modal"
              type="button"
            >
              ✕
            </button>

          <div className="flex justify-center mb-4">
            <div className="flex gap-2">
              <Button
                variant={modalTab === "transaction" ? "solid" : "ghost"}
                color="secondary"
                size="md"
                onClick={() => setModalTab("transaction")}
              >
                Transaction
              </Button>
              <Button
                variant={modalTab === "transfer" ? "solid" : "ghost"}
                color="secondary"
                size="md"
                onClick={() => setModalTab("transfer")}
              >
                Transfer
              </Button>
            </div>
          </div>


            {modalTab === "transaction" ? (
              <AddTransactionForm
                onSuccess={() => {
                  setIsModalOpen(false);
                  fetchDashboardData();
                }}
              />
            ) : (
              <TransferFundsForm
                onSuccess={() => {
                  setIsModalOpen(false);
                  fetchDashboardData();
                }}
              />
            )}

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
