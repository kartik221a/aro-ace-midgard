
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { ModeToggle } from "@/components/mode-toggle";

export function Navbar() {
    const { user, userData, logout } = useAuth();

    return (
        <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-indigo-400">
                    AroAce Midgard
                </Link>

                <div className="flex items-center gap-4">
                    {user && (
                        <Link href="/browse">
                            <Button variant="ghost">Browse</Button>
                        </Link>
                    )}

                    <ModeToggle />

                    {user ? (
                        <>
                            {/* Admin Link */}
                            {userData?.role === "admin" && (
                                <Link href="/admin">
                                    <Button variant="ghost" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">Admin</Button>
                                </Link>
                            )}

                            <Link href="/dashboard">
                                <Button variant="ghost">Dashboard</Button>
                            </Link>
                            {/* Optional: Show avatar or name */}
                            <span className="text-sm text-slate-500 hidden md:inline-block">Hi, {user.displayName || 'Friend'}</span>
                            <Button variant="outline" onClick={logout}>Logout</Button>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button variant="pastel">Sign In</Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
