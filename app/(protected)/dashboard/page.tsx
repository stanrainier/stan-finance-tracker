"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {Divider} from "@heroui/divider";
import { IoMdAdd } from "react-icons/io";
import { MdArrowOutward } from "react-icons/md";
import { FiArrowDownLeft } from "react-icons/fi";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
  description?: string;
  name?: string;
  date_incurred?: { toDate: () => Date };
}

interface Account {
  balance: number;
}

export default function DashboardPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [accountBalance, setAccountBalance] = useState<number>(0);
  const [today, setToday] = useState<string>("");

  const [name, setName] =useState<string|null>("")

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const now = new Date();
        const formatted = new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(now);
        setToday(formatted);
        setName(user.displayName)
      // Fetch transactions
      const txnSnapshot = await getDocs(collection(db, `users/${user.uid}/transactions`));
      const txnData: Transaction[] = txnSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];

      let income = 0;
      let expense = 0;

      txnData.forEach((tx) => {
        if (tx.type === "income") income += tx.amount;
        else if (tx.type === "expense") expense += tx.amount;
      });

      setTransactions(txnData);
      setTotalIncome(income);
      setTotalExpense(Math.abs(expense));

      // Fetch accounts
      const accountsSnapshot = await getDocs(collection(db, `users/${user.uid}/accounts`));
      const balances: number[] = accountsSnapshot.docs.map((doc) => {
        const data = doc.data() as Account;
        return data.balance || 0;
      });
      const totalBal = balances.reduce((acc, bal) => acc + bal, 0);
      setAccountBalance(totalBal);
    };

    fetchData();
  }, []);

  const getIconAndBg = (type: "income" | "expense") => {
    if (type === "income") {
      return {
        icon: <FaArrowUp size={16} className="text-white" />,
        bg: "bg-green-500",
      };
    }
    return {
      icon: <FaArrowDown size={16} className="text-white" />,
      bg: "bg-red-500",
    };
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <section className="space-y-1">
        <h2 className="text-2xl font-bold">Hello there! {name}</h2>
        {today && (
          <p className="text-muted-foreground">Today is {today}</p>
        )}
      </section>
      <Divider className="my-8" />
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

      <Card className="shadow-md">
        <CardBody>
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-green-600 font-bold text-2xl">
            ₱{accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </CardBody>
      </Card>
      <Divider className="my-8" />

      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg">Recent Transactions</h2>
        <Button variant="light" size="sm" onClick={() => router.push("/transactions")}>Add New</Button>
      </div>

      <div className="space-y-3">
        {transactions.slice(0, 5).map((tx) => {
          const { icon, bg } = getIconAndBg(tx.type);
          return (
            <Card key={tx.id} className="shadow-sm">
              <CardBody className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${bg} rounded-full p-2`}>{icon}</div>
                  <div>
                    <p className="font-semibold">{tx.description || tx.name || "Transaction"}</p>
                    <p className="text-sm text-muted-foreground">{tx.category || "-"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "income" ? "+" : "-"}₱{Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {tx.date_incurred?.toDate().toLocaleDateString() || "-"}
                  </p>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

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
