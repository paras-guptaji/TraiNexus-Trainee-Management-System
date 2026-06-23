import React from 'react';
import { 
  CheckSquare, 
  XSquare, 
  Calendar, 
  QrCode, 
  Search, 
  Check, 
  X, 
  RefreshCw, 
  Clock, 
  Camera,
  Layers,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { AttendanceRecord, Trainee, DepartmentName, UserRole, AttendanceStatus } from '../types';

interface AttendanceTabProps {
  role: UserRole;
  trainees: Trainee[];
  attendanceHistory: AttendanceRecord[];
  onMarkAttendance: (records: Partial<AttendanceRecord>[]) => void;
  currentTraineeId?: string; // only if role === 'trainee'
}

export default function AttendanceTab({
  role,
  trainees,
  attendanceHistory,
  onMarkAttendance,
  currentTraineeId
}: AttendanceTabProps) {

  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = React.useState<string>('All');
  const [searchTerm, setSearchTerm] = React.useState('');

  // Local state for the register list modifications before saving
  const [registerSheet, setRegisterSheet] = React.useState<Record<string, AttendanceStatus>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  // QR scanner simulation states
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [qrSimulationStep, setQrSimulationStep] = React.useState<'idle' | 'scanning' | 'success'>('idle');

  const departments: DepartmentName[] = [
    'Mechanical',
    'Electrical',
    'Instrumentation',
    'Civil',
    'Information Technology',
    'Operations',
    'Maintenance',
    'Safety'
  ];

  // Initialize sheet when selected date changes
  React.useEffect(() => {
    const sheet: Record<string, AttendanceStatus> = {};
    
    // Default to active trainees
    const activeTrainees = trainees.filter(t => t.status === 'Active');
    
    // Find already stored records for this date
    const dayRecords = attendanceHistory.filter(r => r.date === selectedDate);
    
    activeTrainees.forEach(t => {
      const match = dayRecords.find(r => r.traineeId === t.id);
      sheet[t.id] = match ? match.status : 'Present'; // default to Present if unmarked
    });

    setRegisterSheet(sheet);
  }, [selectedDate, trainees, attendanceHistory]);

  const handleStatusChange = (traineeId: string, status: AttendanceStatus) => {
    setRegisterSheet(prev => ({
      ...prev,
      [traineeId]: status
    }));
  };

  const handleSaveRegister = () => {
    setIsSaving(true);
    const updates = Object.keys(registerSheet).map(tId => {
      const trainee = trainees.find(t => t.id === tId);
      return {
        traineeId: tId,
        date: selectedDate,
        status: registerSheet[tId],
        checkInTime: registerSheet[tId] === 'Present' ? '08:50 AM' : undefined,
        checkOutTime: registerSheet[tId] === 'Present' ? '05:05 PM' : undefined,
        method: 'Manual' as const
      };
    });

    onMarkAttendance(updates);
    
    setTimeout(() => {
      setIsSaving(false);
      alert(`Master attendance logs saved successfully for date: ${selectedDate}`);
    }, 600);
  };

  // Trainee check-in QR Scanner simulation
  const handleSimulatedQRScan = () => {
    if (!currentTraineeId) return;
    setQrSimulationStep('scanning');

    setTimeout(() => {
      // Mark present
      onMarkAttendance([{
        traineeId: currentTraineeId,
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
        checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        checkOutTime: '05:00 PM',
        method: 'QR Code'
      }]);
      setQrSimulationStep('success');
    }, 1800);
  };

  // Filter trainees list for sheet
  const activeTraineesList = trainees.filter(t => t.status === 'Active');
  const filteredTrainees = activeTraineesList.filter(t => {
    const matchesSearch = t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || t.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Calculate statistics for selected date
  const dayLogs = attendanceHistory.filter(r => r.date === selectedDate);
  const presentCount = dayLogs.filter(d => d.status === 'Present').length;
  const absentCount = dayLogs.filter(d => d.status === 'Absent').length;
  const leaveCount = dayLogs.filter(d => d.status === 'On Leave').length;

  return (
    <div className="space-y-6">
      
      {/* RENDER ADMIN ATTENDANCE VIEW */}
      {role === 'admin' ? (
        <div className="space-y-6">
          
          {/* Quick Header stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            {/* Presence tracker counter */}
            <div className="bg-white p-4 border border-slate-200/80 rounded-xl shadow-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Date Checked</span>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="font-mono font-bold text-slate-800 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-emerald-50/50 p-4 border border-emerald-150 rounded-xl">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Total Present</span>
              <h4 className="text-xl font-bold text-emerald-800 font-display mt-0.5">{presentCount || activeTraineesList.length}</h4>
            </div>

            <div className="bg-rose-50/50 p-4 border border-rose-150 rounded-xl">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">On Leave</span>
              <h4 className="text-xl font-bold text-rose-800 font-display mt-0.5">{leaveCount}</h4>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Unresolved absent</span>
              <h4 className="text-xl font-bold text-slate-700 font-display mt-0.5">{absentCount}</h4>
            </div>

          </div>

          {/* Table register control panel */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display font-semibold text-slate-950">Daily Attendance Registrar Sheet</h3>
                <p className="text-slate-500 text-xs">Verify checkbox status and click Save Updates below to submit corporate logs.</p>
              </div>

              {/* Filtering attributes */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name/ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 px-2 py-1 py-1.5 rounded-lg text-xs text-slate-600">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="bg-transparent focus:outline-none font-medium"
                  >
                    <option value="All">All Tech Sectors</option>
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 max-h-120 overflow-y-auto pr-1">
              {filteredTrainees.map((trainee) => {
                const currentStatus = registerSheet[trainee.id] || 'Present';
                return (
                  <div key={trainee.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{trainee.fullName}</h4>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400 mt-0.5">
                        <span className="font-bold text-slate-700">{trainee.id}</span>
                        <span>•</span>
                        <span>{trainee.department}</span>
                        <span>•</span>
                        <span className="truncate max-w-48">{trainee.collegeName}</span>
                      </div>
                    </div>

                    {/* Registar triggers */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(trainee.id, 'Present')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border flex items-center gap-1 cursor-pointer transition-all ${
                          currentStatus === 'Present' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" /> Present
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(trainee.id, 'On Leave')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border flex items-center gap-1 cursor-pointer transition-all ${
                          currentStatus === 'On Leave' 
                            ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-xs' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" /> On Leave
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(trainee.id, 'Absent')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border flex items-center gap-1 cursor-pointer transition-all ${
                          currentStatus === 'Absent' 
                            ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" /> Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">Unsaved entries reset upon date swap or tab exit.</span>
              <button
                type="button"
                onClick={handleSaveRegister}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white hover:text-yellow-300 disabled:opacity-50 font-bold px-5 py-2.5 rounded-xl shadow-md text-xs cursor-pointer flex items-center gap-1.5 transition-transform"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" /> Save Register logs
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* RENDER TRAINEE PERSONAL ATTENDANCE VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Timeline and History Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 lg:col-span-2">
            <h3 className="font-display font-semibold text-slate-950 mb-3">My Personal Attendance Sheets</h3>
            <p className="text-slate-500 text-xs mb-4">Every morning, scanning the QR coordinates at the administrative building registers your check-in timestamp.</p>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {attendanceHistory.filter(h => h.traineeId === currentTraineeId).map((row) => (
                <div key={row.id} className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded mr-2 font-bold uppercase select-none">
                      {row.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800">{row.date}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 pl-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Check-In: {row.checkInTime || 'N/A'}</span>
                      <span>|</span>
                      <span>Check-Out: {row.checkOutTime || 'N/A'}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    row.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                    row.status === 'On Leave' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* QR Scan Portal block */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
              <QrCode className="w-6 h-6" />
            </div>
            
            <div>
              <h3 className="font-display font-semibold text-slate-900">Virtual Verification QR</h3>
              <p className="text-slate-500 text-xs mt-1">In compliance with safety codes, interns scan QR stamps located at plant registration gates.</p>
            </div>

            {/* Simulated interactive QR Code */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl max-w-56 mx-auto relative group">
              <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-100">
                <svg className="w-full aspect-square text-slate-800" viewBox="0 0 100 100">
                  {/* Styled mock QR grid code paths */}
                  <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="11" y="11" width="13" height="13" fill="currentColor" />
                  
                  <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="76" y="11" width="13" height="13" fill="currentColor" />
                  
                  <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="11" y="76" width="13" height="13" fill="currentColor" />

                  <rect x="40" y="20" width="15" height="5" fill="currentColor" />
                  <rect x="50" y="30" width="8" height="20" fill="currentColor" />
                  <rect x="70" y="45" width="15" height="10" fill="currentColor" />
                  <rect x="35" y="60" width="20" height="22" fill="currentColor" />
                  <rect x="80" y="80" width="12" height="12" fill="currentColor" />
                </svg>
              </div>
              <p className="text-[9px] font-mono text-slate-400 mt-2 select-none">SCANNER NODE #VJP-0994</p>
            </div>

            <button
              onClick={() => {
                setQrSimulationStep('idle');
                setShowQRModal(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1"
            >
              <Camera className="w-4 h-4" /> Scan Node Gate QR
            </button>
          </div>

        </div>
      )}

      {/* QR PORTAL SIMULATOR MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden border border-slate-200 shadow-xl p-6 text-center space-y-4">
            
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-display font-bold text-xs text-slate-800 flex items-center gap-1">
                <QrCode className="w-4 h-4 text-blue-600" /> GATE COMPRESSOR SCANNER
              </span>
              <button onClick={() => setShowQRModal(false)} className="p-1 hover:bg-slate-100 rounded text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {qrSimulationStep === 'idle' && (
              <div className="space-y-4 py-4">
                <p className="text-xs text-slate-600">Simulate scanning of the GAIL corporate ID card on the digital device.</p>
                <div className="w-48 h-48 bg-slate-100 border border-slate-350 rounded-xl mx-auto flex items-center justify-center border-dashed relative">
                  <Camera className="w-8 h-8 text-slate-400 animate-pulse" />
                  <span className="absolute bottom-2 font-mono text-[9px] text-slate-400">Positioning sensor...</span>
                </div>
                <button
                  onClick={handleSimulatedQRScan}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs cursor-pointer shadow-sm"
                >
                  Confirm NFC Scan
                </button>
              </div>
            )}

            {qrSimulationStep === 'scanning' && (
              <div className="py-8 space-y-4">
                <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-800">Reading biometric secure key hashes...</p>
                <p className="text-[10px] text-slate-400 font-mono">Server handshake in progress.</p>
              </div>
            )}

            {qrSimulationStep === 'success' && (
              <div className="py-6 space-y-4 animate-in zoom-in-95">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-2" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Attendance Logged Successfully!</h4>
                  <p className="text-xs text-slate-500 mt-1">Check-in recorded under date {new Date().toISOString().split('T')[0]}.</p>
                </div>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
                >
                  Close Portal
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
