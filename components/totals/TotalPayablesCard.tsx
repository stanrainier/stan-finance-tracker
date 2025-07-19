'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardBody } from '@heroui/card';
import { FiArrowDownLeft } from 'react-icons/fi';
import { HiOutlineCash } from 'react-icons/hi';

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
<Card className="shadow-md shadow-xl/30 hover:shadow-xl/80 hover:scale-[1.03] transition-all duration-1000 cursor-pointer transform">
  <CardBody className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="bg-red-100 rounded-full p-3">
        <HiOutlineCash className="text-red-600" size={20} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Total Payables</p>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <p className="text-red-600 font-bold text-lg">
            ₱{totalPayables.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        )}
      </div>
    </div>
  </CardBody>
</Card>

  );
}
