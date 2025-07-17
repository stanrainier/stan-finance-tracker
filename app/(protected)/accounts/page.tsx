"use client";

import { useEffect, useState } from "react";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Modal } from "@heroui/modal";
import { FaPlus } from "react-icons/fa";
import { AddAccountForm } from "@/components/accounts/AddAccountForm";

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "accounts"),
      (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({
          account_id: doc.id,
          ...doc.data(),
        }));
        setAccounts(fetched);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="relative space-y-6">
      <h1 className="text-xl font-semibold">Accounts</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card key={account.account_id} className="hover:shadow-md transition">
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{account.name}</p>
                <p className="text-sm text-muted-foreground">{account.type}</p>
              </div>
              <p className="text-green-600 font-bold">
                ₱{account.balance?.toFixed(2) ?? "0.00"}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Floating + Button */}
      <Button
        size="lg"
        className="fixed bottom-24 right-24 rounded-full p-3 shadow-lg"
        onClick={() => setOpen(true)}
      >
        <FaPlus className="w-5 h-5" />
      </Button>

      {/* Modal with AddAccountForm */}
      {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="p-6 rounded-lg w-full max-w-md shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Add Account</h2>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-black text-xl">
              &times;
            </button>
          </div>
          <AddAccountForm onSuccess={() => setOpen(false)} />
        </div>
      </div>
    )}
    </div>
  );
}
