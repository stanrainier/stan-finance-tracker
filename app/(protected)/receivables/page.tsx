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
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@heroui/button';
import { Card } from '@heroui/card';
import { Select, SelectItem } from '@heroui/select';
import AddReceivableForm from '@/components/receivables/AddReceivableForm';
import { TotalReceivablesCard } from '@/components/totals/totalReceivablesCard';

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
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
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

    const accountRef = doc(db, `users/${user.uid}/accounts/${selectedAccountId}`);
    const accountSnap = await getDoc(accountRef);
    if (!accountSnap.exists()) return;

    const account = accountSnap.data() as Account;
    const newBalance = account.balance + selectedReceivable.amount;

    await updateDoc(accountRef, { balance: newBalance });

    await updateDoc(doc(db, `users/${user.uid}/receivables/${selectedReceivable.id}`), {
      status: 'paid',
      amount: 0,
    });

    await addDoc(collection(db, `users/${user.uid}/transactions`), {
      account_id: selectedAccountId,
      type: 'income',
      category: 'Receivable',
      amount: selectedReceivable.amount,
      description: `Receive Receivable: ${selectedReceivable.name}`,
      created_at: Timestamp.now(),
    });

    setSelectedReceivable(null);
    setSelectedAccountId('');
    setShowPayModal(false);
    await fetchReceivables();
    await fetchAccounts();
  };

  const deleteReceivable = async (id: string) => {
    if (!user) return;
    const confirmed = window.confirm('Are you sure you want to delete this receivable?');
    if (!confirmed) return;

    await deleteDoc(doc(db, `users/${user.uid}/receivables/${id}`));
    await fetchReceivables();
  };

  return (
    <>
    <TotalReceivablesCard/>
      <div className="px-4 py-6 space-y-6 sm:px-6 md:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Receivables</h1>
          <Button
            color="primary"
            onClick={() => setShowAddModal(true)}
            className="shadow-xl/30 hover:shadow-xl/80 hover:scale-[1.03] transition-all duration-1000 cursor-pointer transform"
          >
            + Add Receivable
          </Button>
        </div>

        {/* Receivable List */}
        <div className="grid gap-4">
          {receivables.map(r => (
            <div
              key={r.id}
              className="p-4 rounded-lg shadow-xl/30 hover:shadow-xl/80 hover:scale-[1.03] transition-all duration-1000 transform flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white dark:bg-neutral-900 transition-all duration-300"
            >
              <div className="flex-1 space-y-1">
                <h2 className="text-lg font-semibold">{r.name}</h2>
                {r.description && (
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                )}
                <p className="text-base font-bold text-green-600">₱{r.amount.toFixed(2)}</p>
                {r.expectedDate && (
                  <p className="text-xs text-muted-foreground">
                    Due: {new Date(r.expectedDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-end w-full sm:w-auto">
                <Button
                  color="danger"
                  variant="ghost"
                  onClick={() => deleteReceivable(r.id)}
                  className="w-full sm:w-auto"
                >
                  Delete
                </Button>
                <Button
                  color="success"
                  disabled={r.status === 'paid'}
                  onClick={() => {
                    setSelectedReceivable(r);
                    setShowPayModal(true);
                  }}
                  className="w-full sm:w-auto"
                >
                  {r.status === 'paid' ? 'Received' : 'Mark as Paid'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Receivable Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
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

        {/* Pay Modal */}
        {showPayModal && selectedReceivable && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-default rounded-xl shadow-md w-full max-w-md p-6 space-y-4">
              <h2 className="text-lg font-semibold">
                Mark "{selectedReceivable.name}" as Paid
              </h2>

              <Select
                label="Select Account"
                selectedKeys={selectedAccountId ? [selectedAccountId] : []}
                onSelectionChange={(keys) => {
                  const id = Array.from(keys)[0] as string;
                  setSelectedAccountId(id);
                }}
                className="w-full"
                placeholder="Select Account"
                renderValue={(key) => {
                  const acc = accounts.find((a: any) => a.id === key);
                  return acc ? `${acc.name} (₱${acc.balance.toFixed(2)})` : 'Select Account';
                }}
              >
                {accounts.map(account => (
                  <SelectItem key={account.id} textValue={account.name}>
                    <div className="flex flex-col">
                      <span>{account.name}</span>
                      <span className="text-sm text-default-500">
                        ₱{account.balance.toFixed(2)}
                      </span>
                    </div>
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
    </>

  );
}
