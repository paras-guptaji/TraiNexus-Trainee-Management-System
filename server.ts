import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import {
  Trainee,
  AttendanceRecord,
  WeeklyReport,
  TraineeDocument,
  Notice,
  AuditLog,
  DepartmentName,
  DepartmentInfo
} from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize Google Gen AI
let aiClient: any = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    // Rely on official SDK @google/genai
    aiClient = new GoogleGenAI({ apiKey });
    console.log("Gemini AI integration successfully initialized.");
  } else {
    console.warn("GEMINI_API_KEY is not configured or uses default template value. Server-side Gemini helper will run in offline demo mode.");
  }
} catch (err) {
  console.error("Failed to initialize Google Gen AI client:", err);
}

// Database JSON Storage File
const DB_FILE = path.join(process.cwd(), "gail_database.json");

// Helper structure for Database
interface DatabaseSchema {
  trainees: Trainee[];
  attendance: AttendanceRecord[];
  reports: WeeklyReport[];
  documents: TraineeDocument[];
  notices: Notice[];
  auditLogs: AuditLog[];
}

// Hardcoded initial seed database
const initSeedData = (): DatabaseSchema => {
  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const baseDate = new Date();
  
  // Format standard date helper
  const subtractDays = (num: number): string => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - num);
    return d.toISOString().split("T")[0];
  };

  const trainees: Trainee[] = [
    {
      id: "GT-2026-001",
      fullName: "Rahul Shrivastava",
      collegeName: "MANIT Bhopal",
      university: "RGPV Bhopal",
      branch: "Mechanical Engineering",
      semester: "8th Semester",
      email: "rahul.shrivastava@manit.ac.in",
      mobileNumber: "9876543210",
      address: "H.No 104, Saket Nagar, Bhopal, MP",
      emergencyContact: "Anand Shrivastava (Father) - 9876543209",
      startDate: subtractDays(20),
      endDate: subtractDays(-10),
      department: "Mechanical",
      status: "Active",
      grade: "A"
    },
    {
      id: "GT-2026-002",
      fullName: "Ananya Deshmukh",
      collegeName: "SGSITS Indore",
      university: "RGPV Bhopal",
      branch: "Information Technology",
      semester: "6th Semester",
      email: "ananya.deshmukh@sgsits.ac.in",
      mobileNumber: "8899887766",
      address: "65, Vijay Nagar, Indore, MP",
      emergencyContact: "Sandhya Deshmukh (Mother) - 8899887755",
      startDate: subtractDays(15),
      endDate: subtractDays(-15),
      department: "Information Technology",
      status: "Active"
    },
    {
      id: "GT-2026-003",
      fullName: "Amit Kumar Verma",
      collegeName: "IIT Indore",
      university: "IIT Indore",
      branch: "Electrical & Electronics",
      semester: "8th Semester",
      email: "amit.verma@iiti.ac.in",
      mobileNumber: "7766554433",
      address: "Sector-3, GAIL Officers Township, Vijaypur, Guna",
      emergencyContact: "R. K. Verma (Father) - 7766554422",
      startDate: subtractDays(25),
      endDate: subtractDays(-5),
      department: "Electrical",
      status: "Active",
      grade: "A+"
    },
    {
      id: "GT-2026-004",
      fullName: "Sneha Patel",
      collegeName: "VIT Vellore",
      university: "VIT University",
      branch: "Electronics & Instrumentation",
      semester: "Passed Out (2025)",
      email: "sneha.patel@vit.ac.in",
      mobileNumber: "9988776655",
      address: "Flat 402, Radhe Heights, Vadodara, Gujarat",
      emergencyContact: "Deepak Patel (Brother) - 9988776611",
      startDate: subtractDays(45),
      endDate: subtractDays(5),
      department: "Instrumentation",
      status: "Completed",
      grade: "A+"
    },
    {
      id: "GT-2026-005",
      fullName: "Vikramjit Singh",
      collegeName: "IIT Kanpur",
      university: "IIT Kanpur",
      branch: "Chemical Engineering",
      semester: "8th Semester",
      email: "vikram.singh@iitk.ac.in",
      mobileNumber: "9123456789",
      address: "A-50, Model Town, Jalandhar, Punjab",
      emergencyContact: "Gurmeet Singh (Father) - 9123456700",
      startDate: subtractDays(-5),
      endDate: subtractDays(-35),
      department: "Operations",
      status: "Pending"
    }
  ];

  // Past 10 days of attendance
  const attendance: AttendanceRecord[] = [];
  const attendees = ["GT-2026-001", "GT-2026-002", "GT-2026-003"];
  const namesMap: Record<string, {name: string, dept: DepartmentName}> = {
    "GT-2026-001": { name: "Rahul Shrivastava", dept: "Mechanical" },
    "GT-2026-002": { name: "Ananya Deshmukh", dept: "Information Technology" },
    "GT-2026-003": { name: "Amit Kumar Verma", dept: "Electrical" }
  };

  for (let i = 1; i <= 12; i++) {
    const recordsDate = subtractDays(i);
    // Sunday check
    const dateObj = new Date(recordsDate);
    if (dateObj.getDay() === 0) continue; // Skip Sundays

    attendees.forEach((id, index) => {
      // Simulate random leaves
      const isAbsent = i === 5 && index === 1;
      const isOnLeave = i === 9 && index === 0;

      attendance.push({
        id: `ATT-${recordsDate}-${id}`,
        traineeId: id,
        traineeName: namesMap[id].name,
        department: namesMap[id].dept,
        date: recordsDate,
        status: isAbsent ? "Absent" : isOnLeave ? "On Leave" : "Present",
        checkInTime: isAbsent || isOnLeave ? undefined : "08:52 AM",
        checkOutTime: isAbsent || isOnLeave ? undefined : "05:05 PM",
        method: index % 2 === 0 ? "QR Code" : "Manual"
      });
    });
  }

  // Attendance for today
  attendees.forEach((id, index) => {
    attendance.push({
      id: `ATT-${currentDate}-${id}`,
      traineeId: id,
      traineeName: namesMap[id].name,
      department: namesMap[id].dept,
      date: currentDate,
      status: "Present",
      checkInTime: "08:45 AM",
      checkOutTime: "05:00 PM",
      method: "QR Code"
    });
  });

  const reports: WeeklyReport[] = [
    {
      id: "REP-001",
      traineeId: "GT-2026-001",
      traineeName: "Rahul Shrivastava",
      weekNumber: 1,
      dateSubmitted: subtractDays(14),
      learningSummary: "Learnt safety precautions inside GAIL gas processing layout. Studied the operations of multi-stage centrifugal compressor facilities and the flow-regulator pipeline maps of GAIL Vijaypur.",
      fileName: "Weekly_Report_W01_Rahul.pdf",
      status: "Approved",
      comments: "Excellent summary. Keep focus on the valve-actuator designs next week."
    },
    {
      id: "REP-002",
      traineeId: "GT-2026-001",
      traineeName: "Rahul Shrivastava",
      weekNumber: 2,
      dateSubmitted: subtractDays(7),
      learningSummary: "Observed preventive repair practices on the Gas turbine units. Participated in the inspection of pipeline joint stresses under senior engineers. Learned static equipment pressure calculations.",
      fileName: "Weekly_Report_W02_Rahul.pdf",
      status: "Pending"
    },
    {
      id: "REP-003",
      traineeId: "GT-2026-002",
      traineeName: "Ananya Deshmukh",
      weekNumber: 1,
      dateSubmitted: subtractDays(8),
      learningSummary: "Studied the SCADA system setups in Information Technology block. Monitored server integration, network logs for telemetry operations, and analyzed fiber-optic backup routes across GAIL installations.",
      fileName: "Ananya_W01_IT_SCADA.pdf",
      status: "Approved",
      comments: "Good depth of analysis. Recommended detail on network protocol packet encryption for the next log."
    }
  ];

  const documents: TraineeDocument[] = [
    {
      id: "DOC-101",
      traineeId: "GT-2026-001",
      traineeName: "Rahul Shrivastava",
      category: "College Permission Letter",
      name: "MANIT College NOC Permit",
      fileName: "MANIT_NOC_Rahul_Shrivastava.docx",
      uploadDate: subtractDays(21),
      verified: true
    },
    {
      id: "DOC-102",
      traineeId: "GT-2026-001",
      traineeName: "Rahul Shrivastava",
      category: "Identity Proof",
      name: "Aadhaar Card copy",
      fileName: "Aadhaar_Rahul.jpg",
      uploadDate: subtractDays(21),
      verified: true
    },
    {
      id: "DOC-103",
      traineeId: "GT-2026-002",
      traineeName: "Ananya Deshmukh",
      category: "College Permission Letter",
      name: "SGSITS NOC College Letter",
      fileName: "NOC_SGSITS_Ananya.pdf",
      uploadDate: subtractDays(16),
      verified: true
    },
    {
      id: "DOC-104",
      traineeId: "GT-2026-001",
      traineeName: "Rahul Shrivastava",
      category: "Insurance Certificate",
      name: "Student Group Accident Coverage Policy",
      fileName: "Insurance_Premium_Rahul.pdf",
      uploadDate: subtractDays(21),
      verified: false,
      comments: "Review required - check end date of policy coverage."
    }
  ];

  const notices: Notice[] = [
    {
      id: "NOT-001",
      title: "Mandatory Safety Gear Compliance",
      content: "All trainees are strictly instructed to wear proper personal protective equipment (PPE) including safety helmets, high-visibility vestments, and steel-toe boots before entering the gas compressor station or storage yards. Non-compliance will lead to cancellation of industrial permission.",
      datePublished: subtractDays(18),
      publisher: "S. K. Dwivedi (Chief Manager - Safety Dept)",
      targetDepartment: "All",
      priority: "High"
    },
    {
      id: "NOT-002",
      title: "GAIL HR Training Registration Portal Upgrade",
      content: "The registration database for summer interns is being compiled. All trainees are requested to verify their college records, emergency numbers, and NOC letters with the HR desk, room 209-A in administrative block.",
      datePublished: subtractDays(5),
      publisher: "Neeta Gupta (Senior HR Officer)",
      targetDepartment: "All",
      priority: "Medium"
    },
    {
      id: "NOT-003",
      title: "Special Workshop: SCADA Operation Overview",
      content: "An orientation program on control system architecture is scheduled at the multi-purpose auditorium for Information Technology and Instrumentation branch interns.",
      datePublished: subtractDays(2),
      publisher: "P. Mukhopadhyay (Chief General Manager - SCADA/IT)",
      targetDepartment: "Information Technology",
      priority: "Low"
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: "LOG-001",
      userEmail: "admin@gail.co.in",
      userName: "HR Admin Office",
      role: "admin",
      action: "Created TraiNexus database. Pre-seeded initial corporate interns.",
      timestamp: `${subtractDays(25)} 09:15:00`
    },
    {
      id: "LOG-002",
      userEmail: "admin@gail.co.in",
      userName: "HR Admin Office",
      role: "admin",
      action: "Approved certificate generation for intern Sneha Patel (GT-2026-004) under Instrumentation department.",
      timestamp: `${subtractDays(2)} 11:42:15`
    },
    {
      id: "LOG-003",
      userEmail: "admin@gail.co.in",
      userName: "HR Admin Office",
      role: "admin",
      action: "Approved Weekly Report (Week 1) for GT-2026-001.",
      timestamp: `${subtractDays(13)} 14:30:10`
    }
  ];

  return {
    trainees,
    attendance,
    reports,
    documents,
    notices,
    auditLogs
  };
};

