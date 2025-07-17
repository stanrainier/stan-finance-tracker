import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Select, SelectItem } from "@heroui/select";

type AddAccountFormProps = {
  onSuccess?: () => void;
};

export function AddAccountForm({ onSuccess }: AddAccountFormProps) {
  const { user } = useAuth();
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<string | null>(null); // store selected value
  const [balance, setBalance] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !accountType) return;

    const data = {
      name: accountName,
      type: accountType,
      balance: parseFloat(balance) || 0,
      created_at: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, "users", user.uid, "accounts"), data);
      setAccountName("");
      setAccountType(null);
      setBalance("");
      onSuccess?.();
    } catch (error) {
      console.error("Error adding account:", error);
      alert("Error adding account.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        type="text"
        placeholder="Account Name (e.g. SeaBank)"
        value={accountName}
        onChange={(e) => setAccountName(e.target.value)}
        required
      />

      <Select
        label="Account Type"
        selectedKeys={accountType ? new Set([accountType]) : new Set()}
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0];
          setAccountType(value as string);
        }}
        placeholder="Select Account Type"
      >
        <SelectItem key="Bank">Bank</SelectItem>
        <SelectItem key="E-wallet">E-wallet</SelectItem>
        <SelectItem key="Cash">Cash</SelectItem>
      </Select>

      <Input
        type="number"
        placeholder="Initial Balance (₱)"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        step="0.01"
      />

      <Button type="submit" color="primary">
        Add Account
      </Button>
    </form>
  );
}
