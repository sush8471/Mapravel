'use client';

import { Settings as SettingsIcon, Construction } from 'lucide-react';

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
        <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 bg-[#f5c542]/10 rounded-2xl flex items-center justify-center border border-[#f5c542]/20">
            <Construction className="w-10 h-10 text-[#f5c542]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Coming Soon</h2>
            <p className="text-white/40 max-w-sm leading-relaxed text-sm">
              Settings for global configuration, default map coordinates, and more themes will be available here in a future update.
            </p>
          </div>

          <div className="w-full max-w-md space-y-4 pt-4">
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-5 h-5 text-[#f5c542]" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Admin Password</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Update the <code className="bg-white/5 px-1 rounded text-[#f5c542]">ADMIN_PASSWORD</code> environment variable in your <code className="bg-white/5 px-1 rounded text-[#f5c542]">.env</code> file.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
