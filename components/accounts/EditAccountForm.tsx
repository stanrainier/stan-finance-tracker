"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

type EditAccountFormProps = {
  account: {
    account_id: string;
    name: string;
    type: string;
    balance: number;
    color?: string; // Allow undefined if not initially set
  };
  onClose: () => void;
};

export function EditAccountForm({ account, onClose }: EditAccountFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState(account.name);
  const [type, setType] = useState<string>(account.type);
  const [balance, setBalance] = useState(account.balance.toString());
  const [color, setColor] = useState(account.color || "#3b82f6"); // Default fallback color

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const accountRef = doc(db, "users", user.uid, "accounts", account.account_id);
      await updateDoc(accountRef, {
        name,
        type,
        balance: parseFloat(balance),
        color, // Include color
      });
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
