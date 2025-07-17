'use client';

import { useEffect, useState } from "react";
import { AddTransactionForm } from "@/components/transactions/AddTransactionForm";
import { Button } from "@heroui/button";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { Divider } from "@heroui/divider";
import { CiBank } from "react-icons/ci";
import { FaWallet } from "react-icons/fa6";
import { RiCoinsFill } from "react-icons/ri";
import { IoMdCash } from "react-icons/io";

type Transaction = {
  id: string;
  account_id: string;
  user_id: string;
  amount: number;
  type: string;
  category: string;
  description: string;
  date_incurred: Timestamp;
  created_at: Timestamp;
  account_name: string;
};

export default function Page() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const accountTypeIcons: Record<string, JSX.Element> = {
    Bank: <CiBank className="text-xl" />,
    'E-wallet': <FaWallet className="text-xl" />,
    Savings: <RiCoinsFill className="text-xl" />,
    Cash: <IoMdCash className="text-xl" />,
  };

const fetchTransactions = async () => {
  if (!user) return;

  setLoading(true);

  const transactionsRef = collection(db, "users", user.uid, "transactions");
  const q = query(transactionsRef, orderBy("date_incurred", "desc"));
  const snapshot = await getDocs(q);

  const list: Transaction[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Transaction[];

  setTransactions(list);
  setLoading(false);
};


  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const handleSuccess = () => {
    setShowForm(false);
    fetchTransactions();
  };

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>

      {!showForm && (
        <Button color="primary" onClick={() => setShowForm(true)}>
          Add Transaction
        </Button>
      )}

      {showForm && (
        <div className="mt-4">
          <AddTransactionForm onSuccess={handleSuccess} />
        </div>
      )}
    <Divider className="my-8" />
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Your Transactions</h2>

      {loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul className="space-y-4">
          {transactions.map((txn) => (
            <li
              key={txn.id}
              className={`p-4 rounded-xl shadow-sm border flex justify-between items-start gap-4 transition-all ${
                txn.type === "income" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}
            >
              {/* Left side: icon + details */}
              <div className="flex gap-4 items-center">
                {/* Circular icon */}
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 dark:bg-gray-700">
                  {accountTypeIcons[txn.type] || (
                    <IoMdCash className="text-xl text-white" />
                  )}
                </div>

                {/* Transaction info */}
                <div className="space-y-0.5 text-sm">
                  <p className="font-semibold text-xl text-black">
                    {txn.account_name}
                  </p>
                  <p className="text-black italic text-md">{txn.category}</p>
                  <p className="text-black text-md">{txn.description}</p>
                  <p className="text-xs text-black">
                    {txn.date_incurred.toDate().toLocaleDateString()}
                  </p>
                </div>
              </div>


              {/* Right side: amount + arrow */}
              <div className="flex flex-col items-end justify-center gap-2 text-right">
                {/* Amount */}
                <span
                  className={`text-lg font-bold ${
                    txn.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {txn.type === "income" ? "+" : "-"}₱{txn.amount.toFixed(2)}
                </span>

                {/* Icon bubble */}
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    txn.type === "income" ? "bg-green-200" : "bg-red-200"
                  }`}
                >
                  {txn.type === "income" ? (
                    <FaArrowUp className="w-4 h-4 text-green-700" />
                  ) : (
                    <FaArrowDown className="w-4 h-4 text-red-700" />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>

    </main>
  );
}
