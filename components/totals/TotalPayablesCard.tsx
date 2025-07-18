'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@heroui/card';

export function TotalPayablesCard() {
  const { user } = useAuth();
  const [totalPayables, setTotalPayables] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalPayables = async () => {
      if (!user) return;

      try {
        const snap = await getDocs(collection(db, `users/${user.uid}/payables`));
        const total = snap.docs.reduce((sum, doc) => {
          const data = doc.data();
          const balance = typeof data.balance === 'number' ? data.balance : 0;
          return sum + balance;
        }, 0);
        setTotalPayables(total);
      } catch (err) {
        console.error('Error fetching total payables:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalPayables();
  }, [user]);

  return (
    <Card className="p-6 shadow-xl/30 hover:shadow-xl/80 hover:scale-[1.03] transition-all duration-1000 cursor-pointer transform  ">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-default-800">Total Payables</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <p className="text-2xl font-bold text-red-600">
            ₱{totalPayables.toFixed(2)}
          </p>
        )}
      </div>
    </Card>
  );
}
