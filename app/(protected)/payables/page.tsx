'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@heroui/button';
import { useAuth } from '@/hooks/useAuth';
import { PayableAccountForm } from '@/components/payables/PayableAccountForm';
import { PayablePayForm } from '@/components/payables/PayablePayForm';
import { PayableAddForm } from '@/components/payables/PayableAddForm'; // <-- this is the edit form
import { TotalPayablesCard } from '@/components/totals/TotalPayablesCard';

type Payable = {
  id: string;
  accountName: string;
  balance: number;
  dueDate: string;
  category: string;
};

type ModalState =
  | { isOpen: false }
  | {
      isOpen: true;
      payable: Payable;
      activeTab: 'pay' | 'edit';
    };

export default function PayablesPage() {
  const { user } = useAuth();
  const [payables, setPayables] = useState<Payable[]>([]);
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });
  const [showAddForm, setShowAddForm] = useState(false); // for + Add Payable

  const fetchPayables = async () => {
    if (!user) return;
    const snapshot = await getDocs(collection(db, `users/${user.uid}/payables`));
    const list: Payable[] = [];
    snapshot.forEach((doc) =>
      list.push({
        id: doc.id,
        ...(doc.data() as Omit<Payable, 'id'>),
      })
    );
    setPayables(list);
  };

  const closeModal = () => setModalState({ isOpen: false });
  const closeAddForm = () => setShowAddForm(false);

  const handleSuccess = async () => {
    await fetchPayables();
    closeModal();
    closeAddForm();
  };

  useEffect(() => {
    fetchPayables();
  }, [user]);

  return (
    <>
    <TotalPayablesCard/>
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payables</h1>
        <Button onClick={() => setShowAddForm(true)}>+ Add Payable</Button>
      </div>

      {showAddForm && (
        <div className="border rounded-lg p-4 mb-6 bg-default shadow">
          <h2 className="text-lg font-semibold mb-4">New Payable</h2>
          <PayableAccountForm onSuccess={handleSuccess} />
          <div className="mt-4">
            <Button onClick={closeAddForm} variant="ghost">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {payables.map((payable) => (
          <div
            key={payable.id}
            className="p-4 cursor-pointer hover:bg-muted/30 transition border border-border rounded-lg mb-2"
            onClick={() =>
              setModalState({ isOpen: true, payable, activeTab: 'pay' })
            }
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{payable.accountName}</h2>
                <p className="text-sm text-muted-foreground">
                  Category: {payable.category}
                </p>
                <p className="text-sm text-muted-foreground">
                   Due: {payable.dueDate}
                </p>
              </div>
              <p className="text-lg font-bold text-red-600">
                ₱{Number(payable.balance).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal with pay/edit tabs */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-default rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              aria-label="Close modal"
            >
              &times;
            </button>

            <div className="flex justify-center gap-4 mb-4">
              <Button
                color="secondary"
                variant="ghost"
                onClick={() =>
                  setModalState({
                    ...modalState,
                    activeTab: 'pay',
                  })
                }
              >
                Make Payment
              </Button>
              <Button
                color="secondary"
                variant="ghost"
                onClick={() =>
                  setModalState({
                    ...modalState,
                    activeTab: 'edit',
                  })
                }
              >
                Add Payable
              </Button>
            </div>

            {modalState.activeTab === 'pay' && (
              <PayablePayForm
                payable={modalState.payable}
                onSuccess={handleSuccess}
              />
            )}

            {modalState.activeTab === 'edit' && (
             <PayableAddForm
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </div>
      )}
    </div>
    </>

  );
}
