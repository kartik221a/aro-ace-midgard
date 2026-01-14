
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut, Auth } from "firebase/auth";
import { doc, onSnapshot, Firestore } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { UserData } from "@/types";

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!auth) {
            console.error("Firebase Auth not initialized");
            setLoading(false);
            return;
        }

        const unsubscribeAuth = onAuthStateChanged(auth as Auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Set a simple session cookie for middleware to check
                document.cookie = "session=true; path=/";
            } else {
                setUserData(null);
                setLoading(false);
                // Remove cookie
                document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // Separated effect for Firestore listener to depend on 'user'
    useEffect(() => {
        if (!user) return;
        if (!db) {
            console.error("Firebase Firestore not initialized");
            return;
        }

        setLoading(true);
        const unsubscribeFirestore = onSnapshot(doc(db as Firestore, "users", user.uid), (docCookie) => {
            if (docCookie.exists()) {
                setUserData(docCookie.data() as UserData);
            } else {
                setUserData(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user data:", error);
            setLoading(false);
        });

        return () => unsubscribeFirestore();
    }, [user]);

    const logout = async () => {
        if (auth) {
            await firebaseSignOut(auth);
        }
        document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
