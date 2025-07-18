'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@heroui/card';

export function TotalReceivablesCard() {
  const { user } = useAuth();
  const [totalReceivables, setTotalReceivables] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalReceivables = async () => {
      if (!user) return;

      try {
        const snap = await getDocs(collection(db, `users/${user.uid}/receivables`));
        const total = snap.docs.reduce((sum, doc) => {
          const data = doc.data();
          const amount = typeof data.amount === 'number' ? data.amount : 0;
          return sum + amount;
        }, 0);
        setTotalReceivables(total);
      } catch (err) {
        console.error('Error fetching total receivables:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalReceivables();
  }, [user]);

  return (
    <Card className="p-6 shadow-md">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-default-800">Total Receivables</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <p className="text-2xl font-bold text-green-600">
            ₱{totalReceivables.toFixed(2)}
          </p>
        )}
      </div>
    </Card>
  );
}