// Department Metadata
export const departmentsInfo: DepartmentInfo[] = [
  { id: "Mechanical", hodName: "Sanjay Dixit (CM-Mechanical)", blockName: "Utility Block Main", maxCapacity: 15 },
  { id: "Electrical", hodName: "Vipin Agrawal (DGM-Electrical)", blockName: "Substation Block A", maxCapacity: 12 },
  { id: "Instrumentation", hodName: "A. K. Somasekharan (CM-Instr)", blockName: "C&I Building West", maxCapacity: 10 },
  { id: "Civil", hodName: "G. S. Tomar (DGM-Civil Infrastructure)", blockName: "Township Estate Office", maxCapacity: 8 },
  { id: "Information Technology", hodName: "Rajesh Soni (DGM-IT/SCADA)", blockName: "Admin Block First Floor", maxCapacity: 10 },
  { id: "Operations", hodName: "P. K. Jain (GM-Operations Plant VI)", blockName: "C2/C3 Petrochemical Layout", maxCapacity: 20 },
  { id: "Maintenance", hodName: "Harish Chandra (DGM-Maintenance)", blockName: "Central Workshop Desk", maxCapacity: 15 },
  { id: "Safety", hodName: "S. K. Dwivedi (Chief Manager-Fire & Safety)", blockName: "Fire Station Complex", maxCapacity: 12 }
];

