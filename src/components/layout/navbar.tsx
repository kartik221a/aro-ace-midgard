"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { GradientText } from "@/components/ui/gradient-text";
import MagnetButton from "@/components/ui/reactbits/magnet-button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const { user, userData, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="fixed top-6 inset-x-0 mx-auto max-w-fit z-50"
            >
                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-full pl-6 pr-2 py-2 flex items-center shadow-lg shadow-black/20">
                    {/* Logo - kept simple inside pill */}
                    <Link href="/" className="mr-8 hover:opacity-80 transition-opacity">
                        <span className="font-bold text-lg tracking-tight text-white">
                            AroAce <span className="text-[#a855f7]">Midgard</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        {user && (
                            <Link href="/browse">
                                <MagnetButton className="text-slate-300 hover:text-white px-4 py-2 bg-transparent border-none shadow-none text-sm font-medium" strength={10}>Browse</MagnetButton>
                            </Link>
                        )}

                        {user ? (
                            <>
                                {userData?.role === "admin" && (
                                    <Link href="/admin">
                                        <MagnetButton className="text-rose-400 hover:text-rose-300 px-4 py-2 bg-transparent border-none shadow-none text-sm font-medium" strength={10}>Admin</MagnetButton>
                                    </Link>
                                )}

                                <Link href="/dashboard">
                                    <MagnetButton className="text-slate-300 hover:text-white px-4 py-2 bg-transparent border-none shadow-none text-sm font-medium" strength={10}>Dashboard</MagnetButton>
                                </Link>

                                <div className="h-4 w-px bg-white/10 mx-2" />

                                <MagnetButton onClick={logout} className="border border-white/10 hover:bg-white/5 text-slate-300 px-4 py-2 rounded-full bg-transparent text-sm h-9" strength={15}>
                                    Logout
                                </MagnetButton>
                            </>
                        ) : (
                            <Link href="/login">
                                <MagnetButton className="bg-[#a855f7] text-white font-bold hover:bg-[#9333ea] px-5 py-2 rounded-full shadow-lg shadow-[#a855f7]/20 border-none text-sm h-9" strength={20}>Sign In</MagnetButton>
                            </Link>
                        )}

                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center ml-auto gap-4 pr-2">
                        <button onClick={toggleMenu} className="text-white p-2">
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Dropdown - Full screen overlay for mobile pulse */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/90 backdrop-blur-xl md:hidden flex flex-col items-center justify-center space-y-8"
                    >
                        <button onClick={toggleMenu} className="absolute top-8 right-8 text-white p-2">
                            <X className="w-8 h-8" />
                        </button>

                        <div className="flex flex-col items-center gap-6">
                            {user ? (
                                <>
                                    <Link href="/browse" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-white">Browse</Link>
                                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-white">Dashboard</Link>
                                    {userData?.role === "admin" && (
                                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-rose-400">Admin</Link>
                                    )}
                                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-xl text-slate-400 mt-8">Logout</button>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                    <span className="text-3xl font-bold text-[#a855f7]">Sign In</span>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
