"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

type Props = {
  account_id: string;
  onSuccess?: () => void;
};

export function AddTransactionForm({ account_id, onSuccess }: Props) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [dateIncurred, setDateIncurred] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const now = Timestamp.now();

    const data = {
      account_id,
      user_id: user.uid,
      amount: parseFloat(amount),
      type,
      category,
      description,
      date_incurred: dateIncurred ? Timestamp.fromDate(new Date(dateIncurred)) : now,
      created_at: now,
      updated_at: now,
    };

    try {
      await addDoc(collection(db, "transactions"), data);
      setAmount("");
      setType("income");
      setCategory("");
      setDescription("");
      setDateIncurred("");
      onSuccess?.();
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Error adding transaction.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        step="0.01"
      />
      
      <Select
        label="Type"
        selectedKeys={[type]}
        onSelectionChange={(keys) => {
          const val = Array.from(keys)[0] as string;
          setType(val);
        }}
      >
        <SelectItem key="income">Income</SelectItem>
        <SelectItem key="expense">Expense</SelectItem>
      </Select>

      <Input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />

      <Input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <Input
        type="date"
        value={dateIncurred}
        onChange={(e) => setDateIncurred(e.target.value)}
        required
      />

      <Button type="submit" color="primary">
        Add Transaction
      </Button>
    </form>
  );
}