// Helper to Load database from JSON
const loadDb = (): DatabaseSchema => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const data = initSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
      return data;
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to read database file. Fallback to in-memory seed.", error);
    return initSeedData();
  }
};

// Helper to Save database to JSON
const saveDb = (db: DatabaseSchema) => {
  try {
    // Sync directories
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to database file.", err);
  }
};

// Training Schedule State
let schedules: any[] = [
  {
    id: "SCH-001",
    title: "Basic Plant Security and Gas Pipeline Codes",
    description: "Orientation with safety engineers explaining LPG layout, emergency gas vents, and safe gate pass systems.",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM - 12:00 PM",
    venue: "Main Conference Room, Admin Block",
    department: "All Departments",
    instructor: "S. K. Dwivedi (CM-Safety)"
  },
  {
    id: "SCH-002",
    title: "Centrifugal Compressors Assembly Checkup",
    description: "On-site session detailing shaft alignment and dry gas seal maintenance in compressor block-2.",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
    time: "09:30 AM - 11:30 AM",
    venue: "Gas Compressor Station-II Yard",
    department: "Mechanical",
    instructor: "B. K. Sen (Senior Engineer)"
  },
  {
    id: "SCH-003",
    title: "Network SCADA Interface Integration Briefing",
    description: "Classroom explanation of communications protocols, Modbus loop readings, and remote telemetry alerts.",
    date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0], // Day after tomorrow
    time: "02:30 PM - 04:30 PM",
    venue: "SCADA Control Hub Lab",
    department: "Information Technology",
    instructor: "Amit Gupta (Manager IT & Networks)"
  }
];

