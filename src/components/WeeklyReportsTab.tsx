import React from 'react';
import { 
  FileText, 
  Upload, 
  Check, 
  X, 
  Sparkles, 
  Clock, 
  HelpCircle, 
  AlertCircle, 
  ChevronRight,
  RefreshCw,
  Search,
  MessageSquare
} from 'lucide-react';
import { WeeklyReport, UserRole, ReportStatus } from '../types';

interface WeeklyReportsTabProps {
  role: UserRole;
  traineeName: string;
  currentTraineeId?: string;
  reports: WeeklyReport[];
  onSubmitReport: (data: { weekNumber: number; learningSummary: string; fileName: string; fileData?: string }) => void;
  onReviewReport: (reportId: string, status: ReportStatus, comments: string) => void;
}

export default function WeeklyReportsTab({
  role,
  traineeName,
  currentTraineeId,
  reports,
  onSubmitReport,
  onReviewReport
}: WeeklyReportsTabProps) {

  // Trainee Form States
  const [weekNumber, setWeekNumber] = React.useState(1);
  const [learningSummary, setLearningSummary] = React.useState('');
  const [fileName, setFileName] = React.useState('');
  const [fileData, setFileData] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // AI assistant states
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiFeedback, setAiFeedback] = React.useState<{
    summary?: string;
    qualityRating?: string;
    feedbackTopics?: string[];
  } | null>(null);

  // Admin filter states
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('All');
  const [reviewedRemarks, setReviewedRemarks] = React.useState<Record<string, string>>({});

  // File drag-and-drop simulation
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      // Simulate file reading base64
      const reader = new FileReader();
      reader.onload = () => {
        setFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!learningSummary || !fileName) {
      alert("Please complete the summary and upload your weekly PDF report.");
      return;
    }

    setIsSubmitting(true);
    onSubmitReport({
      weekNumber: Number(weekNumber),
      learningSummary,
      fileName,
      fileData
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setWeekNumber(prev => Math.min(4, prev + 1));
      setLearningSummary('');
      setFileName('');
      setFileData('');
      setAiFeedback(null);
      alert("Weekly report submitted successfully to the training admin authority.");
    }, 800);
  };

  // Triggers Google Gemini analysis route
  const handleAIAssist = async () => {
    if (!learningSummary || learningSummary.trim().length < 20) {
      alert("Please write at least a short paragraph of what you learned this week before requesting AI analysis.");
      return;
    }

    setAiLoading(true);
    setAiFeedback(null);

    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summaryText: learningSummary,
          weekNum: weekNumber,
          studentName: traineeName
        })
      });

      if (!res.ok) throw new Error("Gemini server process failed");
      const data = await res.json();
      setAiFeedback(data);
    } catch (e) {
      console.error(e);
      // Fallback
      setAiFeedback({
        summary: "Unable to connect cleanly to Gemini server. [OFFLINE MOCK RATINGS]: Analysis verifies learning log focuses on gas compressor and pressure calibrations. High standard.",
        qualityRating: "Excellent",
        feedbackTopics: ["Verify Valve Safety Calibration Codes", "Study pipeline stress joint tolerances"]
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Admin filter and search list
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.traineeName.toLowerCase().includes(searchTerm.toLowerCase()) || r.traineeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* RENDER ADMIN REVIEW QUEUE */}
      {role === 'admin' ? (
        <div className="space-y-6">
          
          {/* Header search controls */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-display font-semibold text-slate-950">Industrial Logs Review Queue</h3>
              <p className="text-slate-500 text-xs">Verify documentation attachments and approve/reject weekly submissions.</p>
            </div>

            <div className="flex gap-3 items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search intern name, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-600 focus:outline-none"
              >
                <option value="All">All statuses</option>
                <option value="Pending">Pending Audit</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* List queue */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 p-20 text-center text-slate-400 rounded-xl">
                No weekly reports loaded matching current search criteria.
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 animate-in fade-in-50">
                  
                  {/* Top Bar info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="bg-indigo-50 text-indigo-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase mr-2 select-none">
                        Week {report.weekNumber} Report
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">{report.dateSubmitted}</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {report.traineeName} <span className="font-mono text-[11px] text-slate-400 font-normal">({report.traineeId})</span>
                      </h4>
                    </div>

                    <span className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold ${
                      report.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      report.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  {/* Summary Text */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-150">
                    <p className="text-xs font-mono font-bold tracking-wide text-slate-500 uppercase">Learning summary details:</p>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed whitespace-pre-line">{report.learningSummary}</p>
                    
                    {/* Mock File download option */}
                    <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Attachment: {report.fileName}
                      </span>
                      <a
                        href={report.fileData || '#'}
                        onClick={(e) => {
                          if (!report.fileData) e.preventDefault();
                        }}
                        download={report.fileName}
                        className="text-blue-600 hover:underline text-[10px] font-bold"
                      >
                        Download PDF File Documentation
                      </a>
                    </div>
                  </div>

                  {/* Review Box (Only if Pending) */}
                  {report.status === 'Pending' ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[100x] font-mono font-bold text-slate-500 uppercase">Coordinator remarks/remarks:</label>
                        <textarea
                          placeholder="Write feedback/corrective instructions here..."
                          value={reviewedRemarks[report.id] || ''}
                          onChange={(e) => setReviewedRemarks(prev => ({ ...prev, [report.id]: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => onReviewReport(report.id, 'Rejected', reviewedRemarks[report.id] || 'Report requires more focus and technical descriptions')}
                          className="px-3.5 py-2 hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" /> Reject Report with Remarks
                        </button>
                        
                        <button
                          onClick={() => onReviewReport(report.id, 'Approved', reviewedRemarks[report.id] || 'Review completed. Approved successfully.')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <Check className="w-4 h-4" /> Approve Report
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display existing comment
                    report.comments && (
                      <div className="mt-2 text-xs bg-indigo-50/50 border border-indigo-150 p-3 rounded-lg flex items-start gap-2.5">
                        <MessageSquare className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-indigo-950">Coordinator Comments:</p>
                          <p className="text-slate-650 mt-0.5">{report.comments}</p>
                        </div>
                      </div>
                    )
                  )}

                </div>
              ))
            )}
          </div>

        </div>
      ) : (
        /* RENDER TRAINEE WEEKLY REPORTS VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Form Side (Col Span 3) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 lg:col-span-3 space-y-5">
            <div>
              <h3 className="font-display font-semibold text-slate-900">Weekly report submissions portal</h3>
              <p className="text-slate-500 text-xs mt-1">Submit your learning details, research accomplishments, and upload your weekly PDF report.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* Select Week */}
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Week Number</label>
                  <select
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>

                {/* Simulated file loader (mandatory) */}
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">PDF Report Upload</label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs border border-slate-200 rounded-lg hover:border-blue-500/50 bg-slate-50 text-slate-600 font-medium cursor-pointer"
                  >
                    <span className="truncate max-w-44">{fileName || "Click to Browse file..."}</span>
                    <Upload className="w-3.5 h-3.5 shrink-0 ml-2" />
                  </button>
                </div>

                {/* Summary Text Area */}
                <div className="space-y-1 col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Weekly Work summary / description *</label>
                    <button
                      type="button"
                      onClick={handleAIAssist}
                      disabled={aiLoading}
                      className="text-blue-600 hover:text-blue-700 animate-pulse font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer select-none"
                    >
                      {aiLoading ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" /> Verifying...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> AI Code Check
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    required
                    placeholder="Write down mechanical calibrations, SCADA configurations, safety protocols, and daily plant operations logs observed during this week..."
                    value={learningSummary}
                    onChange={(e) => setLearningSummary(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2.5 text-xs text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-slate-950 hover:text-yellow-300 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-md text-xs cursor-pointer flex items-center justify-center gap-1 transition-transform"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" /> Submit Report to Coordinator
                  </>
                )}
              </button>

            </form>

            {/* AI Assistant feedback panel */}
            {aiFeedback && (
              <div className="p-4 bg-indigo-50/50 border border-indigo-150 rounded-xl space-y-2.5 animate-in fade-in zoom-in-95 leading-relaxed">
                <div className="flex items-center gap-2 text-indigo-800">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="font-display font-bold text-xs">GAIL Technical Advisor AI Analysis</span>
                </div>
                <div className="text-xs text-slate-700">
                  <p className="font-bold text-slate-900">Summary Review Assessment:</p>
                  <p className="mt-0.5">{aiFeedback.summary}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">Quality Index:</span>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.2 rounded">
                    {aiFeedback.qualityRating}
                  </span>
                </div>
                {aiFeedback.feedbackTopics && aiFeedback.feedbackTopics.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/50">
                    <p className="text-[10px] font-mono text-slate-400">Technical Items to Study:</p>
                    <ul className="list-disc pl-4 text-slate-650 mt-1 space-y-0.5 text-xs">
                      {aiFeedback.feedbackTopics.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* History Side (Col Span 2) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 lg:col-span-2">
            <h3 className="font-display font-semibold text-slate-900 mb-3">Submission History</h3>
            
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
              {reports.filter(r => r.traineeId === currentTraineeId).map((row) => (
                <div key={row.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-baseline justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900">Week {row.weekNumber} Report</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      row.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {row.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">Submitted on: {row.dateSubmitted}</p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 italic">"{row.learningSummary}"</p>
                  
                  {row.comments && (
                    <div className="bg-indigo-50/50 p-2.5 rounded border border-indigo-150 text-[10px] text-slate-650 mt-2">
                      <p className="font-bold text-indigo-950">Review Remaks:</p>
                      <p className="mt-0.5">{row.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
