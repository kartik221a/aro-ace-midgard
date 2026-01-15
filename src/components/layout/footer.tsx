import { Instagram, Linkedin, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black/50 py-10 md:py-16 backdrop-blur-xl relative z-20">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="space-y-2">
                        <p className="text-slate-200 font-bold tracking-tight text-lg">
                            © 2026 AroAce Midgard. <span className="text-purple-400">A safe space for everyone.</span>
                        </p>
                        <p className="text-slate-400 text-sm font-medium">
                            Created by <span className="text-slate-200">Kartik Kumar</span>.
                            <a href="mailto:kartikkumar221a@gmail.com" className="ml-1 text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-4 decoration-purple-500/30">Contact Admin</a>
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <SocialLink
                            href="https://www.instagram.com/weeb.otaku_kartik"
                            icon={<Instagram className="w-5 h-5" />}
                            label="Instagram"
                            color="hover:text-pink-500"
                        />
                        <SocialLink
                            href="https://www.linkedin.com/in/contact-kartik-kumar/"
                            icon={<Linkedin className="w-5 h-5" />}
                            label="LinkedIn"
                            color="hover:text-blue-500"
                        />
                        <SocialLink
                            href="mailto:kartikkumar221a@gmail.com"
                            icon={<Mail className="w-5 h-5" />}
                            label="Email"
                            color="hover:text-purple-500"
                        />
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 transition-all duration-300 hover:bg-white/10 ${color} hover:scale-110 active:scale-95 shadow-lg`}
        >
            {icon}
        </a>
    );
}
