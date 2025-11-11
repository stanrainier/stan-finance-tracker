"use client";

import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { FaPlus, FaWallet } from "react-icons/fa6";
import { CiBank } from "react-icons/ci";
import { RiCoinsFill } from "react-icons/ri";
import { IoMdCash } from "react-icons/io";
import { AddAccountForm } from "@/components/accounts/AddAccountForm";
import { EditAccountForm } from "@/components/accounts/EditAccountForm";

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState("All");
  const [hasFetched, setHasFetched] = useState(false); // ✅ Track if data loaded

  const accountTypeIcons: Record<string, JSX.Element> = {
    Bank: <CiBank className="text-xl" />,
    "E-wallet": <FaWallet className="text-xl" />,
    Savings: <RiCoinsFill className="text-xl" />,
    Cash: <IoMdCash className="text-xl" />,
  };

  const accountTypes = ["All", "Bank", "E-wallet", "Savings", "Cash"];

  const fetchAccounts = async (forceRefresh = false) => {
    if (!user) return;
    // ✅ Skip if already loaded and not forcing refresh
    if (!forceRefresh && hasFetched) return;
    
    const snapshot = await getDocs(
      collection(db, "users", user.uid, "accounts")
    );
    const fetched = snapshot.docs.map((doc) => ({
      account_id: doc.id,
      ...doc.data(),
    }));
    setAccounts(fetched);
    setHasFetched(true); // ✅ Mark as fetched
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const filteredAccounts = selectedType === "All"
    ? accounts
    : accounts.filter((a) => a.type === selectedType);

  const groupedAccounts: Record<string, any[]> = filteredAccounts.reduce(
    (acc, account) => {
      const type = account.type || "Others";
      if (!acc[type]) acc[type] = [];
      acc[type].push(account);
      return acc;
    },
    {} as Record<string, any[]>
  );

  return (
    <div className="relative space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-xl font-semibold">Accounts</h1>
        <div className="w-52">
          <Select
            label="Filter by type"
            size="sm"
            className="max-w-xs"
            selectedKeys={[selectedType]}
            onSelectionChange={(keys) =>
              setSelectedType(Array.from(keys)[0] as string)
            }
          >
            {accountTypes.map((type) => (
              <SelectItem key={type}>
                {type}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedAccounts).map(([type, grouped]) => (
          <div key={type}>
            <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              {type}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped.map((account) => (
                <div
                  key={account.account_id}
                  onClick={() => {
                    setSelectedAccount(account);
                    setEditModalOpen(true);
                  }}
                  style={{ backgroundColor: account.color ?? "#cdcdcdbd" } }
                  className="p-6  rounded-xl shadow-xl/30 hover:shadow-xl/80 hover:scale-[1.03] transition-all duration-1000 cursor-pointer transform"
                >
                  <div className="flex justify-between items-center text-white w-full">
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
                    <p className="text-white font-bold">
                      ₱{account.balance?.toFixed(2) ?? "0.00"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filteredAccounts.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-2 text-center text-muted-foreground italic">
            <p>No accounts found{selectedType !== "All" && " with selected type"}.</p>
          </div>
        )}
      </div>

      {/* Floating + Button */}
      <Button
        size="lg"
        className="fixed bottom-24 right-24 rounded-full p-3 shadow-lg"
        onClick={() => setOpen(true)}
      >
        <FaPlus className="w-5 h-5" />
      </Button>

      {/* Add Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="p-6 rounded-lg w-full max-w-md shadow-lg bg-default">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Account</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-black text-xl"
              >
                &times;
              </button>
            </div>
            <AddAccountForm onSuccess={() => {
              setOpen(false);
              fetchAccounts(true); // ✅ Force refresh
            }} />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="p-6 rounded-lg w-full max-w-md shadow-lg bg-default">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit Account</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-500 hover:text-black text-xl"
              >
                &times;
              </button>
            </div>
            <EditAccountForm
              account={selectedAccount}
              onClose={() => {
                setEditModalOpen(false);
                setSelectedAccount(null);
                fetchAccounts(true); // ✅ Force refresh
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