// In memory schedules fallback sync helper - saved in database schema in larger systems, kept simple here.

// API Endpoints
// ==========================================

// Authenticate user
app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Handle Default accounts
  if (role === "admin" && email === "admin@gail.co.in" && password === "gailadmin123") {
    return res.json({
      token: "admin-jwt-token-gail",
      user: {
        id: "USR-000",
        email: "admin@gail.co.in",
        name: "S. Dixit (Adviser HRD)",
        role: "admin"
      }
    });
  }

  if (role === "trainee" && password === "gail123") {
    const db = loadDb();
    const candidate = db.trainees.find(t => t.email.toLowerCase() === email.toLowerCase());
    
    if (candidate) {
      return res.json({
        token: `trainee-token-${candidate.id}`,
        user: {
          id: `USR-${candidate.id}`,
          email: candidate.email,
          name: candidate.fullName,
          role: "trainee",
          traineeId: candidate.id
        }
      });
    }
  }

  // Create registration trigger or return 401
  return res.status(401).json({ error: "Invalid credentials. For Admin, use admin@gail.co.in/gailadmin123. For Trainees, use your pre-registered email with gail123" });
});

// GET statistics for Admin panel dashboard
app.get("/api/stats", (req, res) => {
  const db = loadDb();
  const trainees = db.trainees;
  const attendance = db.attendance;
  const today = new Date().toISOString().split("T")[0];

  const totalTrainees = trainees.length;
  const activeTrainees = trainees.filter(t => t.status === "Active").length;
  const completedTrainees = trainees.filter(t => t.status === "Completed").length;
  const pendingValidation = trainees.filter(t => t.status === "Pending").length;
  
  const todayRecord = attendance.filter(a => a.date === today && a.status === "Present").length;
  
  // Calculate average attendance rate
  // Grab active trainees
  const activeIds = trainees.filter(t => t.status === "Active").map(t => t.id);
  const totalPossibleDays = activeIds.length * 10; // last 10 days
  const presentDaysCount = attendance.filter(
    a => activeIds.includes(a.traineeId) && a.status === "Present"
  ).length;

  const avgAttendanceRate = totalPossibleDays > 0 
    ? Math.round((presentDaysCount / totalPossibleDays) * 100) 
    : 92;

  res.json({
    totalTrainees,
    activeTrainees,
    completedTrainees,
    pendingValidation,
    attendanceToday: todayRecord || activeTrainees, // default seed
    avgAttendanceRate: Math.min(100, Math.max(75, avgAttendanceRate))
  });
});

// GET all trainees
app.get("/api/trainees", (req, res) => {
  const db = loadDb();
  const { department, status, query } = req.query;
  
  let result = [...db.trainees];

  if (department && department !== "All") {
    result = result.filter(t => t.department === department);
  }

  if (status && status !== "All") {
    result = result.filter(t => t.status === status);
  }

  if (query) {
    const q = String(query).toLowerCase();
    result = result.filter(
      t =>
        t.fullName.toLowerCase().includes(q) ||
        t.collegeName.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q)
    );
  }

  res.json(result);
});

// GET specific trainee
app.get("/api/trainees/:id", (req, res) => {
  const db = loadDb();
  const id = req.params.id;
  const item = db.trainees.find(t => t.id === id);
  if (!item) return res.status(404).json({ error: "Trainee not found" });
  res.json(item);
});

