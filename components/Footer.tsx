"use client";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLang } from "@/lib/language";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-surface-border py-8 px-5 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Left: Company Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-100">Engage Ad</h3>
            
            <div className="space-y-3 text-xs text-slate-400">
              {/* Location */}
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-slate-500" />
                <span>Lucknow, Uttar Pradesh, India</span>
              </div>
              
              {/* Phone */}
              <div className="flex items-center gap-2">
                <Phone size={14} className="flex-shrink-0 text-slate-500" />
                <a href="tel:+919369524385" className="hover:text-slate-200 transition-colors">
                  +91 9369524385
                </a>
              </div>
              
              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail size={14} className="flex-shrink-0 text-slate-500" />
                <a href="mailto:mouhitkanaujia@gmail.com" className="hover:text-slate-200 transition-colors">
                  mouhitkanaujia@gmail.com
                </a>
              </div>
              
              {/* GST */}
              <div className="text-xs text-slate-500 pt-2">
                GST: 09GVRPK4451F2Z3
              </div>
            </div>
          </div>

          {/* Right: Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-100">Quick Links</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <Link href="/admin" className="text-slate-400 hover:text-slate-200 transition-colors">
                  Admin Dashboard
                </Link>
              </div>
              
              <div>
                <Link href="/privacy-policy" className="text-slate-400 hover:text-slate-200 transition-colors">
                  Privacy Policy
                </Link>
              </div>
              
              <div>
                <Link href="/refund-policy" className="text-slate-400 hover:text-slate-200 transition-colors">
                  Refund Policy
                </Link>
              </div>

              <div>
                <Link href="/chat" className="text-slate-400 hover:text-slate-200 transition-colors">
                  P2P Chat
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="border-t border-slate-800 pt-6 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} NoTrace by Engage Ad · {t("footer", "copy")}
          </p>
        </div>
      </div>
    </footer>
  );
}
