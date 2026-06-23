/**
 * TraiNexus Shared Type Definitions
 */

export type UserRole = 'admin' | 'trainee';

export interface User {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  name: string;
  traineeId?: string; // Associated trainee profile ID for trainee role
}

export type DepartmentName =
  | 'Mechanical'
  | 'Electrical'
  | 'Instrumentation'
  | 'Civil'
  | 'Information Technology'
  | 'Operations'
  | 'Maintenance'
  | 'Safety';

export type TraineeStatus = 'Pending' | 'Active' | 'Completed';

export interface Trainee {
  id: string; // e.g. "GT-2026-001"
  fullName: string;
  collegeName: string;
  university: string;
  branch: string;
  semester: string;
  email: string;
  mobileNumber: string;
  address: string;
  emergencyContact: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  department: DepartmentName;
  status: TraineeStatus;
  profilePhoto?: string;
  grade?: string; // e.g., 'A+', 'A', 'B'
}

export type AttendanceStatus = 'Present' | 'Absent' | 'On Leave';

export interface AttendanceRecord {
  id: string;
  traineeId: string;
  traineeName: string;
  department: DepartmentName;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string; // HH:MM
  checkOutTime?: string; // HH:MM
  method: 'Manual' | 'QR Code';
}

export interface DepartmentInfo {
  id: DepartmentName;
  hodName: string;
  blockName: string;
  maxCapacity: number;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM - 12:00 PM"
  venue: string;
  department: string; // DepartmentName | "All Departments"
  instructor: string;
}

export type ReportStatus = 'Pending' | 'Approved' | 'Rejected';

export interface WeeklyReport {
  id: string;
  traineeId: string;
  traineeName: string;
  weekNumber: number;
  dateSubmitted: string; // YYYY-MM-DD
  learningSummary: string;
  fileName: string;
  fileData?: string; // base64 representation or mock url
  status: ReportStatus;
  comments?: string;
}

export type DocumentCategory =
  | 'College Permission Letter'
  | 'Identity Proof'
  | 'Insurance Certificate'
  | 'Passport Photo'
  | 'Project Report'
  | 'Completion Certificate';

export interface TraineeDocument {
  id: string;
  traineeId: string;
  traineeName: string;
  name: string;
  category: DocumentCategory;
  fileName: string;
  fileData?: string; // mock file or simulated base64
  uploadDate: string; // YYYY-MM-DD
  verified: boolean;
  comments?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  datePublished: string; // YYYY-MM-DD
  publisher: string;
  targetDepartment: string; // DepartmentName | "All"
  priority: 'High' | 'Medium' | 'Low';
}

export interface AuditLog {
  id: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  action: string;
  timestamp: string; // YYYY-MM-DD HH:MM:SS
}

export interface SystemStats {
  totalTrainees: number;
  activeTrainees: number;
  completedTrainees: number;
  pendingValidation: number;
  attendanceToday: number;
  avgAttendanceRate: number;
}
