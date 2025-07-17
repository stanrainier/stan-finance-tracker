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
import { EditAccountForm } from "@/components/accounts/EditAccountForm";
import { CiBank } from "react-icons/ci";
import { FaWallet } from "react-icons/fa6";
import { RiCoinsFill } from "react-icons/ri";
import { IoMdCash } from "react-icons/io";


export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);

  const accountTypeIcons: Record<string, JSX.Element> = {
    Bank: <CiBank className="text-xl" />,
    'E-wallet': <FaWallet className="text-xl" />,
    Savings: <RiCoinsFill className="text-xl" />,
    Cash: <IoMdCash className="text-xl" />,
  };

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
        <div
            key={account.account_id}
            onClick={() => {
              setSelectedAccount(account);
              setEditModalOpen(true);
            }}
            style={{ backgroundColor: account.color ?? "#cdcdcdbd" }}
            className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
          >
          <div className="flex justify-between items-center text-white w-full">
            {/* Left Side: Icon + Account Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 dark:bg-gray-800">
                {accountTypeIcons[account.type] || (
                  <IoMdCash className="text-xl text-zinc-700 dark:text-zinc-200" />
                )}
              </div>
              <div>
                <p className="font-semibold text-white">{account.name}</p>
                <p className="text-sm text-muted-foreground">{account.type}</p>
              </div>
            </div>

            {/* Right Side: Balance */}
            <p className="text-white font-bold">
              ₱{account.balance?.toFixed(2) ?? "0.00"}
            </p>
          </div>

          </div>
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm ">
        <div className="p-6 rounded-lg w-full max-w-md shadow-lg  bg-default">
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
    {editModalOpen && selectedAccount && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="p-6 rounded-lg w-full max-w-md shadow-lg bg-default" >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Edit Account</h2>
            <button onClick={() => setEditModalOpen(false)} className="text-gray-500 hover:text-black text-xl">
              &times;
            </button>
          </div>
          <EditAccountForm
            account={selectedAccount}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedAccount(null);
            }}
          />
        </div>
      </div>
    )}
    </div>
  );
}
