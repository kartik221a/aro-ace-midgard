
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Keep shadcn button for inputs styling if needed, or replace
import { auth, db } from "@/lib/firebase/client";
import {
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { GradientText } from "@/components/ui/gradient-text";
import Aurora from "@/components/ui/reactbits/aurora";
import SpotlightCard from "@/components/ui/reactbits/spotlight-card";
import { SplitText } from "@/components/ui/reactbits/split-text";
import MagnetButton from "@/components/ui/reactbits/magnet-button";
import { motion } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            router.push("/dashboard");
        }
    }, [user, router]);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            if (!auth) {
                setError("Authentication service not available.");
                return;
            }
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            await checkAndCreateUser(result.user);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!auth) {
                setError("Authentication service not available.");
                return;
            }

            if (isSignUp) {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await checkAndCreateUser(result.user);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkAndCreateUser = async (user: any) => {
        if (!db) return;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || email.split("@")[0],
                role: "user",
                createdAt: serverTimestamp(),
            });
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[#0f111a] text-white">
            {/* ReactBits component: Aurora */}
            <div className="absolute inset-0 opacity-60">
                <Aurora
                    colorStops={['#6fcf97', '#a0c4ff', '#bbbdf6']} // AroAce Green, Blue, Purple
                    speed={0.5}
                    amplitude={1.0}
                />
            </div>

            {/* ReactBits component: SpotlightCard */}
            <SpotlightCard className="w-full max-w-md z-10 backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl p-8 shadow-2xl" spotlightColor="rgba(111, 207, 151, 0.2)">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-3 tracking-tighter">
                        {/* ReactBits component: SplitText */}
                        <SplitText
                            text={isSignUp ? "Join AroAce Midgard" : "Welcome Back"}
                            className="inline-block text-white"
                            delay={40}
                            animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                            animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                            threshold={0.2}
                            rootMargin="-50px"
                        />
                    </h1>
                    <p className="text-slate-300">
                        {isSignUp ? "Create your space in the community" : "Sign in to continue your journey"}
                    </p>
                </div>

                <div className="flex flex-col gap-6">
                    {/* ReactBits component: MagnetButton */}
                    <MagnetButton
                        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-3 rounded-xl h-14"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        strength={30}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {loading ? "Connecting..." : "Continue with Google"}
                    </MagnetButton>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-wider">
                            <span className="bg-[#0f111a]/80 px-3 text-slate-400 rounded-full border border-white/5 backdrop-blur-md">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailAuth} className="flex flex-col gap-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-sm text-red-200 bg-red-500/20 border border-red-500/30 p-3 rounded-lg text-center backdrop-blur-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <input
                                    className="flex h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#6fcf97] focus:border-[#6fcf97]/50 transition-all duration-300 font-medium group-hover:bg-white/10"
                                    placeholder="Email address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <input
                                    className="flex h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#6fcf97] focus:border-[#6fcf97]/50 transition-all duration-300 font-medium group-hover:bg-white/10"
                                    placeholder="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* ReactBits component: MagnetButton */}
                        <MagnetButton
                            type="submit"
                            className="w-full h-14 bg-gradient-to-r from-[#6fcf97] to-[#38965f] text-black font-bold shadow-lg shadow-[#6fcf97]/20 border-none hover:shadow-[#6fcf97]/40 rounded-xl"
                            disabled={loading}
                            strength={50}
                        >
                            {isSignUp ? "Create Account" : "Sign In"}
                        </MagnetButton>
                    </form>

                    <p className="text-center text-sm text-slate-400 mt-2">
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        <button
                            className="text-[#a0c4ff] hover:text-[#7ea8ff] transition-colors font-medium hover:underline"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? "Sign In" : "Sign Up"}
                        </button>
                    </p>

                </div>
            </SpotlightCard>
        </div>
    );
}
