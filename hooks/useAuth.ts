// hooks/useAuth.ts

"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // `db` is your Firestore instance
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Prepare Firestore reference
        const userRef = doc(db, "users", firebaseUser.uid);

        // Check if user document exists
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          // Create user document in Firestore
          await setDoc(userRef, {
            user_id: firebaseUser.uid,
            name: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            photo_url: firebaseUser.photoURL || "",
            created_at: serverTimestamp(),
          });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
