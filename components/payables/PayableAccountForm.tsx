"use client";

import { useEffect, useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

type PayableAccountFormProps = {
  onSuccess?: () => void;
};

export function PayableAccountForm({ onSuccess }: PayableAccountFormProps) {
  const { user } = useAuth();
  const [accountName, setAccountName] = useState("");
  const [balance, setBalance] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState<string | null>(null);

  const categories = ['Bills', 'Cash Payable', 'Credit','Loan', 'Subscription', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!accountName || !balance || !dueDate || !category) {
      setErrors("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, `users/${user.uid}/payables`), {
        accountName,
        balance: parseFloat(balance),
        dueDate,
        category,
        created_at: Timestamp.now(),
      });

      onSuccess?.();

      // Reset form
      setAccountName("");
      setBalance("");
      setDueDate("");
      setCategory("");
      setErrors(null);
    } catch (err) {
      console.error("Add payable failed", err);
      setErrors("Failed to save. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors && <p className="text-sm text-red-600">{errors}</p>}

      <Input
        label="Payable Name"
        value={accountName}
        onChange={(e) => setAccountName(e.target.value)}
        required
      />
      <Input
        type="number"
        label="Balance"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        step="0.01"
        required
      />
      <Select
        label="Category"
        selectedKeys={[category]}
        onSelectionChange={(keys) => setCategory(Array.from(keys)[0] as string)}
        className="w-full"
        required
      >
        {categories.map((cat) => (
          <SelectItem key={cat}>{cat}</SelectItem>
        ))}
      </Select>
      <Input
        type="date"
        label="Due Date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      />
      <Button type="submit" color="primary" className="w-full">
        Add Payable
      </Button>
    </form>
  );
}