// CREATE trainee
app.post("/api/trainees", (req, res) => {
  const db = loadDb();
  const data = req.body;

  // Validate email uniqeness
  const exists = db.trainees.find(t => t.email.toLowerCase() === data.email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "A trainee with this email is already registered." });
  }

  // Generate Trainee ID
  const prefix = "GT-2026-";
  const num = db.trainees.length + 1;
  const newId = `${prefix}${String(num).padStart(3, "0")}`;

  const newTrainee: Trainee = {
    id: newId,
    fullName: data.fullName,
    collegeName: data.collegeName,
    university: data.university,
    branch: data.branch,
    semester: data.semester || "8th Semester",
    email: data.email,
    mobileNumber: data.mobileNumber,
    address: data.address,
    emergencyContact: data.emergencyContact,
    startDate: data.startDate || new Date().toISOString().split("T")[0],
    endDate: data.endDate || new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0], // +30 days
    department: data.department,
    status: data.status || "Active",
    grade: data.grade || undefined
  };

  db.trainees.push(newTrainee);

  // Auto add audit log
  db.auditLogs.unshift({
    id: `LOG-ADD-${Date.now()}`,
    userEmail: data.createdByEmail || "admin@gail.co.in",
    userName: data.createdByName || "HR Admin Office",
    role: "admin",
    action: `Registered new candidate: ${data.fullName} under ${data.department} department.`,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19)
  });

  // Seeds and creates base mandatory document uploads placeholders
  const mandatoryCategories = [
    "College Permission Letter",
    "Identity Proof",
    "Insurance Certificate",
    "Passport Photo"
  ];

  mandatoryCategories.forEach((cat, index) => {
    db.documents.push({
      id: `DOC-AUTO-${newId}-${index}`,
      traineeId: newId,
      traineeName: data.fullName,
      name: `${cat} - File Setup`,
      category: cat as any,
      fileName: "(Awaiting Candidate upload...)",
      uploadDate: new Date().toISOString().split("T")[0],
      verified: false
    });
  });

  saveDb(db);
  res.status(201).json(newTrainee);
});

// UPDATE trainee details
app.put("/api/trainees/:id", (req, res) => {
  const db = loadDb();
  const id = req.params.id;
  const index = db.trainees.findIndex(t => t.id === id);

  if (index === -1) return res.status(404).json({ error: "Trainee not found" });

  const oldRecord = db.trainees[index];
  const updatePayload = req.body;

  db.trainees[index] = {
    ...oldRecord,
    ...updatePayload,
    id // keep ID protected
  };

  // Add log
  db.auditLogs.unshift({
    id: `LOG-UPD-${Date.now()}`,
    userEmail: updatePayload.editorEmail || "admin@gail.co.in",
    userName: updatePayload.editorName || "HR Admin Office",
    role: "admin",
    action: `Modified profiles for candidate: ${oldRecord.fullName} (${id}). Status: ${updatePayload.status || oldRecord.status}.`,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19)
  });

  saveDb(db);
  res.json(db.trainees[index]);
});

// DELETE trainee
app.delete("/api/trainees/:id", (req, res) => {
  const db = loadDb();
  const id = req.params.id;
  const index = db.trainees.findIndex(t => t.id === id);

  if (index === -1) return res.status(404).json({ error: "Trainee not found" });

  const name = db.trainees[index].fullName;
  db.trainees.splice(index, 1);

  // clean associated logs / data
  db.attendance = db.attendance.filter(a => a.traineeId !== id);
  db.reports = db.reports.filter(r => r.traineeId !== id);
  db.documents = db.documents.filter(d => d.traineeId !== id);

  db.auditLogs.unshift({
    id: `LOG-DEL-${Date.now()}`,
    userEmail: "admin@gail.co.in",
    userName: "HR Admin Office",
    role: "admin",
    action: `Removed candidate ${name} (${id}) completely from records.`,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19)
  });

  saveDb(db);
  res.json({ success: true, message: "Trainee deleted completely." });
});

// GET attendance history
app.get("/api/attendance", (req, res) => {
  const db = loadDb();
  const { date, traineeId } = req.query;
  
  let records = [...db.attendance];

  if (date) {
    records = records.filter(r => r.date === date);
  }

  if (traineeId) {
    records = records.filter(r => r.traineeId === traineeId);
  }

  // Sort descending by date
  records.sort((a,b) => b.date.localeCompare(a.date));

  res.json(records);
});

