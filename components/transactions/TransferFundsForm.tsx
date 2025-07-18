"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

type Account = {
  id: string;
  name: string;
  balance: number;
};

export function TransferFundsForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const fromAccount = accounts.find((acc) => acc.id === fromAccountId);
  const toAccount = accounts.find((acc) => acc.id === toAccountId);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user) return;
      const q = query(collection(db, "users", user.uid, "accounts"));
      const snapshot = await getDocs(q);
      const list: Account[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Account, "id">),
      }));
      setAccounts(list);
    };

    fetchAccounts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fromAccountId || !toAccountId || !amount) return;

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    if (fromAccountId === toAccountId) {
      alert("Cannot transfer to the same account.");
      return;
    }

    setLoading(true);

    const fromAccountRef = doc(db, "users", user.uid, "accounts", fromAccountId);
    const toAccountRef = doc(db, "users", user.uid, "accounts", toAccountId);

    if (!fromAccount || !toAccount) {
      alert("Accounts not found.");
      setLoading(false);
      return;
    }

    if (fromAccount.balance < transferAmount) {
      alert("Insufficient balance.");
      setLoading(false);
      return;
    }

    try {
      // Update balances
      await updateDoc(fromAccountRef, {
        balance: fromAccount.balance - transferAmount,
      });
      await updateDoc(toAccountRef, {
        balance: toAccount.balance + transferAmount,
      });

      const now = Timestamp.now();

      // Log transaction (from)
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        account_id: fromAccountId,
        user_id: user.uid,
        type: "transfer",
        amount: transferAmount,
        category: "Transfer - Sender",
        description: description || `Transfer to ${toAccount.name}`,
        created_at: now,
        date_incurred: now,
        account_name: fromAccount.name,
      });

      // Log transaction (to)
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        account_id: toAccountId,
        user_id: user.uid,
        type: "transfer",
        amount: transferAmount,
        category: "Transfer - Receiver",
        description: description || `Transfer from ${fromAccount.name}`,
        created_at: now,
        date_incurred: now,
        account_name: toAccount.name,
      });

      if (onSuccess) onSuccess();

      // Reset form
      setFromAccountId("");
      setToAccountId("");
      setAmount("");
      setDescription("");
    } catch (err) {
      console.error("Transfer failed:", err);
      alert("Transfer failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-xl font-semibold">Transfer Funds</h2>

      {/* FROM ACCOUNT */}
      <div>
        <Select
          label="From Account"
          selectedKeys={[fromAccountId]}
          onSelectionChange={(keys) =>
            setFromAccountId(Array.from(keys)[0] as string)
          }
        >
          {accounts.map((acc) => (
            <SelectItem key={acc.id}>{acc.name}</SelectItem>
          ))}
        </Select>
        {fromAccount && (
          <p className="text-sm text-muted-foreground mt-1">
            Balance: ₱{fromAccount.balance.toFixed(2)}
          </p>
        )}
      </div>

      {/* TO ACCOUNT */}
      <div>
        <Select
          label="To Account"
          selectedKeys={[toAccountId]}
          onSelectionChange={(keys) =>
            setToAccountId(Array.from(keys)[0] as string)
          }
        >
          {accounts.map((acc) => (
            <SelectItem key={acc.id}>{acc.name}</SelectItem>
          ))}
        </Select>
        {toAccount && (
          <p className="text-sm text-muted-foreground mt-1">
            Balance: ₱{toAccount.balance.toFixed(2)}
          </p>
        )}
      </div>

      {/* AMOUNT */}
      <Input
        type="number"
        label="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount to transfer"
        min="0"
        step="0.01"
      />

      <Input
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="E.g. Transfer for savings"
      />

      <Button color="primary" type="submit" isLoading={loading}>
        Transfer Funds
      </Button>
    </form>
  );
}
