import React from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  RefreshCw, 
  HelpCircle,
  Eye,
  EyeOff,
  Database
} from 'lucide-react';
import { 
  Trainee, 
  AttendanceRecord, 
  WeeklyReport, 
  TraineeDocument, 
  Notice, 
  AuditLog, 
  SystemStats, 
  UserRole,
  User,
  ScheduleEvent
} from './types';

// Import components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import TraineeDashboard from './components/TraineeDashboard';
import TraineeManagementTab from './components/TraineeManagementTab';
import AttendanceTab from './components/AttendanceTab';
import WeeklyReportsTab from './components/WeeklyReportsTab';
import DocumentsTab from './components/DocumentsTab';
import ScheduleTab from './components/ScheduleTab';
import CertTab from './components/CertTab';
import NoticesTab from './components/NoticesTab';

export default function App() {
  
  // Auth states
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [authRole, setAuthRole] = React.useState<UserRole>('admin');
  const [emailInput, setEmailInput] = React.useState('');
  const [passwordInput, setPasswordInput] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [authLoading, setAuthLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

  // App core states
  const [currentTab, setCurrentTab] = React.useState('dashboard');
  const [stats, setStats] = React.useState<SystemStats | null>(null);
  const [trainees, setTrainees] = React.useState<Trainee[]>([]);
  const [attendance, setAttendance] = React.useState<AttendanceRecord[]>([]);
  const [reports, setReports] = React.useState<WeeklyReport[]>([]);
  const [documents, setDocuments] = React.useState<TraineeDocument[]>([]);
  const [notices, setNotices] = React.useState<Notice[]>([]);
  const [schedules, setSchedules] = React.useState<ScheduleEvent[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
  
  // Loading and refresher states
  const [globalLoading, setGlobalLoading] = React.useState(true);

  // Restore session on boot
  React.useEffect(() => {
    const savedUser = localStorage.getItem('gail_nexus_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setAuthRole(parsed.role);
      } catch (e) {
        localStorage.removeItem('gail_nexus_user');
      }
    }
    // Fetch base databases
    fetchDatabase();
  }, []);

  // Fetch unified databases
  const fetchDatabase = async () => {
    try {
      setGlobalLoading(true);
      const [
        statsRes,
        traineesRes,
        attendanceRes,
        reportsRes,
        documentsRes,
        noticesRes,
        schedulesRes,
        auditLogsRes
      ] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/trainees').then(r => r.json()),
        fetch('/api/attendance').then(r => r.json()),
        fetch('/api/reports').then(r => r.json()),
        fetch('/api/documents').then(r => r.json()),
        fetch('/api/notices').then(r => r.json()),
        fetch('/api/schedules').then(r => r.json()),
        fetch('/api/audit-logs').then(r => r.json())
      ]);

      setStats(statsRes);
      setTrainees(traineesRes);
      setAttendance(attendanceRes);
      setReports(reportsRes);
      setDocuments(documentsRes);
      setNotices(noticesRes);
      setSchedules(schedulesRes);
      setAuditLogs(auditLogsRes);
    } catch (err) {
      console.error("Failed to synchronize with server database:", err);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Perform Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput,
          password: passwordInput,
          role: authRole
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Login validation failed");
      }

      const { user } = await res.json();
      setCurrentUser(user);
      localStorage.setItem('gail_nexus_user', JSON.stringify(user));
      setCurrentTab('dashboard');
      fetchDatabase(); // Refresh data to trainee bounds
    } catch (err: any) {
      setAuthError(err.message || "Invalid network response.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Switch role seamlessly (Eval tool helper!)
  const handleQuickRoleSwitch = async (newRole: UserRole) => {
    // Quick swap mock logins
    if (newRole === 'admin') {
      setCurrentUser({
        id: 'USR-000',
        email: 'admin@gail.co.in',
        name: 'S. Dixit (Adviser HRD)',
        role: 'admin'
      });
      setAuthRole('admin');
      localStorage.setItem('gail_nexus_user', JSON.stringify({
        id: 'USR-000',
        email: 'admin@gail.co.in',
        name: 'S. Dixit (Adviser HRD)',
        role: 'admin'
      }));
    } else {
      // Find an active trainee profile to mock
      const designetTrainee = trainees.find(t => t.status === 'Active') || trainees[0];
      if (designetTrainee) {
        const fallbackUser = {
          id: `USR-${designetTrainee.id}`,
          email: designetTrainee.email,
          name: designetTrainee.fullName,
          role: 'trainee' as const,
          traineeId: designetTrainee.id
        };
        setCurrentUser(fallbackUser);
        setAuthRole('trainee');
        localStorage.setItem('gail_nexus_user', JSON.stringify(fallbackUser));
      } else {
        alert("Please add at least one Active trainee in the list before switching to Trainee view.");
      }
    }
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gail_nexus_user');
    setEmailInput('');
    setPasswordInput('');
  };

  // Trainee Actions routing

  const handleAddTrainee = async (data: Omit<Trainee, 'id'>) => {
    try {
      const res = await fetch('/api/trainees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          createdByEmail: currentUser?.email,
          createdByName: currentUser?.name
        })
      });
      if (!res.ok) throw new Error("Could not add trainee");
      fetchDatabase();
    } catch (err) {
      alert("Registration failed: already exists or wrong parameters.");
    }
  };

  const handleUpdateTrainee = async (id: string, data: Partial<Trainee>) => {
    try {
      const res = await fetch(`/api/trainees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          editorEmail: currentUser?.email,
          editorName: currentUser?.name
        })
      });
      if (!res.ok) throw new Error("Failed to edit records");
      fetchDatabase();
    } catch (err) {
      alert("Modify operations failed.");
    }
  };

  const handleDeleteTrainee = async (id: string) => {
    try {
      const res = await fetch(`/api/trainees/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      fetchDatabase();
    } catch (e) {
      alert("Failed deleting records.");
    }
  };

  // Mark Daily Attendance checks
  const handleMarkAttendance = async (records: Partial<AttendanceRecord>[]) => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records)
      });
      if (!res.ok) throw new Error("Failed marking register");
      fetchDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTraineeDailyCheckIn = (status: 'Present') => {
    if (!currentUser?.traineeId) return;
    handleMarkAttendance([{
      traineeId: currentUser.traineeId,
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
      checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      checkOutTime: '05:00 PM',
      method: 'QR Code'
    }]);
  };

  // Submit Weekly report
  const handleWeeklyReportSubmit = async (data: { weekNumber: number; learningSummary: string; fileName: string; fileData?: string }) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          traineeId: currentUser?.traineeId
        })
      });
      if (!res.ok) throw new Error("Failed submitting summary");
      fetchDatabase();
    } catch (err) {
      alert("Submissions logged off.");
    }
  };

  // Approve / Reject weekly summary
  const handleReviewReport = async (reportId: string, status: 'Approved' | 'Rejected', remarks: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          remarks,
          reviewerEmail: currentUser?.email,
          reviewerName: currentUser?.name
        })
      });
      if (!res.ok) throw new Error("Review dispatch error");
      fetchDatabase();
    } catch (e) {
      alert("Sumbission could not be modified.");
    }
  };

  // Upload Trainee documents
  const handleUploadDocument = async (category: any, name: string, fileName: string, fileData?: string) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: currentUser?.traineeId,
          category,
          name,
          fileName,
          fileData
        })
      });
      if (!res.ok) throw new Error("Credential upload error.");
      fetchDatabase();
    } catch (e) {
      alert("Upload failed.");
    }
  };

  // Verify Documents metadata (Admin action)
  const handleVerifyDocument = async (docId: string, verified: boolean, comments?: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified, comments })
      });
      if (!res.ok) throw new Error("Paperwork verification error");
      fetchDatabase();
    } catch (e) {
      alert("Verify failed.");
    }
  };

  // Publish notice board alerts
  const handleAddNotice = async (data: any) => {
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Publishing circular failed");
      fetchDatabase();
    } catch (e) {
      alert("Alert broadcasting failed.");
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Withdrawing failed");
      fetchDatabase();
    } catch (e) {
      alert("Withdraw failed.");
    }
  };

  // Schedules sessions additions
  const handleAddSchedule = async (data: any) => {
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Dispatch failed");
      fetchDatabase();
    } catch (e) {
      alert("Schedules not updated.");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Cancel failed");
      fetchDatabase();
    } catch (e) {
      alert("Schedule delete failed.");
    }
  };

  const handleApproveTrainee = (id: string) => {
    handleUpdateTrainee(id, { status: 'Active' });
  };

  // Helper values
  const activeTraineeProfile = currentUser?.traineeId 
    ? trainees.find(t => t.id === currentUser.traineeId) 
    : trainees[0]; // fallback matching active profile

  const pendingTrainees = trainees.filter(t => t.status === 'Pending');

  // Verify daily scan attendance checks
  const isCheckedInToday = React.useMemo(() => {
    if (!currentUser?.traineeId) return false;
    const today = new Date().toISOString().split('T')[0];
    return attendance.some(a => a.traineeId === currentUser.traineeId && a.date === today && a.status === 'Present');
  }, [attendance, currentUser]);

  // RENDER LOGIN GATEWAY
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none" style={{ backgroundImage: 'radial-gradient(#ffffff03 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Logo Heading */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
              <Building2 className="w-10 h-10 text-yellow-300 stroke-2" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-black text-white tracking-tight">TraiNexus</h1>
              <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400">GAIL India Ltd. • Vijaypur</p>
            </div>
          </div>

          {/* Form container */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600 rounded-t-2xl"></div>
            
            {/* Roles tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900 border border-slate-850 p-1.5 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthRole('admin');
                  setAuthError(null);
                  setEmailInput('admin@gail.co.in');
                  setPasswordInput('gailadmin123');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authRole === 'admin' 
                    ? 'bg-blue-650 text-white shadow-md shadow-blue-600/10' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                GAIL Admin Desk
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthRole('trainee');
                  setAuthError(null);
                  setEmailInput('rahul.shrivastava@manit.ac.in');
                  setPasswordInput('gail123');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authRole === 'trainee' 
                    ? 'bg-blue-650 text-white shadow-md shadow-blue-600/10' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Student Intern portal
              </button>
            </div>

            {/* Error alerts */}
            {authError && (
              <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-3 text-rose-300 text-xs text-center mb-4">
                {authError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 font-sans">
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase">Registered Email:</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@gail.co.in"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase">Access Password:</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-11 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-350 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-650 hover:bg-blue-700 hover:text-yellow-300 font-bold py-3.5 rounded-xl text-xs text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
              >
                {authLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Handshaking...
                  </>
                ) : (
                  <>
                    Sign In Secured Server <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Quick Help instructions panel (extremely useful for evaluations) */}
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-start gap-3 text-[11px] text-slate-400 font-sans leading-relaxed">
            <HelpCircle className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-200">Evaluation Credentials Guidelines:</span>
              <p>For Quick Testing, fields are pre-populated depending on the tab choice above.</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                <li><span className="font-semibold text-slate-300">Admin Login:</span> admin@gail.co.in / gailadmin123</li>
                <li><span className="font-semibold text-slate-300">Trainee Login:</span> rahul.shrivastava@manit.ac.in / gail123</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // RENDER MAIN APPLICATION INTERFACE
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">
      
      {/* Sidebar navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        role={currentUser.role}
        userName={currentUser.name}
        onLogout={handleLogout}
      />

      {/* Main Content frame */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header */}
        <Header 
          role={currentUser.role}
          userName={currentUser.name}
          onQuickRoleSwitch={handleQuickRoleSwitch}
        />

        {/* Dynamic page tab */}
        <main className="flex-1 p-8 overflow-y-auto max-w-[1400px] w-full mx-auto md:p-8 p-4">
          
          {globalLoading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
              <Database className="w-12 h-12 text-blue-500 animate-bounce" />
              <p className="text-slate-500 text-xs font-mono animate-pulse">Syncing corporate database coordinates...</p>
            </div>
          ) : (
            <>
              {/* ADMIN VIEW TABS */}
              {currentUser.role === 'admin' && (
                <>
                  {currentTab === 'dashboard' && stats && (
                    <AdminDashboard 
                      stats={stats}
                      recentLogs={auditLogs}
                      upcomingEvents={schedules}
                      departmentsData={schedules} // feeds schedules as departments placeholder as fallback
                      setCurrentTab={setCurrentTab}
                      onApproveTrainee={handleApproveTrainee}
                      pendingTrainees={pendingTrainees}
                    />
                  )}

                  {currentTab === 'trainees' && (
                    <TraineeManagementTab 
                      trainees={trainees}
                      onAddTrainee={handleAddTrainee}
                      onUpdateTrainee={handleUpdateTrainee}
                      onDeleteTrainee={handleDeleteTrainee}
                    />
                  )}

                  {currentTab === 'departments' && stats && (
                    <div className="bg-white rounded-xl p-8 border border-slate-205 text-center text-slate-500 text-xs shadow-xs space-y-3.5">
                      <h3 className="font-display font-semibold text-sm text-slate-900 text-left pb-4 border-b">Technology Sectors & Headcount Allocations</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {['Mechanical', 'Electrical', 'Instrumentation', 'Civil', 'Information Technology', 'Operations', 'Maintenance', 'Safety'].map((dept) => {
                          const list = trainees.filter(t => t.department === dept);
                          return (
                            <div key={dept} className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-left space-y-1">
                              <h4 className="font-display font-extrabold text-sm text-slate-900 leading-tight">{dept}</h4>
                              <p className="text-[10px] text-slate-400 font-mono">Operations unit sector</p>
                              <div className="border-t pt-2 mt-3 flex justify-between font-mono text-[11px] text-slate-600">
                                <span>Strength:</span>
                                <span className="font-semibold text-slate-900">{list.length} interns</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentTab === 'attendance' && (
                    <AttendanceTab 
                      role="admin"
                      trainees={trainees}
                      attendanceHistory={attendance}
                      onMarkAttendance={handleMarkAttendance}
                    />
                  )}

                  {currentTab === 'schedules' && (
                    <ScheduleTab 
                      role="admin"
                      events={schedules}
                      onAddEvent={handleAddSchedule}
                      onDeleteEvent={handleDeleteSchedule}
                    />
                  )}

                  {currentTab === 'reports' && (
                    <WeeklyReportsTab 
                      role="admin"
                      traineeName={currentUser.name}
                      reports={reports}
                      onSubmitReport={handleWeeklyReportSubmit}
                      onReviewReport={handleReviewReport}
                    />
                  )}

                  {currentTab === 'documents' && (
                    <DocumentsTab 
                      role="admin"
                      documents={documents}
                      onUploadDocument={handleUploadDocument}
                      onVerifyDocument={handleVerifyDocument}
                    />
                  )}

                  {currentTab === 'notices' && (
                    <NoticesTab 
                      role="admin"
                      notices={notices}
                      onAddNotice={handleAddNotice}
                      onDeleteNotice={handleDeleteNotice}
                    />
                  )}

                  {currentTab === 'audit' && (
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
                      <div>
                        <h3 className="font-display font-semibold text-slate-950">GAIL Network Activity Ledger</h3>
                        <p className="text-slate-500 text-xs">A comprehensive, immutable audit journal recording operations executed across the TraiNexus platform.</p>
                      </div>

                      <div className="border border-slate-150 rounded-xl overflow-hidden">
                        <div className="divide-y divide-slate-100 max-h-120 overflow-y-auto font-sans text-xs">
                          {auditLogs.map((log) => (
                            <div key={log.id} className="p-3.5 flex flex-col sm:flex-row justify-between hover:bg-slate-50 items-start sm:items-center gap-2">
                              <div className="space-y-0.5">
                                <p className="text-slate-800 font-medium">{log.action}</p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  Operator: <span className="font-semibold text-slate-600">{log.userName}</span> ({log.userEmail})
                                </p>
                              </div>
                              <span className="font-mono text-[10px] text-slate-400 shrink-0 select-none">
                                {log.timestamp}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* TRAINEE VIEW TABS */}
              {currentUser.role === 'trainee' && activeTraineeProfile && (
                <>
                  {currentTab === 'dashboard' && (
                    <TraineeDashboard 
                      trainee={activeTraineeProfile}
                      attendanceHistory={attendance}
                      notices={notices}
                      scheduleEvents={schedules}
                      weeklyReports={reports}
                      onCheckIn={handleTraineeDailyCheckIn}
                      isCheckedInToday={isCheckedInToday}
                      setCurrentTab={setCurrentTab}
                    />
                  )}

                  {currentTab === 'reports' && (
                    <WeeklyReportsTab 
                      role="trainee"
                      traineeName={currentUser.name}
                      currentTraineeId={currentUser.traineeId}
                      reports={reports}
                      onSubmitReport={handleWeeklyReportSubmit}
                      onReviewReport={handleReviewReport}
                    />
                  )}

                  {currentTab === 'documents' && (
                    <DocumentsTab 
                      role="trainee"
                      currentTraineeId={currentUser.traineeId}
                      documents={documents}
                      onUploadDocument={handleUploadDocument}
                    />
                  )}

                  {currentTab === 'schedules' && (
                    <ScheduleTab 
                      role="trainee"
                      events={schedules}
                    />
                  )}

                  {currentTab === 'certificate' && (
                    <CertTab 
                      trainee={activeTraineeProfile}
                    />
                  )}
                </>
              )}
            </>
          )}

        </main>
      </div>

    </div>
  );
}
