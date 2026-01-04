import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'

export async function fetchTransactionsByDate(
  user_id: string,
  start: Date,
  end: Date
) {
  const ref = collection(db, `users/${user_id}/transactions`)

  const startOfDay = new Date(start)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(end)
  endOfDay.setHours(23, 59, 59, 999)

  const q = query(
    ref,
    where('date_incurred', '>=', Timestamp.fromDate(startOfDay)),
    where('date_incurred', '<=', Timestamp.fromDate(endOfDay))
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}
