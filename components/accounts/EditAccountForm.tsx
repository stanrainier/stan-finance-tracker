"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { doc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

type EditAccountFormProps = {
  account: {
    account_id: string;
    name: string;
    type: string;
    balance: number;
    color?: string;
  };
  onClose: () => void;
};

export function EditAccountForm({ account, onClose }: EditAccountFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState(account.name);
  const [type, setType] = useState<string>(account.type);
  const [balance, setBalance] = useState(account.balance.toString());
  const [color, setColor] = useState(account.color || "#3b82f6");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsedBalance = parseFloat(balance);
    const previousBalance = account.balance;
    const balanceDifference = parsedBalance - previousBalance;

    try {
      const accountRef = doc(db, "users", user.uid, "accounts", account.account_id);

      // 1. Update account data
      await updateDoc(accountRef, {
        name,
        type,
        balance: parsedBalance,
        color,
      });

      // 2. Log transaction only if balance changed
      if (balanceDifference !== 0) {
        const txType = balanceDifference > 0 ? "income" : "expense";
        const txRef = collection(db, "users", user.uid, "transactions");

        await addDoc(txRef, {
          type: txType,
          amount: Math.abs(balanceDifference),
          description: "Account balance adjustment",
          account_id: account.account_id,
          account_name: name,
          category: "Adjustment",
          date_incurred: serverTimestamp(),
          created_at: serverTimestamp(),
        });
      }

      onClose();
    } catch (error) {
      console.error("Failed to update account:", error);
      alert("Error updating account.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Account Name"
        required
      />

      <Select
        label="Account Type"
        selectedKeys={new Set([type])}
        onSelectionChange={(keys) => {
          const val = Array.from(keys)[0];
          setType(val as string);
        }}
      >
        <SelectItem key="Bank">Bank</SelectItem>
        <SelectItem key="Savings">Savings Account</SelectItem>
        <SelectItem key="E-wallet">E-wallet</SelectItem>
        <SelectItem key="Cash">Cash</SelectItem>
      </Select>

      <Input
        type="number"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        step="0.01"
        placeholder="Balance"
      />

      {/* Color Picker */}
      <div className="flex items-center gap-3">
        <label htmlFor="color" className="text-sm">
          Account Color:
        </label>
        <input
          type="color"
          id="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 border rounded"
        />
        <span className="text-xs text-gray-600">{color}</span>
      </div>

      <Button type="submit" color="primary">
        Save Changes
      </Button>
    </form>
  );
}
