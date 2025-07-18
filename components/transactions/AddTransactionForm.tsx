"use client";

import { useEffect, useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

import { incomeCategories, expenseCategories } from "@/constants/categories";

type Props = {
  onSuccess?: () => void;
};

export function AddTransactionForm({ onSuccess }: Props) {
  const { user } = useAuth();

  const [accounts, setAccounts] = useState<{ id: string; name: string; balance: number }[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedAccountBalance, setSelectedAccountBalance] = useState<number>(0);

  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [dateIncurred, setDateIncurred] = useState("");
  const [errorAmount, setErrorAmount] = useState(false);
  useEffect(() => {
    const loadAccounts = async () => {
      if (!user) return;

      const accountsRef = collection(db, "users", user.uid, "accounts");
      const snapshot = await getDocs(accountsRef);

      const accList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const docRef = docSnap.ref;

          if (data.amount === undefined) {
            await updateDoc(docRef, { amount: 0 });
            data.amount = 0;
          }

          const balance = typeof data.balance === "number" ? data.balance : 0;

          return {
            id: docSnap.id,
            name: data.name || "Unnamed Account",
            balance,
          };
        })
      );

      setAccounts(accList);
      if (accList.length > 0) {
        setSelectedAccountId(accList[0].id);
        setSelectedAccountBalance(accList[0].balance);
      }
    };

    loadAccounts();
  }, [user]);

  // Update balance display when account changes
  useEffect(() => {
    const selected = accounts.find((acc) => acc.id === selectedAccountId);
    if (selected) setSelectedAccountBalance(selected.balance);
  }, [selectedAccountId, accounts]);

  useEffect(() => {
    setCategory("");
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedAccountId) return;

    const now = Timestamp.now();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {

      alert("Please enter a valid amount greater than 0.");
      return;
    }

    if (type === "expense" || type === "transfer" && parsedAmount > selectedAccountBalance) {
      
      alert("Expense amount exceeds the account balance.");
      return;
    }

    const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
    const accountName = selectedAccount?.name || "Unnamed Account";
    const data = {
      account_id: selectedAccountId,
      account_name: accountName,
      user_id: user.uid,
      amount: parsedAmount,
      type,
      category,
      description,
      date_incurred: dateIncurred ? Timestamp.fromDate(new Date(dateIncurred)) : now,
      created_at: now,
      updated_at: now,
    };

    try {
      await addDoc(collection(db, "users", user.uid, "transactions"), data);

      const accountRef = doc(db, "users", user.uid, "accounts", selectedAccountId);
      const accountSnap = await getDoc(accountRef);

      if (accountSnap.exists()) {
        const accountData = accountSnap.data();
        const currentBalance =
          typeof accountData.balance === "number" ? accountData.balance : 0;

        const updatedBalance =
          type === "income" ? currentBalance + parsedAmount : currentBalance - parsedAmount;

        await updateDoc(accountRef, {
          balance: updatedBalance,
          updated_at: now,
        });
      }

      setType("income");
      setAmount("");
      setCategory("");
      setDescription("");
      setDateIncurred("");
      setSelectedAccountId(accounts.length > 0 ? accounts[0].id : null);

      onSuccess?.();
    } catch (err) {
      console.error("Error adding transaction:", err);
      alert("An error occurred while adding the transaction.");
    }
  };

  if (!user) return <p>Loading user...</p>;
  if (accounts.length === 0) return <p>No accounts found. Please create one first.</p>;

  return (
    
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">              
      <h3 className="text-xl font-semibold">
        Add New Transaction
      </h3>
      <Select
        label="Account"
        selectedKeys={selectedAccountId ? [selectedAccountId] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          setSelectedAccountId(selected);
        }}
      >
        {accounts.map((acc) => (
          <SelectItem key={acc.id}>{acc.name}</SelectItem>
        ))}
      </Select>

      {/* Display current balance */}
      <div className="text-sm text-muted-foreground italic">
        Current Balance: ₱{selectedAccountBalance.toFixed(2)}
      </div>

      <Select
        label="Type"
        selectedKeys={[type]}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          setType(selected);
        }}
      >
        <SelectItem key="income">Income</SelectItem>
        <SelectItem key="expense">Expense</SelectItem>
      </Select>

      <Input
        startContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small">₱</span>
          </div>
        }
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        step="0.01"
      />


      <Select
        label="Category"
        selectedKeys={category ? [category] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          setCategory(selected);
        }}
        required
      >
        {(type === "income" ? incomeCategories : expenseCategories).map((cat) => (
          <SelectItem key={cat}>{cat}</SelectItem>
        ))}
      </Select>

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