// POST mark attendance (Single or Batch)
app.post("/api/attendance", (req, res) => {
  const db = loadDb();
  const payload = req.body; // Can be a single object or an array of records

  const processSingle = (rec: Partial<AttendanceRecord>) => {
    if (!rec.traineeId || !rec.date || !rec.status) return null;

    const traineeObj = db.trainees.find(t => t.id === rec.traineeId);
    if (!traineeObj) return null;

    const id = `ATT-${rec.date}-${rec.traineeId}`;
    const existingIndex = db.attendance.findIndex(a => a.id === id);

    const record: AttendanceRecord = {
      id,
      traineeId: rec.traineeId,
      traineeName: traineeObj.fullName,
      department: traineeObj.department,
      date: rec.date,
      status: rec.status as any,
      checkInTime: rec.checkInTime || (rec.status === "Present" ? "08:50 AM" : undefined),
      checkOutTime: rec.checkOutTime || (rec.status === "Present" ? "05:00 PM" : undefined),
      method: rec.method || "Manual"
    };

    if (existingIndex !== -1) {
      db.attendance[existingIndex] = record;
    } else {
      db.attendance.push(record);
    }
    return record;
  };

  if (Array.isArray(payload)) {
    const results = payload.map(processSingle).filter(Boolean);
    saveDb(db);
    return res.json({ success: true, count: results.length, data: results });
  } else {
    const result = processSingle(payload);
    if (!result) return res.status(400).json({ error: "Incomplete validation fields" });
    saveDb(db);
    return res.json(result);
  }
});

// GET departments info & current load statistics
app.get("/api/departments", (req, res) => {
  const db = loadDb();
  const deptList = [...departmentsInfo];

  const response = deptList.map(dept => {
    const allocated = db.trainees.filter(t => t.department === dept.id);
    const activeAllocated = allocated.filter(t => t.status === "Active").length;
    const completedAllocated = allocated.filter(t => t.status === "Completed").length;

    return {
      ...dept,
      allocatedCount: allocated.length,
      activeCount: activeAllocated,
      completedCount: completedAllocated
    };
  });

  res.json(response);
});

// GET training weekly reports list
app.get("/api/reports", (req, res) => {
  const db = loadDb();
  const { traineeId, status } = req.query;

  let records = [...db.reports];

  if (traineeId) {
    records = records.filter(r => r.traineeId === traineeId);
  }

  if (status) {
    records = records.filter(r => r.status === status);
  }

  // Sort by week sequence desc
  records.sort((a,b) => b.weekNumber - a.weekNumber);

  res.json(records);
});

// POST submit weekly report (Trainee endpoint)
app.post("/api/reports", (req, res) => {
  const db = loadDb();
  const data = req.body;

  if (!data.traineeId || !data.weekNumber || !data.learningSummary) {
    return res.status(400).json({ error: "Missing required report information." });
  }

  const student = db.trainees.find(t => t.id === data.traineeId);
  if (!student) return res.status(404).json({ error: "Trainee profile not found." });

  // Check if report for this week already exists
  const existingIndex = db.reports.findIndex(
    r => r.traineeId === data.traineeId && r.weekNumber === Number(data.weekNumber)
  );

  const reportId = `REP-${Date.now()}`;
  const newReport: WeeklyReport = {
    id: existingIndex !== -1 ? db.reports[existingIndex].id : reportId,
    traineeId: data.traineeId,
    traineeName: student.fullName,
    weekNumber: Number(data.weekNumber),
    dateSubmitted: new Date().toISOString().split("T")[0],
    learningSummary: data.learningSummary,
    fileName: data.fileName || `W${data.weekNumber}_Report_${data.traineeId}.pdf`,
    fileData: data.fileData || "",
    status: "Pending" // resets or sets back to pending on edits
  };

  if (existingIndex !== -1) {
    db.reports[existingIndex] = newReport;
  } else {
    db.reports.push(newReport);
  }

  // Automatically record document in Document Vault too for transparency
  const docId = `DOC-REP-${data.traineeId}-${data.weekNumber}`;
  const existingDocIdx = db.documents.findIndex(d => d.id === docId);

  const traineeDoc: TraineeDocument = {
    id: docId,
    traineeId: data.traineeId,
    traineeName: student.fullName,
    category: "Weekly Report" as any,
    name: `Weekly Training Report - Week ${data.weekNumber}`,
    fileName: newReport.fileName,
    fileData: data.fileData || "",
    uploadDate: new Date().toISOString().split("T")[0],
    verified: false
  };

  if (existingDocIdx !== -1) {
    db.documents[existingDocIdx] = traineeDoc;
  } else {
    db.documents.push(traineeDoc);
  }

  saveDb(db);
  res.status(201).json(newReport);
});

