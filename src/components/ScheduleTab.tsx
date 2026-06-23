import React from 'react';
import { 
  Calendar, 
  MapPin, 
  User, 
  Tag, 
  Plus, 
  Clock, 
  Trash2, 
  X,
  PlusSquare,
  Sparkles
} from 'lucide-react';
import { ScheduleEvent, UserRole } from '../types';

interface ScheduleTabProps {
  role: UserRole;
  events: ScheduleEvent[];
  onAddEvent?: (data: Omit<ScheduleEvent, 'id'>) => void;
  onDeleteEvent?: (id: string) => void;
}

export default function ScheduleTab({
  role,
  events,
  onAddEvent,
  onDeleteEvent
}: ScheduleTabProps) {

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = React.useState('10:00 AM - 12:00 PM');
  const [venue, setVenue] = React.useState('');
  const [department, setDepartment] = React.useState('All Departments');
  const [instructor, setInstructor] = React.useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) {
      alert("Please complete event titles, dates and times.");
      return;
    }

    if (onAddEvent) {
      onAddEvent({
        title,
        description,
        date,
        time,
        venue: venue || 'Administrative Seminar Hall-II',
        department,
        instructor: instructor || 'Supervising Engineer'
      });
    }

    // Reset Form
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('10:00 AM - 12:00 PM');
    setVenue('');
    setDepartment('All Departments');
    setInstructor('');
    setIsAddOpen(false);
    alert("New scheduled training block released onto trainees' streams.");
  };

  // Sort events chronologically sorted by date ascending
  const sortedEvents = [...events].sort((a,b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      
      {/* Tab bar header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-display font-bold text-slate-900">Training Calendar & Department Visits</h2>
          <p className="text-xs text-slate-500 mt-1">Timeline schedules, safety workshops, and petrochemical orientation programs.</p>
        </div>

        {role === 'admin' && onAddEvent && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 font-bold hover:text-yellow-300 text-white px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" /> Schedule Session
          </button>
        )}
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedEvents.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 text-xs">
            No training activities are currently mapped out.
          </div>
        ) : (
          sortedEvents.map((el) => (
            <div key={el.id} className="bg-white rounded-xl border border-slate-200 hover:border-slate-350 transition-all duration-150 p-5 flex flex-col justify-between shadow-xs space-y-4">
              
              <div className="space-y-3.5">
                {/* Meta Header */}
                <div className="flex justify-between items-start gap-2">
                  <span className="font-mono text-[9px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-150 uppercase truncate max-w-36 select-none">
                    {el.department}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 font-medium shrink-0">{el.date}</span>
                </div>

                {/* Event Title */}
                <div>
                  <h4 className="font-display font-bold text-slate-950 text-sm leading-tight">{el.title}</h4>
                  <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">{el.description}</p>
                </div>
              </div>

              {/* Event Bottom Specs */}
              <div className="space-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-sans">
                
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">{el.time}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate" title={el.venue}>{el.venue}</span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Instructor: <span className="font-medium text-slate-800">{el.instructor}</span></span>
                </div>

                {role === 'admin' && onDeleteEvent && (
                  <div className="pt-2 text-right">
                    <button
                      onClick={() => {
                        if (window.confirm("Do you want to permanently cancel this calendar event?")) {
                          onDeleteEvent(el.id);
                        }
                      }}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Cancel lecture
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* ADDS EVENT SCHEDULE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 animate-in fade-in-50 zoom-in-95 duration-150">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <span className="font-display font-semibold text-sm flex items-center gap-2">
                <PlusSquare className="w-5 h-5 text-yellow-300" /> Release Lecture / Plant Tour
              </span>
              <button onClick={() => setIsAddOpen(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Lecture/Session Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dry Gas Seals Overhaul orientation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Brief Description</label>
                <textarea
                  placeholder="Explain goals, key technical codes or plant guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Timing range *</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM - 12:00 PM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Authorized Senior Instructor</label>
                <input
                  type="text"
                  placeholder="e.g. S. Dixit (DGM Maintenance)"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Target Branch / Division</label>
                  <input
                    type="text"
                    placeholder="e.g. Mechanical, All Departments"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Plant Location / Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Gas Turbine Building Yard-3"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm"
                >
                  Confirm dispatch
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
