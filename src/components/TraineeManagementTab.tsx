import React from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download, 
  X, 
  UserPlus, 
  Check, 
  Inbox, 
  GraduationCap, 
  Phone, 
  Calendar,
  Layers
} from 'lucide-react';
import { Trainee, DepartmentName, TraineeStatus } from '../types';

interface TraineeManagementTabProps {
  trainees: Trainee[];
  onAddTrainee: (data: Omit<Trainee, 'id'>) => void;
  onUpdateTrainee: (id: string, data: Partial<Trainee>) => void;
  onDeleteTrainee: (id: string) => void;
}

export default function TraineeManagementTab({
  trainees,
  onAddTrainee,
  onUpdateTrainee,
  onDeleteTrainee
}: TraineeManagementTabProps) {

  // Search & Filter state
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedDept, setSelectedDept] = React.useState<string>('All');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('All');

  // Modal controls
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [activeTrainee, setActiveTrainee] = React.useState<Trainee | null>(null);

  // Form states
  const [fullName, setFullName] = React.useState('');
  const [collegeName, setCollegeName] = React.useState('');
  const [university, setUniversity] = React.useState('');
  const [branch, setBranch] = React.useState('');
  const [semester, setSemester] = React.useState('8th Semester');
  const [email, setEmail] = React.useState('');
  const [mobileNumber, setMobileNumber] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [emergencyContact, setEmergencyContact] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [department, setDepartment] = React.useState<DepartmentName>('Mechanical');
  const [status, setStatus] = React.useState<TraineeStatus>('Active');
  const [grade, setGrade] = React.useState('');

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

  // Map fields for Edit form
  const openEditModal = (trainee: Trainee) => {
    setActiveTrainee(trainee);
    setFullName(trainee.fullName);
    setCollegeName(trainee.collegeName);
    setUniversity(trainee.university);
    setBranch(trainee.branch);
    setSemester(trainee.semester);
    setEmail(trainee.email);
    setMobileNumber(trainee.mobileNumber);
    setAddress(trainee.address);
    setEmergencyContact(trainee.emergencyContact);
    setStartDate(trainee.startDate);
    setEndDate(trainee.endDate);
    setDepartment(trainee.department);
    setStatus(trainee.status);
    setGrade(trainee.grade || '');
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTrainee({
      fullName,
      collegeName,
      university,
      branch,
      semester,
      email,
      mobileNumber,
      address,
      emergencyContact,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      department,
      status
    });
    // Reset Form
    setFullName('');
    setCollegeName('');
    setUniversity('');
    setBranch('');
    setEmail('');
    setMobileNumber('');
    setAddress('');
    setEmergencyContact('');
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrainee) return;
    onUpdateTrainee(activeTrainee.id, {
      fullName,
      collegeName,
      university,
      branch,
      semester,
      email,
      mobileNumber,
      address,
      emergencyContact,
      startDate,
      endDate,
      department,
      status,
      grade: grade || undefined
    });
    setIsEditModalOpen(false);
    setActiveTrainee(null);
  };

  // Filter logic
  const filteredTrainees = trainees.filter(t => {
    const matchesSearch = 
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.collegeName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'All' || t.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Export filtered trainees to Excel/CSV with standard header rows
  const handleExportCSV = () => {
    const headers = [
      'Trainee ID',
      'Full Name',
      'Department',
      'Status',
      'Branch',
      'College Name',
      'Email',
      'Mobile',
      'Start Date',
      'End Date',
      'Grade'
    ];

    const rows = filteredTrainees.map(t => [
      t.id,
      t.fullName,
      t.department,
      t.status,
      t.branch,
      t.collegeName,
      t.email,
      t.mobileNumber,
      t.startDate,
      t.endDate,
      t.grade || 'N/A'
    ]);

    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map(x => `"${x.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'GAIL_Vijaypur_Trainees_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and control Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        
        {/* Search Input bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Trainee ID, college, name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filters and export */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Department Filter selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-xs text-slate-600">
            <Layers className="w-3.5 h-3.5" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent focus:outline-none text-[11px] font-medium"
            >
              <option value="All">All Sectors</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent focus:outline-none text-[11px] font-medium"
            >
              <option value="All">All States</option>
              <option value="Pending">Pending Approval</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Downloader Reports button */}
          <button
            onClick={handleExportCSV}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
            title="Download CSV Records"
          >
            <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Add Trainee trigger button */}
          <button
            onClick={() => {
              // reset form attributes first before add
              setFullName('');
              setCollegeName('');
              setUniversity('');
              setBranch('');
              setEmail('');
              setMobileNumber('');
              setAddress('');
              setEmergencyContact('');
              setStartDate(new Date().toISOString().split('T')[0]);
              setEndDate(new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]);
              setDepartment('Mechanical');
              setStatus('Active');
              setIsAddModalOpen(true);
            }}
            className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-lg text-[11px] flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Trainee
          </button>

        </div>
      </div>

      {/* Main Trainee directory grid / Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        
        {filteredTrainees.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400">
            <Inbox className="w-12 h-12 text-slate-350 stroke-1" />
            <h4 className="font-display font-medium text-slate-900 mt-2 text-sm">No Trainees Located</h4>
            <p className="text-xs text-slate-500 mt-1">Try resetting the keyword or adding a new record placeholder.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono tracking-wider text-slate-500 uppercase select-none">
                  <th className="py-3.5 px-5">Trainee ID</th>
                  <th className="py-3.5 px-4">Trainee Name</th>
                  <th className="py-3.5 px-4">Sector Dept</th>
                  <th className="py-3.5 px-4">College Information</th>
                  <th className="py-3.5 px-4">Duration Range</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTrainees.map((trainee) => (
                  <tr key={trainee.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Trainee ID column paired with Branch */}
                    <td className="py-4 px-5">
                      <div className="font-mono font-bold text-slate-900">{trainee.id}</div>
                      <span className="text-[10px] text-slate-400 font-medium font-mono">{trainee.branch}</span>
                    </td>

                    {/* Personal Name paired with Email */}
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      <div>{trainee.fullName}</div>
                      <span className="text-[10px] text-slate-500 font-mono font-normal flex items-center gap-0.5 mt-0.5">
                        {trainee.email}
                      </span>
                    </td>

                    {/* Sector Dept */}
                    <td className="py-4 px-4">
                      <span className="bg-blue-50 border border-blue-150 text-blue-800 font-mono font-semibold px-2 py-0.5 rounded text-[10px]">
                        {trainee.department}
                      </span>
                    </td>

                    {/* College & University */}
                    <td className="py-4 px-4">
                      <div className="truncate max-w-44 text-slate-900 font-medium flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{trainee.collegeName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block max-w-44 pl-4.5">{trainee.university}</span>
                    </td>

                    {/* Dates duration */}
                    <td className="py-4 px-4 text-[10px] text-slate-600 font-mono">
                      <div className="flex items-center gap-1 text-slate-800 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{trainee.startDate}</span>
                      </div>
                      <div className="pl-4.5 mt-0.5 text-slate-400 text-[9px]">to {trainee.endDate}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        trainee.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        trainee.status === 'Completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          trainee.status === 'Active' ? 'bg-emerald-500' :
                          trainee.status === 'Completed' ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`} />
                        {trainee.status}
                      </span>
                    </td>

                    {/* Operations tools */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(trainee)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Edit Intern Records"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you absolutely sure you want to permanently remove candidate ${trainee.fullName} and delete all associated reports and documents?`)) {
                              onDeleteTrainee(trainee.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Intern Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: ADD TRAINEE FORM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-yellow-300" />
                <div>
                  <h3 className="font-display font-semibold text-sm">Register Summer Trainee</h3>
                  <p className="text-[10px] text-slate-400">Creates an intern card and registers blank paperwork placeholders.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Candidate Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyanshu Patidar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. candidate@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g., 9876543210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Branch */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Academic Branch *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mechanical Engineering"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* College Info */}
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">College Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., SGSITS Indore"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* University */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Affiliated University *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., RGPV Bhopal"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Semester */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Semester / Phase *</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                    <option value="Passed Out (2025)">Passed Out (2025)</option>
                  </select>
                </div>

                {/* Training Start date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Training Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Training End date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Training End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Department assigned */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Allocated Sector Dept *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as DepartmentName)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Operational Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TraineeStatus)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending Validation</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Emergency contact */}
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Emergency Contact Info *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S.K. Patidar (Father) - 9425000000"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Home Address */}
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Postal Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Sector-XX, House 14, GAIL Colony..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>

              </div>

              {/* Actions footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TRAINEE FORM */}
      {isEditModalOpen && activeTrainee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Edit className="w-5 h-5 text-yellow-300" />
                <div>
                  <h3 className="font-display font-semibold text-sm">Modify Candidate Profile</h3>
                  <p className="text-[10px] text-slate-400">Trainee Database update for {activeTrainee.id}.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Candidate Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Operational Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TraineeStatus)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending Approval</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Training Grade (Once Completed)</label>
                  <input
                    type="text"
                    placeholder="e.g., A+, A, B"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Allocated Sector Dept</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as DepartmentName)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">College Name</label>
                  <input
                    type="text"
                    required
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>

                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">Home Address</label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-slate-700"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm cursor-pointer"
                >
                  Save Modifications
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
