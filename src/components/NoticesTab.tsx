import React from 'react';
import { Megaphone, Trash2, Calendar, ShieldAlert, Plus, X, Tag } from 'lucide-react';
import { Notice, UserRole } from '../types';

interface NoticesTabProps {
  role: UserRole;
  notices: Notice[];
  onAddNotice?: (data: Omit<Notice, 'id'>) => void;
  onDeleteNotice?: (id: string) => void;
}

export default function NoticesTab({
  role,
  notices,
  onAddNotice,
  onDeleteNotice
}: NoticesTabProps) {

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [priority, setPriority] = React.useState<'High' | 'Medium' | 'Low'>('Medium');
  const [targetDept, setTargetDept] = React.useState('All');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert("Title and content are required.");
      return;
    }

    if (onAddNotice) {
      onAddNotice({
        title,
        content,
        priority,
        targetDepartment: targetDept,
        datePublished: new Date().toISOString().split('T')[0],
        publisher: 'HRD Training Coordinator Office'
      });
    }

    setTitle('');
    setContent('');
    setPriority('Medium');
    setTargetDept('All');
    setIsAddOpen(false);
    alert("New notice broadcasted immediately.");
  };

  return (
    <div className="space-y-6">
      
      {/* Header action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-display font-bold text-slate-900">Safety Compliance & General Notice Board</h2>
          <p className="text-xs text-slate-500 mt-1">Official circulars, plant entry protocols, and training assessment updates.</p>
        </div>

        {role === 'admin' && onAddNotice && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 font-bold hover:text-yellow-300 text-white px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" /> Publish Circular
          </button>
        )}
      </div>

      {/* Main Notice Streams list */}
      <div className="space-y-4 max-w-4xl">
        {notices.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-white">
            There are no notices published on the stream at this hour.
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-xl border border-slate-250 p-5 space-y-4 relative overflow-hidden shadow-xs hover:border-slate-350 transition-all duration-150">
              
              {/* Top info and priority flash */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono border ${
                      notice.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                      notice.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {notice.priority} priority
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {notice.datePublished}
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-slate-900 text-base leading-tight mt-1">{notice.title}</h3>
                </div>

                {role === 'admin' && onDeleteNotice && (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to permanently withdraw this circular?")) {
                        onDeleteNotice(notice.id);
                      }
                    }}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                    title="Withdraw Circular"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Circular body content */}
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{notice.content}</p>

              {/* Bottom Authority references */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-500 font-mono gap-1">
                <span>Issued by authority: <span className="font-semibold text-slate-700">{notice.publisher}</span></span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold text-[9px] uppercase self-start sm:self-auto select-none">
                  Target dept: {notice.targetDepartment}
                </span>
              </div>

            </div>
          ))
        )}
      </div>

      {/* ADDS CIRCULAR FORM MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <span className="font-display font-semibold text-sm flex items-center gap-1.5">
                <Megaphone className="w-5 h-5 text-yellow-300" /> Dispatch New Circular Announcement
              </span>
              <button onClick={() => setIsAddOpen(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Circular Subject/Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Interns safety audit checkup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Circular Message Content *</label>
                <textarea
                  required
                  placeholder="Compose detailed memo and guidelines..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none text-slate-705"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Priority Index</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-600"
                  >
                    <option value="Low">Low (General)</option>
                    <option value="Medium">Medium (Attention)</option>
                    <option value="High">High (Immediate Action)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Target intern dept</label>
                  <input
                    type="text"
                    placeholder="e.g. Mechanical, Civil, All"
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm"
                >
                  Publish announcement
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
