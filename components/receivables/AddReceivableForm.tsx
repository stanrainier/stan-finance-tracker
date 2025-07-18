'use client';

import { useState } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

type AddReceivableFormProps = {
  onSuccess?: () => void;
};

export default function AddReceivableForm({ onSuccess }: AddReceivableFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const numericAmount = parseFloat(amount);

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a valid number greater than 0.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const receivableData: any = {
        name: name.trim(),
        description: description.trim(),
        amount: numericAmount,
        created_at: Timestamp.now(),
      };

      if (dueDate) {
        receivableData.due_date = Timestamp.fromDate(new Date(dueDate));
      }

      await addDoc(collection(db, `users/${user.uid}/receivables`), receivableData);

      // Reset
      setName('');
      setDescription('');
      setAmount('');
      setDueDate('');
      onSuccess?.();
    } catch (err) {
      console.error('Failed to add receivable:', err);
      setError('Failed to save receivable. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <h1>Add Receivable Entry</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Input
        label="Receivable Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Input
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <Input
        label="Due Date (optional)"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <Button type="submit" color="primary" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Add Receivable'}
      </Button>
    </form>
  );
}
