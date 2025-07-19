'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardBody } from '@heroui/card';
import { FiArrowUpRight } from 'react-icons/fi';
import { PiHandCoinsFill } from 'react-icons/pi';

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
<Card className="shadow-md shadow-xl/30 hover:shadow-xl/80 hover:scale-[1.03] transition-all duration-1000 cursor-pointer transform">
  <CardBody className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="bg-green-100 rounded-full p-3">
        <PiHandCoinsFill className="text-green-600" size={20} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Total Receivables</p>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <p className="text-green-600 font-bold text-lg">
            ₱{totalReceivables.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        )}
      </div>
    </div>
  </CardBody>
</Card>

  );
}
