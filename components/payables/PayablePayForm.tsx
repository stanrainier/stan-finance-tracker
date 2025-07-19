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
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Fetch accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user) return;

      const snap = await getDocs(collection(db, `users/${user.uid}/accounts`));
      const list: Account[] = [];
      snap.forEach((doc) => {
        const accountData = { id: doc.id, ...doc.data() } as Account;
        list.push(accountData);
        console.log('[PayablePayForm] Found account:', doc.id, accountData);
      });

      setAccounts(list);
      console.log('[PayablePayForm] Set accounts:', list);
    };

    fetchAccounts();
  }, [user]);

  const handlePay = async () => {
    if (!user || !amount || !selectedAccountId) {
      console.warn('[PayablePayForm] Missing required data to proceed with payment.');
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      console.warn('[PayablePayForm] Invalid payment amount:', amount);
      return;
    }

    const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
    console.log('[PayablePayForm] Selected account:', selectedAccountId, selectedAccount);

    if (!selectedAccount) {
      console.warn('[PayablePayForm] Selected account not found.');
      return;
    }

    if (selectedAccount.balance < paymentAmount) {
      console.warn('[PayablePayForm] Insufficient funds.');
      return;
    }

    const newPayableBalance = payable.balance - paymentAmount;
    const newAccountBalance = selectedAccount.balance - paymentAmount;

    const payableRef = doc(db, `users/${user.uid}/payables/${payable.id}`);
    const accountRef = doc(db, `users/${user.uid}/accounts/${selectedAccount.id}`);

    await Promise.all([
      updateDoc(payableRef, { balance: newPayableBalance }),
      updateDoc(accountRef, { balance: newAccountBalance }),
    ]);

    const now = Timestamp.now();

    await addDoc(collection(db, `users/${user.uid}/transactions`), {
      type: 'expense',
      amount: paymentAmount,
      description: `Payment to ${payable.accountName}`,
      account_id: selectedAccount.id,
      account_name: selectedAccount.name,
      category: 'Payables',
      related_to: {
        type: 'payable',
        id: payable.id,
        name: payable.accountName,
      },
      created_at: now,
      date_incurred: now,
    });

    console.log('[PayablePayForm] Payment submitted');

    setAmount('');
    setSelectedAccountId(null);
    await onSuccess();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Payable Pay Form</h1>

      <p className="text-sm text-muted-foreground">
        Current Payable Balance: ₱{Number(payable.balance).toFixed(2)}
      </p>

      <Select
        label="Account"
        selectedKeys={selectedAccountId ? new Set([selectedAccountId]) : new Set()}
        onSelectionChange={(keys) => {
          const key = Array.from(keys)[0] as string;
          console.log('[PayablePayForm] Selected account key:', key);
          setSelectedAccountId(key);
        }}
        renderValue={() => {
          const acc = accounts.find((a) => a.id === selectedAccountId);
          console.log('[PayablePayForm] renderValue found account:', acc);
          return acc ? acc.name : 'Select account';
        }}
        className="w-full"
      >
        {accounts.map((acc) => (
          <SelectItem key={acc.id} textValue={acc.name}>
            {acc.name} — ₱{acc.balance.toFixed(2)}
          </SelectItem>
        ))}
      </Select>

      <Input
        label="Payment amount"
        type="number"
        maxLength={payable.balance}
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          console.log('[PayablePayForm] Payment amount changed:', e.target.value);
        }}
      />

      <Button color="primary" onClick={handlePay}>
        Pay
      </Button>
    </div>
  );
}
