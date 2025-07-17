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
              className={`p-4 border border-gray-300 rounded-lg shadow-sm flex justify-between items-center  ${
                  txn.type === "income" ? "bg-green-100" : "bg-red-100"
                }`}
            >
              <div>
                <p className="font-semibold text-lg text-gray-900">{txn.account_name}</p>
                <p className="text-sm font-medium  text-gray-900">{txn.category}</p>
                <p className="text-sm text-gray-900">{txn.description}</p>
                <p className="text-sm text-gray-900">
                  {txn.date_incurred.toDate().toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 text-right">
              <span className={`text-base font-bold  ${
                  txn.type === "income" ? "text-green-500" : "text-red-500"
                }`}>
                {txn.type === "income" ? "+" : "-"}₱{txn.amount.toFixed(2)}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  txn.type === "income" ? "bg-green-300" : "bg-red-300"
                }`}
              >
                {txn.type === "income" ? (
                  <FaArrowUp className="w-4 h-4 text-green-600" />
                ) : (
                  <FaArrowDown className="w-4 h-4 text-red-600" />
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
