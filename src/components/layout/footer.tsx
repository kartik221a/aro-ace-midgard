
export function Footer() {
    return (
        <footer className="border-t border-slate-100 bg-slate-50 py-8 dark:border-slate-800 dark:bg-slate-950">
            <div className="container mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                <p>© {new Date().getFullYear()} AroAce Midgard. A safe space for everyone.</p>
                <div className="mt-2 flex justify-center gap-4">
                    <a href="#" className="hover:text-slate-900 dark:hover:text-slate-50">Community Guidelines</a>
                    <a href="#" className="hover:text-slate-900 dark:hover:text-slate-50">Privacy Policy</a>
                    <a href="#" className="hover:text-slate-900 dark:hover:text-slate-50">Contact</a>
                </div>
            </div>
        </footer>
    );
}
