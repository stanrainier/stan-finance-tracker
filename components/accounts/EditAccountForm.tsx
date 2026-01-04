"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

type Account = {
  account_id: string;
  name: string;
  type: string;
  balance: number;
  color?: string;
  icon?: string | null;
};

type EditAccountFormProps = {
  account: Account;
  onClose: () => void;
};

const ICONS = [
  { name: "AUB", src: "/assets/aub.png" },
  { name: "BDO", src: "/assets/bdo.png" },
  { name: "BPI", src: "/assets/bpi.png" },
  { name: "ChinaBank", src: "/assets/chinabank.png" },
  { name: "CIMB", src: "/assets/cimb.png" },
  { name: "EastWest", src: "/assets/eastwest.png" },
  { name: "GCash", src: "/assets/gcash.png" },
  { name: "GoTyme", src: "/assets/gotyme.png" },
  { name: "MariBank", src: "/assets/maribank.webp" },
  { name: "Maya", src: "/assets/maya.png" },
  { name: "MetroBank", src: "/assets/metrobank.png" },
  { name: "PNB", src: "/assets/pnb.png" },
  { name: "RCBC", src: "/assets/rcbc.png" },
  { name: "UnionBank", src: "/assets/unionbank.png" },
];

export function EditAccountForm({ account, onClose }: EditAccountFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState(account.name);
  const [type, setType] = useState<string>(account.type);
  const [balance, setBalance] = useState(account.balance.toString());
  const [color, setColor] = useState(account.color || "#3b82f6");
  const [icon, setIcon] = useState<string | null>(account.icon || null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const parsedBalance = parseFloat(balance);
    const balanceDifference = parsedBalance - account.balance;

    try {
      const accountRef = doc(db, "users", user.uid, "accounts", account.account_id);

      // Update account details
      await updateDoc(accountRef, {
        name,
        type,
        balance: parsedBalance,
        color,
        icon,
      });

      // Log transaction only if balance changed
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
    } catch (err) {
      console.error("Failed to update account:", err);
      alert("Error updating account.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete account "${name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);

    try {
      const accountRef = doc(db, "users", user.uid, "accounts", account.account_id);

      // Log a transaction for the remaining balance
      if (account.balance !== 0) {
        const txRef = collection(db, "users", user.uid, "transactions");
        await addDoc(txRef, {
          type: "expense",
          amount: account.balance,
          description: "Account deletion",
          account_id: account.account_id,
          account_name: name,
          category: "Adjustment",
          date_incurred: serverTimestamp(),
          created_at: serverTimestamp(),
        });
      }

      await deleteDoc(accountRef);
      onClose();
    } catch (err) {
      console.error("Failed to delete account:", err);
      alert("Error deleting account.");
    } finally {
      setLoading(false);
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
        required
      />

      {/* Icon Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-muted-foreground">Select Icon:</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIcon(null)}
            className={`border rounded p-1 text-xs ${
              !icon ? "border-blue-500" : "border-gray-300"
            }`}
          >
            None / Remove
          </button>
          {ICONS.map((i) => (
            <button
              key={i.name}
              type="button"
              onClick={() => setIcon(i.src)}
              className={`border rounded p-1 ${
                icon === i.src ? "border-blue-500" : "border-gray-300"
              }`}
            >
              <img src={i.src} alt={i.name} className="w-8 h-8 object-contain" />
            </button>
          ))}
        </div>
      </div>

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

      <div className="flex flex-col gap-2">
        <Button type="submit" color="primary" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" color="danger" onClick={handleDelete} disabled={loading}>
          {loading ? "Processing..." : "Delete Account"}
        </Button>
      </div>
    </form>
  );
}
