"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionDivider } from "@/components/ui/section-divider";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-b from-rose-50 to-white dark:from-slate-950 dark:to-slate-950 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-indigo-400 drop-shadow-sm">
          Welcome to AroAce Midgard
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          A safe, aesthetic, and moderated space to introduce yourself and find others.
          Connect with friends or partners in a pressure-free environment.
        </p>
        <div className="flex gap-4 justify-center">
          {user ? (
            <Link href="/browse">
              <Button size="lg" className="rounded-full px-8">Browse Introductions</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="lg" className="rounded-full px-8">Sign In to Browse</Button>
            </Link>
          )}
          <Link href={user ? "/dashboard" : "/login"}>
            <Button size="lg" variant="pastel" className="rounded-full px-8">Create Yours</Button>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <SectionDivider title="About Our Space" />
        <div className="grid md:grid-cols-3 gap-8 text-center mt-8">
          <div className="p-4">
            <div className="bg-rose-100 dark:bg-rose-900/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🛡️</div>
            <h3 className="font-semibold text-lg mb-2">Safe & Moderated</h3>
            <p className="text-slate-500 text-sm">Every introduction is reviewed by humans to ensure a safe environment for everyone.</p>
          </div>
          <div className="p-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✨</div>
            <h3 className="font-semibold text-lg mb-2">Aesthetic Profiles</h3>
            <p className="text-slate-500 text-sm">Express yourself with our custom profile cards designed to be beautiful and easy to read.</p>
          </div>
          <div className="p-4">
            <div className="bg-emerald-100 dark:bg-emerald-900/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🌱</div>
            <h3 className="font-semibold text-lg mb-2">Gentle Connections</h3>
            <p className="text-slate-500 text-sm">Whether looking for friends or a partner, state your intent clearly and comfortably.</p>
          </div>
        </div>
      </section>

      {/* Featured Section (Placeholder) - Only for logged in users */}
      {user && (
        <section className="container mx-auto px-4 py-12 mb-20">
          <SectionDivider title="Recently Added" />
          <div className="flex justify-center text-slate-400 italic mt-8">
            <p>Introductions will appear here soon...</p>
          </div>
        </section>
      )}
    </div>
  );
}