// PUT review weekly report (Admin approval / rejection)
app.put("/api/reports/:id/review", (req, res) => {
  const db = loadDb();
  const id = req.params.id;
  const { status, remarks, reviewerEmail, reviewerName } = req.body;

  if (!status || !["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ error: "Valid assessment status (Approved/Rejected) is required." });
  }

  const index = db.reports.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ error: "Weekly report not found" });

  db.reports[index].status = status;
  db.reports[index].comments = remarks || "";

  // Find associated document and update verify status
  const rDocId = `DOC-REP-${db.reports[index].traineeId}-${db.reports[index].weekNumber}`;
  const docIdx = db.documents.findIndex(d => d.id === rDocId);
  if (docIdx !== -1) {
    db.documents[docIdx].verified = status === "Approved";
    db.documents[docIdx].comments = remarks || "";
  }

  db.auditLogs.unshift({
    id: `LOG-REP-REV-${Date.now()}`,
    userEmail: reviewerEmail || "admin@gail.co.in",
    userName: reviewerName || "HR Admin Office",
    role: "admin",
    action: `${status} Weekly Report Week ${db.reports[index].weekNumber} for candidate ${db.reports[index].traineeName} (${db.reports[index].traineeId}). Remarks: ${remarks || "None"}`,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19)
  });

  saveDb(db);
  res.json(db.reports[index]);
});

// GET documents list
app.get("/api/documents", (req, res) => {
  const db = loadDb();
  const { traineeId } = req.query;

  let records = [...db.documents];
  if (traineeId) {
    records = records.filter(d => d.traineeId === traineeId);
  }

  res.json(records);
});

// POST upload client-side documents
app.post("/api/documents", (req, res) => {
  const db = loadDb();
  const data = req.body;

  if (!data.traineeId || !data.category || !data.fileName) {
    return res.status(400).json({ error: "Missing uploaded file attributes" });
  }

  const trainee = db.trainees.find(t => t.id === data.traineeId);
  if (!trainee) return res.status(404).json({ error: "Trainee profile not found" });

  const docId = `DOC-UP-${Date.now()}`;
  const newDoc: TraineeDocument = {
    id: docId,
    traineeId: data.traineeId,
    traineeName: trainee.fullName,
    category: data.category,
    name: data.name || `${data.category} - Paperwork`,
    fileName: data.fileName,
    fileData: data.fileData || "",
    uploadDate: new Date().toISOString().split("T")[0],
    verified: false,
    comments: undefined
  };

  // Replace folder setup or existing categories of the same type if applicable
  const existingSetupIdx = db.documents.findIndex(
    d => d.traineeId === data.traineeId && d.category === data.category && d.fileName.includes("(Awaiting")
  );

  if (existingSetupIdx !== -1) {
    db.documents[existingSetupIdx] = {
      ...db.documents[existingSetupIdx],
      name: newDoc.name,
      fileName: newDoc.fileName,
      fileData: newDoc.fileData,
      uploadDate: newDoc.uploadDate,
      verified: false
    };
    saveDb(db);
    return res.status(200).json(db.documents[existingSetupIdx]);
  } else {
    db.documents.push(newDoc);
    saveDb(db);
    return res.status(201).json(newDoc);
  }
});

// PUT verifies documents status
app.put("/api/documents/:id/verify", (req, res) => {
  const db = loadDb();
  const id = req.params.id;
  const { verified, comments } = req.body;

  const idx = db.documents.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ error: "Document not found." });

  db.documents[idx].verified = !!verified;
  if (comments !== undefined) db.documents[idx].comments = comments;

  db.auditLogs.unshift({
    id: `LOG-DOC-VERI-${Date.now()}`,
    userEmail: "admin@gail.co.in",
    userName: "HR Admin Office",
    role: "admin",
    action: `Document '${db.documents[idx].name}' (${db.documents[idx].category}) for trainee ${db.documents[idx].traineeName} marked as ${!!verified ? "Verified" : "Rejected"}.`,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19)
  });

  saveDb(db);
  res.json(db.documents[idx]);
});

// GET Notices list
app.get("/api/notices", (req, res) => {
  const db = loadDb();
  res.json(db.notices);
});

// POST Publish Notice (Admin)
app.post("/api/notices", (req, res) => {
  const db = loadDb();
  const data = req.body;

  if (!data.title || !data.content) {
    return res.status(400).json({ error: "Notice Title and Content are required." });
  }

  const noticeId = `NOT-${Date.now()}`;
  const notice: Notice = {
    id: noticeId,
    title: data.title,
    content: data.content,
    datePublished: new Date().toISOString().split("T")[0],
    publisher: data.publisher || "HRD Training Coordinator Office",
    targetDepartment: data.targetDepartment || "All",
    priority: data.priority || "Medium"
  };

  db.notices.unshift(notice);

  db.auditLogs.unshift({
    id: `LOG-NOT-ADD-${Date.now()}`,
    userEmail: "admin@gail.co.in",
    userName: "HR Admin Office",
    role: "admin",
    action: `Broadcasted Notice: "${data.title}" targeting ${notice.targetDepartment} department interns.`,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19)
  });

  saveDb(db);
  res.status(201).json(notice);
});

