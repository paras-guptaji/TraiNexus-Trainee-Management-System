import React from 'react';
import { 
  Building2, 
  Users, 
  CheckSquare, 
  Calendar, 
  FileText, 
  FolderLock, 
  Megaphone, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard,
  Award,
  ShieldCheck,
  Building
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  role: UserRole;
  userName: string;
  onLogout: () => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  role, 
  userName, 
  onLogout 
}: SidebarProps) {
  
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trainees', label: 'Trainees', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'attendance', label: 'Attendance Reg.', icon: CheckSquare },
    { id: 'schedules', label: 'Training Schedule', icon: Calendar },
    { id: 'reports', label: 'Weekly Reports', icon: FileText },
    { id: 'documents', label: 'Document Safe', icon: FolderLock },
    { id: 'notices', label: 'Notice Board', icon: Megaphone },
    { id: 'audit', label: 'System Audit Logs', icon: ShieldCheck },
  ];

  const traineeMenuItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Weekly Summary', icon: FileText },
    { id: 'documents', label: 'My Documents', icon: FolderLock },
    { id: 'schedules', label: 'Training Calendar', icon: Calendar },
    { id: 'certificate', label: 'My Certificate', icon: Award },
  ];

  const menuItems = role === 'admin' ? adminMenuItems : traineeMenuItems;

  return (
    <aside className="w-68 bg-slate-900 text-white flex flex-col h-screen sticky top-0 border-r border-slate-800 z-10 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Building2 className="w-6 h-6 text-yellow-300" />
        </div>
        <div>
          <h1 className="font-display font-bold tracking-tight text-lg text-white">TraiNexus</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">GAIL Vijaypur</p>
        </div>
      </div>

      {/* User Session card */}
      <div className="p-4 mx-3 my-4 bg-slate-800/40 rounded-xl border border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-700/60 border border-slate-600 flex items-center justify-center text-yellow-300 font-bold uppercase ring-2 ring-blue-500/20">
          {userName ? userName.charAt(0) : 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate text-slate-200">{userName}</p>
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${role === 'admin' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <p className="text-[11px] font-mono capitalize tracking-wider text-slate-400">{role} Personnel</p>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                isActive ? 'text-yellow-300' : 'text-slate-400 group-hover:text-slate-200'
              }`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-rose-900/20 hover:text-rose-200 transition-colors duration-150 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Sign Out</span>
          </div>
        </button>
        <p className="text-[9px] text-center text-slate-600 mt-3 font-mono">
          GAIL Vijaypur • TraiNexus v1.0.0
        </p>
      </div>
    </aside>
  );
}
