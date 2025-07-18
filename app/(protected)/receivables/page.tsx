'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@heroui/button';
import { Card } from '@heroui/card';
import { Select, SelectItem } from '@heroui/select';
import AddReceivableForm from '@/components/receivables/AddReceivableForm';

type Account = {
  id: string;
  name: string;
  balance: number;
};

type Receivable = {
  id: string;
  name: string;
  description?: string;
  amount: number;
  expectedDate?: string;
  created_at?: Timestamp;
  status?: 'pending' | 'paid';
};

export default function ReceivablesPage() {
  const { user } = useAuth();
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReceivables();
      fetchAccounts();
    }
  }, [user]);

  const fetchReceivables = async () => {
    if (!user) return;
    const snap = await getDocs(collection(db, `users/${user.uid}/receivables`));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receivable));
    setReceivables(data);
  };

  const fetchAccounts = async () => {
    if (!user) return;
    const snap = await getDocs(collection(db, `users/${user.uid}/accounts`));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
    setAccounts(data);
  };

  const markAsPaid = async () => {
    if (!user || !selectedReceivable || !selectedAccountId) return;

    try {
      const accountRef = doc(db, `users/${user.uid}/accounts/${selectedAccountId}`);
      const accountSnap = await getDoc(accountRef);

      if (!accountSnap.exists()) {
        throw new Error('Selected account not found');
      }

      const account = accountSnap.data() as Account;

      // Update account balance
      await updateDoc(accountRef, {
        balance: account.balance + selectedReceivable.amount,
      });

      // Add transaction
      await addDoc(collection(db, `users/${user.uid}/transactions`), {
        account_id: selectedAccountId,
        type: 'income',
        amount: selectedReceivable.amount,
        description: `Receivable: ${selectedReceivable.name}`,
        created_at: Timestamp.now(),
      });

      // Mark receivable as paid
      await updateDoc(doc(db, `users/${user.uid}/receivables/${selectedReceivable.id}`), {
        status: 'paid',
      });

      setSelectedReceivable(null);
      setSelectedAccountId(null);
      setShowPayModal(false);
      await fetchReceivables();
      await fetchAccounts();
    } catch (err) {
      console.error('Error marking as paid:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Receivables</h1>
        <Button onClick={() => setShowAddModal(true)}>Add Receivable</Button>
      </div>

      <div className="grid gap-4">
        {receivables.map(r => (
          <Card key={r.id} className="p-4 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">{r.name}</h2>
              {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
              <p className="text-base font-bold text-green-600">₱{r.amount.toFixed(2)}</p>
              {r.expectedDate && (
                <p className="text-xs text-muted-foreground">
                  Due: {new Date(r.expectedDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div>
              <Button
                color="success"
                disabled={r.status === 'paid'}
                onClick={() => {
                  setSelectedReceivable(r);
                  setShowPayModal(true);
                }}
              >
                {r.status === 'paid' ? 'Received' : 'Mark as Paid'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Receivable Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-default rounded-xl shadow-md w-full max-w-md p-6">
            <AddReceivableForm
              onSuccess={() => {
                fetchReceivables();
                setShowAddModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Mark as Paid Modal */}
      {showPayModal && selectedReceivable && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-default rounded-xl shadow-md w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Mark "{selectedReceivable.name}" as Paid
            </h2>
            <Select
              label="Select Account"
              value={selectedAccountId ?? ''}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedAccountId(event.target.value)
              }
            >
              {accounts.map(account => (
                <SelectItem key={account.id}>
                  {account.name} (₱{account.balance.toFixed(2)})
                </SelectItem>
              ))}
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowPayModal(false)}>
                Cancel
              </Button>
              <Button
                color="success"
                onClick={markAsPaid}
                disabled={!selectedAccountId}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
