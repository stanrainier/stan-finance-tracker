'use client';

import { useEffect, useState } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

type Payable = {
  id: string;
  accountName: string;
  balance: number;
};

type PayableAddFormProps = {
  onSuccess?: () => void;
  payable?: Payable;
};

export function PayableAddForm({ onSuccess, payable }: PayableAddFormProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (payable) {
      setAmount(''); // don't prefill balance anymore since we're adding
    }
  }, [payable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !payable?.id) return;

    if (!amount) {
      setError('Amount is required');
      return;
    }

    const inputAmount = parseFloat(amount);

    if (isNaN(inputAmount)) {
      setError('Invalid amount');
      return;
    }

    try {
      // Update payable balance using increment()
      const payableRef = doc(db, `users/${user.uid}/payables`, payable.id);
      await updateDoc(payableRef, {
        balance: increment(inputAmount),
      });

      // Record this as a transaction
      await addDoc(collection(db, `users/${user.uid}/transactions`), {
        amount: inputAmount,
        type: 'payable',
        created_at: Timestamp.now(),
        payable_id: payable.id,
      });

      setAmount('');
      setError(null);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to update payable balance:', err);
      setError('Failed to save. Try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {payable && (
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{payable.accountName}</h1>
          <h1 className="text-lg text-red-600">
            ₱{Number(payable.balance).toFixed(2)}
          </h1>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Input
        type="number"
        label="Amount to Add"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        step="0.01"
        min="0.01"
        required
      />

      <Button type="submit" color="primary" className="w-full">
        Add Payable Amount
      </Button>
    </form>
  );
}
