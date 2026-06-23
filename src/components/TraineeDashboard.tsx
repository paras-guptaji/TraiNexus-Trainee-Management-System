import React from 'react';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ThumbsUp, 
  Calendar,
  Bell,
  Fingerprint,
  ChevronRight
} from 'lucide-react';
import { Trainee, AttendanceRecord, Notice, ScheduleEvent, WeeklyReport } from '../types';

interface TraineeDashboardProps {
  trainee: Trainee;
  attendanceHistory: AttendanceRecord[];
  notices: Notice[];
  scheduleEvents: ScheduleEvent[];
  weeklyReports: WeeklyReport[];
  onCheckIn: (status: 'Present') => void;
  isCheckedInToday: boolean;
  setCurrentTab: (tab: string) => void;
}

export default function TraineeDashboard({
  trainee,
  attendanceHistory,
  notices,
  scheduleEvents,
  weeklyReports,
  onCheckIn,
  isCheckedInToday,
  setCurrentTab
}: TraineeDashboardProps) {

  // Calculate metrics
  const totalDays = 30; // standard 30 day PSU intern
  
  // Calculate attendance rate
  const personalRecords = attendanceHistory.filter(h => h.traineeId === trainee.id);
  const totalRecordsCount = personalRecords.length;
  const presentRecordsCount = personalRecords.filter(p => p.status === 'Present').length;
  const attendanceRate = totalRecordsCount > 0 
    ? Math.round((presentRecordsCount / totalRecordsCount) * 100) 
    : 85;

  // Calculate remaining days
  const start = new Date(trainee.startDate);
  const end = new Date(trainee.endDate);
  const today = new Date();
  
  const totalDurationMs = end.getTime() - start.getTime();
  const elapsedMs = today.getTime() - start.getTime();
  
  const elapsedDays = Math.max(0, Math.round(elapsedMs / (1000 * 60 * 60 * 24)));
  const totalDaysDuration = Math.max(1, Math.round(totalDurationMs / (1000 * 60 * 60 * 24)));
  
  const progressRatio = Math.min(100, Math.round((elapsedDays / totalDaysDuration) * 100));

  // Count reports status
  const approvedReports = weeklyReports.filter(r => r.status === 'Approved').length;
  const pendingReports = weeklyReports.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-6">
      
      {/* Upper Student Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-6 text-white border border-blue-800/80 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Fingerprint className="w-64 h-64 text-yellow-300 transform rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 text-blue-950 flex items-center justify-center font-display font-black text-2xl uppercase text-indigo-900 select-none ring-4 ring-blue-500/30 shadow-md">
              {trainee.fullName.charAt(0)}
            </div>
            <div>
              <span className="bg-amber-500 text-slate-950 font-mono text-[9px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                GAIL Vijaypur Intern
              </span>
              <h2 className="text-xl font-display font-semibold mt-1">{trainee.fullName}</h2>
              <p className="text-xs text-blue-200/80 font-mono mt-0.5">
                ID: {trainee.id} • Dept: {trainee.department}
              </p>
            </div>
          </div>

          {/* Quick Check-In Module */}
          <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-xs flex items-center gap-4">
            <div>
              <p className="text-[10px] text-blue-200 font-mono uppercase tracking-wide">Daily Presence Portal</p>
              <p className="text-xs font-semibold mt-0.5 text-white">
                {isCheckedInToday ? "Checked in for today" : "Awaiting Daily Check-In"}
              </p>
            </div>
            {isCheckedInToday ? (
              <div className="bg-emerald-500 text-white p-2 rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm select-none">
                <CheckCircle2 className="w-4 h-4" /> Marked
              </div>
            ) : (
              <button
                onClick={() => onCheckIn('Present')}
                className="bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-yellow-500/20 cursor-pointer transition-transform"
              >
                <Fingerprint className="w-4 h-4 animate-pulse" /> Daily Check-In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Attendance Percentage Circle */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-mono uppercase">My Attendance Compliance</p>
            <h3 className="text-3xl font-display font-bold text-slate-900 mt-2">{attendanceRate}%</h3>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Standard requirement is 80%
            </p>
          </div>
          <div className="relative w-16 h-16 shrink-0 select-none">
            {/* SVG Progress Circle */}
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                fill="transparent" 
                stroke="#2563eb" 
                strokeWidth="6" 
                strokeDasharray={175} 
                strokeDashoffset={175 - (175 * attendanceRate) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-blue-700">
              {presentRecordsCount}d
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-mono uppercase">Internship Program Progress</p>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-3xl font-display font-bold text-slate-900">{progressRatio}%</h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {elapsedDays} / {totalDaysDuration} Calendar Days
              </p>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full mt-2.5 overflow-hidden">
              <div 
                style={{ width: `${progressRatio}%` }} 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Target End Date: <span className="font-semibold text-slate-800">{trainee.endDate}</span>
          </p>
        </div>

        {/* Weekly Report review indicators */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-slate-500 text-xs font-mono uppercase">Log Submissions</p>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <div className="bg-slate-50 border border-slate-150 p-1.5 rounded-lg text-center">
                <span className="text-xs font-bold text-slate-900 font-mono">{approvedReports}</span>
                <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Approved</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-1.5 rounded-lg text-center">
                <span className="text-xs font-bold text-slate-900 font-mono">{pendingReports}</span>
                <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">Pending</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Events & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Notices Board Panel (Col Span 2) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-slate-950 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" /> Safety & Broad Notice Board
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Published by Administration</span>
          </div>

          <div className="space-y-4 max-h-76 overflow-y-auto pr-1">
            {notices.map((notice) => (
              <div key={notice.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-150 relative overflow-hidden">
                {notice.priority === 'High' && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white font-mono text-[8px] font-extrabold px-2 py-0.5 rounded-bl uppercase">
                    Critical Alert
                  </span>
                )}
                <div className="flex items-baseline justify-between mb-1 pr-14">
                  <h4 className="text-xs font-black text-slate-900 leading-tight">{notice.title}</h4>
                  <span className="text-[9px] font-mono text-slate-400 shrink-0 select-none">{notice.datePublished}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{notice.content}</p>
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/50 text-[10px] text-slate-500 font-mono">
                  <span>From: {notice.publisher}</span>
                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold text-[9px]">
                    Target: {notice.targetDepartment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items Quick Drawer (Col Span 1) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-950 flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-600" /> Planned Activities
            </h3>
            
            <div className="space-y-3">
              {scheduleEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-200/50 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono bg-blue-100 text-blue-800 px-1 py-0.2 rounded uppercase font-semibold">
                      {event.time.split(' ')[0] + ' ' + event.time.split(' ')[1]}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{event.date.substring(5)}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate leading-tight mt-1">{event.title}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">{event.venue}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => setCurrentTab('reports')}
              className="w-full text-left p-2.5 hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <span>Submit Wk Weekly Summaries</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => setCurrentTab('certificate')}
              className="w-full text-left p-2.5 hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <span>My Internship Certificate</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
