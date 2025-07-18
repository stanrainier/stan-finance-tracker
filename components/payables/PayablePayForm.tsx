'use client';

import { useState, useEffect } from 'react';
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectItem } from '@heroui/select';

type Payable = {
  id: string;
  accountName: string;
  balance: number;
  dueDate: string;
  category: string;
};

type Account = {
  id: string;
  name: string;
  balance: number;
  type: string;
};

type Props = {
  payable: Payable;
  onSuccess: () => Promise<void>;
};

export function PayablePayForm({ payable, onSuccess }: Props) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user) return;

      const snap = await getDocs(collection(db, `users/${user.uid}/accounts`));
      const list: Account[] = [];
      snap.forEach((doc) =>
        list.push({ id: doc.id, ...doc.data() } as Account)
      );
      setAccounts(list);
    };

    fetchAccounts();
  }, [user]);

  const handlePay = async () => {
    if (!user || !amount || !selectedAccountId) return;

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) return;

    const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
    if (!selectedAccount || selectedAccount.balance < paymentAmount) return;

    const newPayableBalance = payable.balance - paymentAmount;
    const newAccountBalance = selectedAccount.balance - paymentAmount;

    const payableRef = doc(
      db,
      `users/${user.uid}/payables/${payable.id}`
    );
    const accountRef = doc(
      db,
      `users/${user.uid}/accounts/${selectedAccount.id}`
    );

    await Promise.all([
      updateDoc(payableRef, { balance: newPayableBalance }),
      updateDoc(accountRef, { balance: newAccountBalance }),
    ]);

    await addDoc(collection(db, `users/${user.uid}/transactions`), {
      type: 'expense',
      amount: paymentAmount,
      description: `Payment to ${payable.accountName}`,
      account_id: selectedAccount.id,
      category: 'Payables',
      created_at: Timestamp.now(),
    });

    setAmount('');
    setSelectedAccountId(null);
    await onSuccess();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Current Payable Balance: ₱{Number(payable.balance).toFixed(2)}
      </p>

        <Select
        label="Account"
        selectedKeys={selectedAccountId ? new Set([selectedAccountId]) : undefined}
        onSelectionChange={(keys) => {
            const first = Array.from(keys)[0];
            if (typeof first === 'string') setSelectedAccountId(first);
        }}
        aria-label="Select account"
        >
        {accounts.map((account) => (
            <SelectItem key={account.id}>
            {account.name} — ₱{account.balance.toFixed(2)}
            </SelectItem>
        ))}
        </Select>
      <Input
        label="Payment amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <Button color="primary" onClick={handlePay}>
        Pay
      </Button>
    </div>
  );
}
