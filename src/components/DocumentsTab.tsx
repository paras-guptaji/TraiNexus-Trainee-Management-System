import React from 'react';
import { 
  FolderLock, 
  Upload, 
  CheckCircle, 
  Clock, 
  FileText, 
  Trash2, 
  User, 
  Download, 
  Check, 
  X,
  PlusSquare
} from 'lucide-react';
import { TraineeDocument, UserRole, DocumentCategory } from '../types';

interface DocumentsTabProps {
  role: UserRole;
  currentTraineeId?: string;
  documents: TraineeDocument[];
  onUploadDocument: (category: DocumentCategory, name: string, fileName: string, fileData?: string) => void;
  onVerifyDocument?: (docId: string, verified: boolean, comments?: string) => void;
}

export default function DocumentsTab({
  role,
  currentTraineeId,
  documents,
  onUploadDocument,
  onVerifyDocument
}: DocumentsTabProps) {

  // Trainee Upload Trigger states
  const [activeCategory, setActiveCategory] = React.useState<DocumentCategory>('College Permission Letter');
  const [docLabel, setDocLabel] = React.useState('');
  const [fileName, setFileName] = React.useState('');
  const [fileData, setFileData] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const categories: DocumentCategory[] = [
    'College Permission Letter',
    'Identity Proof',
    'Insurance Certificate',
    'Passport Photo',
    'Project Report',
    'Completion Certificate'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = () => {
        setFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) {
      alert("Please browse or drag a document file to upload.");
      return;
    }

    setIsUploading(true);
    onUploadDocument(
      activeCategory,
      docLabel || `${activeCategory} - Submission`,
      fileName,
      fileData
    );

    setTimeout(() => {
      setIsUploading(false);
      setDocLabel('');
      setFileName('');
      setFileData('');
      alert(`Successfully uploaded "${activeCategory}" for review.`);
    }, 700);
  };

  // Filter lists based on role
  const filteredDocs = role === 'admin' 
    ? documents 
    : documents.filter(d => d.traineeId === currentTraineeId);

  return (
    <div className="space-y-6">
      
      {/* Upper Information Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-start gap-4">
        <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl shrink-0">
          <FolderLock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-display font-semibold text-slate-900 text-sm">Industrial Security Document Vault</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            In compliance with GAIL safety and petrochemical plant policies, all mandatory student credentials must be verified prior to active field induction. All uploaded records are encrypted inside the server.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trainee Upload Panel (Only if Trainee) */}
        {role === 'trainee' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-display font-semibold text-slate-950">Safe Upload Drawer</h3>
            <p className="text-slate-500 text-xs">Verify your file format (PDF, JPEG) before routing.</p>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Credential Category *</label>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Document Decription Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aadhaar Card copy, NOC Permission"
                  value={docLabel}
                  onChange={(e) => setDocLabel(e.target.value)}
                  className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Attachment File *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs border border-slate-200 hover:border-blue-500 bg-slate-50 rounded-lg cursor-pointer text-slate-650"
                >
                  <span className="truncate max-w-44 font-medium">{fileName || "Browse Document..."}</span>
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <PlusSquare className="w-4 h-4" /> Upload Document Credentials
              </button>

            </form>
          </div>
        )}

        {/* Directory List of documents (Col Span depends on role) */}
        <div className={`bg-white rounded-xl border border-slate-200 shadow-xs p-6 ${
          role === 'admin' ? 'lg:col-span-3' : 'lg:col-span-2'
        }`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-display font-semibold text-slate-950">Paperwork Verification ledger</h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Total {filteredDocs.length} files secure
            </span>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              No files are loaded into this safe directory catalog yet.
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* File Metadata */}
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-250 border border-slate-300 text-slate-800 font-mono text-[8px] font-black px-1.5 py-0.2 rounded uppercase select-none">
                        Ref# {doc.id.substring(4, 9)}
                      </span>
                      <h4 className="text-xs font-bold text-slate-950 leading-tight">{doc.name}</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Cat: <span className="font-semibold text-slate-700">{doc.category}</span>
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono">
                      Uploaded by: <span className="font-medium text-slate-600">{doc.traineeName} ({doc.traineeId})</span> • {doc.uploadDate}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 font-mono">
                      <FileText className="w-3.5 h-3.5" /> File name: {doc.fileName}
                    </p>
                    {doc.comments && (
                      <div className="mt-1.5 p-1.5 bg-yellow-50 text-yellow-800 text-[10px] rounded border border-yellow-100 flex gap-1 items-start leading-snug">
                        <span className="font-bold">Remarks:</span>
                        <span>{doc.comments}</span>
                      </div>
                    )}
                  </div>

                  {/* Options control */}
                  <div className="flex items-center gap-2 shrink-0">
                    
                    {/* Verified/Pending stamp */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      doc.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-105 text-amber-800'
                    }`}>
                      {doc.verified ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Hard Verified
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Review
                        </>
                      )}
                    </span>

                    {/* Download */}
                    {doc.fileData && (
                      <a
                        href={doc.fileData}
                        download={doc.fileName}
                        className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg cursor-pointer"
                        title="Download raw document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Admin Verification Action */}
                    {role === 'admin' && onVerifyDocument && (
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                        <button
                          onClick={() => onVerifyDocument(doc.id, true)}
                          className="p-1 hover:bg-emerald-50 text-emerald-600 rounded transition-colors cursor-pointer"
                          title="Verify File Credentials"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const note = window.prompt("Write rejection reason or warning remark for this document file:", "Missing correct seals or stamp signature");
                            if (note !== null) {
                              onVerifyDocument(doc.id, false, note || "Rejected paperwork credentials");
                            }
                          }}
                          className="p-1 hover:bg-rose-50 text-rose-500 rounded transition-colors cursor-pointer"
                          title="Flag / Reject Document"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
