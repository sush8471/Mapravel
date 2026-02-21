'use client';

import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-white/50 mt-1">Configure your admin dashboard and global preferences.</p>
        </div>
      </div>

      <div className="max-w-2xl bg-[#111116] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-8 space-y-8">
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-[#f5c542]" />
              General Configuration
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 block">
                  Admin Display Name
                </label>
                <input 
                  type="text" 
                  defaultValue="Da Characterz Admin"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#f5c542]/50 transition-all"
                />
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-sm font-medium text-white/70 block">
                  Default Map Initial Coordinates
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-xs text-white/30 uppercase tracking-widest">Latitude</span>
                    <input 
                      type="number" 
                      defaultValue="20"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#f5c542]/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-white/30 uppercase tracking-widest">Longitude</span>
                    <input 
                      type="number" 
                      defaultValue="0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#f5c542]/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pt-8 border-t border-white/5 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 text-red-400">
              Security
            </h2>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-500 text-sm">
                To change your password, update the <code className="bg-red-500/10 px-1 rounded">ADMIN_PASSWORD</code> environment variable in your <code className="bg-red-500/10 px-1 rounded">.env.local</code> file.
              </p>
            </div>
          </section>
        </div>

        <div className="p-6 bg-white/5 flex justify-end">
          <button className="flex items-center gap-2 bg-[#f5c542] hover:bg-[#e5b532] text-black font-bold px-8 py-3 rounded-xl transition-all shadow-lg active:scale-[0.98]">
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
