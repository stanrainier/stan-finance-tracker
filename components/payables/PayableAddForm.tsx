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
  getDoc,
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
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPayable = async () => {
      if (user && payable?.id) {
        setIsLoading(true);
        try {
          const payableRef = doc(db, `users/${user.uid}/payables`, payable.id);
          const payableSnap = await getDoc(payableRef);
          if (payableSnap.exists()) {
            const data = payableSnap.data();
            console.log('Fetched Payable:', data);
            setCurrentBalance(data.balance ?? 0);
          } else {
            console.warn('Payable not found in Firestore');
            setCurrentBalance(payable.balance); // fallback
          }
        } catch (err) {
          console.error('Failed to fetch payable:', err);
          setError('Failed to load payable data.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (payable) {
      setAmount('');
      fetchPayable();
    }
  }, [payable, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !payable?.id) return;

    if (!amount) {
      setError('Amount is required');
      return;
    }

    const inputAmount = parseFloat(amount);

    if (isNaN(inputAmount) || inputAmount <= 0) {
      setError('Invalid amount');
      return;
    }

    try {
      const payableRef = doc(db, `users/${user.uid}/payables`, payable.id);

      await updateDoc(payableRef, {
        balance: increment(inputAmount),
      });

      await addDoc(collection(db, `users/${user.uid}/transactions`), {
        amount: inputAmount,
        type: 'payable',
        created_at: Timestamp.now(),
        payable_id: payable.id,
        payable_name: payable.accountName,
      });

      setAmount('');
      setError(null);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to update payable balance:', err);
      setError('Failed to save. Try again.');
    }
  };

  const parsedAmount = parseFloat(amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;
  const baseBalance = currentBalance ?? payable?.balance ?? 0;
  const newBalance = baseBalance + (isValidAmount ? parsedAmount : 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {payable && (
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-gray-800">
            {payable.accountName || 'Unnamed Payable'}
          </h1>
          {isLoading ? (
            <h2 className="text-lg text-gray-500 italic">Loading balance...</h2>
          ) : (
            <h2 className="text-2xl font-semibold text-red-600">
              Current Balance: ₱{baseBalance.toFixed(2)}
            </h2>
          )}
          {isValidAmount && !isLoading && (
            <p className="text-green-600 text-sm font-medium">
              Balance After Payment: ₱{newBalance.toFixed(2)}
            </p>
          )}
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
