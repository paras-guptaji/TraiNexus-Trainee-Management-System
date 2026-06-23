import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building,
  Calendar,
  Sparkles
} from 'lucide-react';
import { SystemStats, AuditLog, ScheduleEvent } from '../types';

interface AdminDashboardProps {
  stats: SystemStats;
  recentLogs: AuditLog[];
  upcomingEvents: ScheduleEvent[];
  departmentsData: any[];
  setCurrentTab: (tab: string) => void;
  onApproveTrainee: (id: string) => void;
  pendingTrainees: any[];
}

export default function AdminDashboard({
  stats,
  recentLogs,
  upcomingEvents,
  departmentsData,
  setCurrentTab,
  onApproveTrainee,
  pendingTrainees
}: AdminDashboardProps) {

  // Generate department chart metrics
  const maxCapacityLimit = Math.max(...departmentsData.map(d => d.allocatedCount || 1));

  return (
    <div className="space-y-6">
      {/* Upper Welcome Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-md border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-10">
          <Building className="w-64 h-64 text-yellow-300 shrink-0" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-blue-600/30 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/20 font-mono font-medium tracking-wide">
              GAIL Corporate Intranet
            </span>
            <h2 className="text-2xl font-display font-semibold mt-2 text-white">Vijaypur Training Control Desk</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Monitor, schedule, and verify trainees across all PSU sectors. View real-time attendance compliance and safety guidelines certificates.
            </p>
          </div>
          <button 
            onClick={() => setCurrentTab('trainees')}
            className="self-start md:self-center bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-yellow-500/20 flex items-center gap-2 text-sm transition-all cursor-pointer"
          >
            Manage Trainees <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Trainees */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-slate-350 transition-all duration-150">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">Total Interns</p>
            <h3 className="text-2xl font-display font-bold text-slate-900 mt-0.5">{stats.totalTrainees}</h3>
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
              Across all 8 plants
            </span>
          </div>
        </div>

        {/* Active Trainees */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">Active Inside Plant</p>
            <h3 className="text-2xl font-display font-bold text-slate-900 mt-0.5">{stats.activeTrainees}</h3>
            <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-0.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Currently Present
            </span>
          </div>
        </div>

        {/* Completed Trainees */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">Completed Alumni</p>
            <h3 className="text-2xl font-display font-bold text-slate-900 mt-0.5">{stats.completedTrainees}</h3>
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
              Certificates Distributed
            </span>
          </div>
        </div>

        {/* Attendance Score Rate */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">Compliance Index</p>
            <h3 className="text-2xl font-display font-bold text-slate-900 mt-0.5">{stats.avgAttendanceRate}%</h3>
            <span className="text-[10px] text-indigo-600 flex items-center gap-0.5 mt-0.5 font-medium">
              Daily Target met
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Trainee Approvals & Department Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Side: Pending verification alert drawer */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-slate-950 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Pending HR Approvals
                </h3>
                <p className="text-slate-500 text-xs">Candidates registered online waiting for clearance certificates.</p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono">
                {pendingTrainees.length} Awaiting
              </span>
            </div>

            {pendingTrainees.length === 0 ? (
              <div className="border border-dashed border-slate-200 p-8 rounded-xl text-center text-slate-400 text-xs">
                Perfect! No registrations are currently pending audit approval.
              </div>
            ) : (
              <div className="space-y-3 max-h-68 overflow-y-auto pr-1">
                {pendingTrainees.map((trainee) => (
                  <div key={trainee.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{trainee.fullName}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {trainee.collegeName} • {trainee.department}
                      </p>
                    </div>
                    <button 
                      onClick={() => onApproveTrainee(trainee.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm cursor-pointer active:scale-95 transition-all"
                    >
                      Verify and Activate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">All coordinates match security database.</span>
            <button 
              onClick={() => setCurrentTab('trainees')}
              className="text-blue-600 text-[11px] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Master Directory <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Side: Department Distribution (Visual SVG Chart) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-slate-950 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" /> Sector Allocations
              </h3>
              <p className="text-slate-500 text-xs">Trainee strength distributed across technical departments.</p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Dynamic headcount</span>
          </div>

          <div className="space-y-3">
            {departmentsData.map((dept) => {
              const currentAllocated = dept.allocatedCount || 0;
              const ratio = Math.min(100, Math.round((currentAllocated / maxCapacityLimit) * 100)) || 2;
              return (
                <div key={dept.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{dept.id}</span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      {currentAllocated} Interns / Max {dept.maxCapacity}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${ratio}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        dept.id === 'Safety' ? 'bg-rose-500' :
                        dept.id === 'Mechanical' ? 'bg-amber-500' :
                        dept.id === 'Operations' ? 'bg-blue-600' :
                        'bg-slate-700'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Grid: Upcoming Training & Real-time audit trails */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Upcoming events timeline (Col span 1) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-950 flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-600" /> Plant Visit Calendar
            </h3>
            
            <div className="space-y-3">
              {upcomingEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="p-3 bg-blue-50/50 border-l-4 border-blue-600 rounded-r-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono tracking-widest text-blue-800 font-bold uppercase">{event.time}</span>
                    <span className="text-[10px] font-mono text-slate-500">{event.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{event.title}</h4>
                  <p className="text-[10px] text-slate-600 truncate">{event.venue}</p>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setCurrentTab('schedules')}
            className="w-full text-center py-2 border border-slate-200 rounded-lg text-xs font-semibold text-blue-600 hover:bg-slate-50 transition-colors mt-4 cursor-pointer"
          >
            Go to Full Calendar
          </button>
        </div>

        {/* Audit Log (Col span 2) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-slate-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" /> Action Logs & Security Audit
              </h3>
              <p className="text-slate-500 text-xs">Real-time HR registry changes, certificates, and safety approvals.</p>
            </div>
            <span className="text-[10px] bg-indigo-50 border border-indigo-200 font-mono text-indigo-700 px-2 py-0.5 rounded">
              Secure Ledger
            </span>
          </div>

          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
            {recentLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="text-xs flex gap-3 p-2.5 hover:bg-slate-50 rounded-lg transition-colors items-start">
                <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase mt-0.5 select-none shrink-0 border border-slate-200/50">
                  {log.timestamp.split(' ').pop() || 'LOG'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 leading-snug">
                    <span className="font-bold text-slate-900">{log.userName}</span> {log.action}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-mono">
                    {log.timestamp.split(' ')[0]} • Operator ID: {log.userEmail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