// DELETE notice
app.delete("/api/notices/:id", (req, res) => {
  const db = loadDb();
  const id = req.params.id;
  const index = db.notices.findIndex(n => n.id === id);

  if (index === -1) return res.status(404).json({ error: "Notice not found." });

  const name = db.notices[index].title;
  db.notices.splice(index, 1);

  saveDb(db);
  res.json({ success: true, message: `Removed announcement: "${name}"` });
});

// GET Schedule Events
app.get("/api/schedules", (req, res) => {
  res.json(schedules);
});

// POST Add Schedule sessions
app.post("/api/schedules", (req, res) => {
  const data = req.body;
  if (!data.title || !data.date || !data.time) {
    return res.status(400).json({ error: "Title, date, and times are required." });
  }

  const newSch = {
    id: `SCH-${Date.now()}`,
    title: data.title,
    description: data.description || "",
    date: data.date,
    time: data.time,
    venue: data.venue || "Safety Hall Meeting Room",
    department: data.department || "All Departments",
    instructor: data.instructor || "Assigned Trainer"
  };

  schedules.push(newSch);

  const db = loadDb();
  db.auditLogs.unshift({
    id: `LOG-SCH-${Date.now()}`,
    userEmail: "admin@gail.co.in",
    userName: "HR Admin Office",
    role: "admin",
    action: `Scheduled training event: "${data.title}" for date: ${data.date}.`,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19)
  });
  saveDb(db);

  res.status(201).json(newSch);
});

// DELETE schedule session
app.delete("/api/schedules/:id", (req, res) => {
  const id = req.params.id;
  const index = schedules.findIndex(s => s.id === id);

  if (index === -1) return res.status(404).json({ error: "Schedule event not found." });
  schedules.splice(index, 1);
  res.json({ success: true, message: "Calendar event removed successfully." });
});

// GET Audit Logs list
app.get("/api/audit-logs", (req, res) => {
  const db = loadDb();
  res.json(db.auditLogs);
});

// POST Gemini API Report Summarizer
app.post("/api/gemini/summarize", async (req, res) => {
  const { summaryText, weekNum, studentName } = req.body;

  if (!summaryText) {
    return res.status(400).json({ error: "Learning logging text is empty." });
  }

  if (!aiClient) {
    // Mock response for quick demo is super helpful when key isn't verified yet
    return res.json({
      summary: `[OFFLINE DEMO SUMMARY] Candidate ${studentName} successfully logged Week ${weekNum || "X"} industrial interactions. Key areas include learning safety protocols, operating layouts, stress valves, and plant workflows. Report highlights clear integration under supervising staff. Recommendations: Continue active plant tours and note pressure metrics.`,
      qualityRating: "Excellent (8.5/10)",
      feedbackTopics: ["Plant Safety Gear Compliance", "Gas Compression Shaft Maintenance", "Pressure valves calibrations"]
    });
  }

  try {
    // Generate content using the new official @google/genai SDK
    // Relying on guidelines, use gemini-2.5-flash as default
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert HR Development Coordinator and Engineering Trainer at GAIL India Limited Vijaypur. 
Analyze the following trainee's weekly learning log summary. Check if it displays genuine understanding of industrial operations, technical accuracy, and adherence to safety. Write a concise 3-sentence evaluation summary, provide a Quality Rating (e.g., Excellent, Good, Average) and list 3 relevant technical questions they should research or next-steps.

Trainee Name: ${studentName || "Intern"}
Week Number: ${weekNum || 1}
Trainee Log: "${summaryText}"

Return the response strictly inside this JSON format:
{
  "summary": "your evaluation summary text here",
  "qualityRating": "High / Moderate / Developing",
  "feedbackTopics": ["Topic / Question 1", "Topic / Question 2", "Topic / Question 3"]
}
Ensure it is a valid parsable JSON string.`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text);
    return res.json(parsed);
  } catch (error) {
    console.error("Gemini processing error:", error);
    return res.status(500).json({ 
      error: "Gemini server process experienced an error.",
      fallback: `Trainee logged activities surrounding the following areas: ${summaryText.substring(0, 100)}...`
    });
  }
});


// Serve Front-end App via Vite & static handlers
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GAIL TraiNexus Full-Stack Server booted at: http://localhost:${PORT}`);
  });
}

startServer();
