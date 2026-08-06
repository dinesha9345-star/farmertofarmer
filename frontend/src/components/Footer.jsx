import React from 'react';
import { Leaf, ShieldCheck, HeartHandshake, Award, PhoneCall, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { t } = useApp();
  return (
    <footer className="bg-zinc-900 text-zinc-300 pt-16 pb-12 border-t border-emerald-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-900/50 flex items-center justify-center text-emerald-400">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{t('100% Farm Fresh')}</h4>
              <p className="text-xs text-zinc-400">{t('Harvested within 24 hours of dispatch')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-900/50 flex items-center justify-center text-emerald-400">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{t('Zero Middlemen')}</h4>
              <p className="text-xs text-zinc-400">{t('Fair pricing empowering direct farmers')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-900/50 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{t('Secure & Certified')}</h4>
              <p className="text-xs text-zinc-400">{t('Lab tested organic & pesticide-free')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-900/50 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{t('Live GPS Tracking')}</h4>
              <p className="text-xs text-zinc-400">{t('Real-time transit from village to doorstep')}</p>
            </div>
          </div>
        </div>

        {/* Main Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12 border-b border-zinc-800 text-sm">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Leaf className="w-5 h-5 text-emerald-100" />
              </div>
              <span className="text-xl font-bold font-serif text-white">
                Farm<span className="text-amber-500">2</span>Home
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed pr-6">
              Farm2Home bridges the gap between hardworking farmers and conscious consumers. Experience pure, organically grown produce delivered fresh from the soil with absolute transparency and fair trade economics.
            </p>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Agri-Tech Innovation Hub, Pune, Maharashtra 411045</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <PhoneCall className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>+91 93454 67520 • dinesha9345@gmail.com</span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">{t('Marketplace')}</h5>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li><Link to="/products" className="hover:text-emerald-400 transition">Organic Fruits</Link></li>
              <li><Link to="/products" className="hover:text-emerald-400 transition">Fresh Vegetables</Link></li>
              <li><Link to="/products" className="hover:text-emerald-400 transition">Aged Grains & Rice</Link></li>
              <li><Link to="/products" className="hover:text-emerald-400 transition">Wild Honey & Dairy</Link></li>
              <li><Link to="/ai-hub" className="hover:text-emerald-400 transition">AI Price Predictor</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">{t('Farmer Portal')}</h5>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li><Link to="/farmer-dashboard" className="hover:text-emerald-400 transition">Farmer Registration</Link></li>
              <li><Link to="/farmer-dashboard" className="hover:text-emerald-400 transition">Upload Harvest</Link></li>
              <li><Link to="/farmer-dashboard" className="hover:text-emerald-400 transition">Market Price Updates</Link></li>
              <li><Link to="/farmer-dashboard" className="hover:text-emerald-400 transition">Sales Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">{t('Company & Legal')}</h5>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li><Link to="/about" className="hover:text-emerald-400 transition">About Our Mission</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-400 transition">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-400 transition">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition">Farmer Support Desk</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© 2026 Farm2Home Technologies Pvt. Ltd. Empowering Farmers with Direct-to-Consumer Commerce.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-zinc-300 cursor-pointer">Privacy</span>
            <span className="hover:text-zinc-300 cursor-pointer">Terms</span>
            <span className="hover:text-zinc-300 cursor-pointer">Security</span>
            <span className="hover:text-zinc-300 cursor-pointer">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
