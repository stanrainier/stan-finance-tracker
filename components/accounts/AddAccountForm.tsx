import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Select, SelectItem } from "@heroui/select";

import aubIcon from "@/public/assets/aub.png";
import bdoIcon from "@/public/assets/bdo.png";
import bpiIcon from "@/public/assets/bpi.png";
import chinabankIcon from "@/public/assets/chinabank.png";
import cimbIcon from "@/public/assets/cimb.png";
import eastwestIcon from "@/public/assets/eastwest.png";
import gcashIcon from "@/public/assets/gcash.png";
import gotymeIcon from "@/public/assets/gotyme.png";
import maribankIcon from "@/public/assets/maribank.webp";
import mayaIcon from "@/public/assets/maya.png";
import metrobankIcon from "@/public/assets/metrobank.png";
import pnbIcon from "@/public/assets/pnb.png";
import rcbcIcon from "@/public/assets/rcbc.png";
import unionbankIcon from "@/public/assets/unionbank.png";

type AddAccountFormProps = {
  onSuccess?: () => void;
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

export function AddAccountForm({ onSuccess }: AddAccountFormProps) {
  const { user } = useAuth();
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<string | null>(null);
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [icon, setIcon] = useState<string | null>(null); // store icon src

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !accountType) return;

    const data = {
      name: accountName,
      type: accountType,
      balance: parseFloat(balance) || 0,
      color: color,
      icon: icon, // save selected icon or null
      created_at: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, "users", user.uid, "accounts"), data);
      setAccountName("");
      setAccountType(null);
      setBalance("");
      setColor("#3b82f6");
      setIcon(null);
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
        <SelectItem key="Savings">Savings Account</SelectItem>
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
        <label htmlFor="color" className="text-sm text-muted-foreground">
          Account Color:
        </label>
        <input
          type="color"
          id="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 border-none p-0 bg-transparent cursor-pointer"
        />
        <span className="text-xs text-muted-foreground">{color}</span>
      </div>

      <Button type="submit" color="primary">
        Add Account
      </Button>
    </form>
  );
}
