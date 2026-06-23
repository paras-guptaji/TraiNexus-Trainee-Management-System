import React from 'react';
import { Award, Printer, Download, CreditCard, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Trainee } from '../types';

interface CertTabProps {
  trainee: Trainee;
}

export default function CertTab({ trainee }: CertTabProps) {
  
  const isCompleted = trainee.status === 'Completed';

  const handlePrint = () => {
    window.print();
  };

  // Generate a mock unique certificate serial registration number based on ID and branch
  const certRegNumber = `GAIL/VJP/TRG/2026/${trainee.id.substring(3)}-${trainee.branch.substring(0, 3).toUpperCase()}`;

  return (
    <div className="space-y-6">
      
      {/* Alert Header if not completed */}
      {!isCompleted ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3.5 max-w-4xl">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-1">
            <h4 className="font-bold">Completion Certificate Awaiting Administrative Clearance</h4>
            <p>
              Your status is currently set to <span className="font-semibold">"{trainee.status}"</span>. Internship completion certificates are automatically minted once your status transitions to <span className="font-semibold">"Completed"</span> and college evaluations/weekly logs are approved by the HRD training desk.
            </p>
            <p className="pt-1.5 font-medium">To test this layout, use the "Quick Switch View" in top header, then alter your status to "Completed" inside the Trainees tab.</p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-250 rounded-xl p-4 flex items-center justify-between max-w-4xl">
          <div className="flex gap-2 text-emerald-800 text-xs items-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">Congratulations! Your certificate is minted and verified for recruitment pipelines.</span>
          </div>
          <button
            onClick={handlePrint}
            className="text-[11px] font-bold bg-slate-900 text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Print Certificate
          </button>
        </div>
      )}

      {/* Corporate Certificate visual box */}
      <div className="border border-slate-200 bg-slate-50 p-4 sm:p-10 rounded-2xl flex justify-center overflow-x-auto max-w-4xl shadow-inner select-all">
        
        {/* Printable Section styled meticulously */}
        <div 
          id="gail-internship-certificate"
          className="certificate-print-sheet w-[800px] aspect-[1.414/1] bg-white border-[16px] border-double border-blue-900 p-12 shrink-0 relative flex flex-col justify-between text-center select-none shadow-lg text-slate-800 font-serif"
          style={{ backgroundImage: 'radial-gradient(#1e3a8a04 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        >
          {/* Border watermark emblem corner patterns */}
          <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-amber-500/30 pointer-events-none"></div>

          {/* Upper Corporate header GAIL */}
          <div className="space-y-2 border-b-2 border-slate-100 pb-4">
            <div className="flex justify-center items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-yellow-400" />
              </div>
              <h1 className="text-xl font-bold tracking-widest text-blue-950 uppercase font-sans">
                GAIL (India) Limited
              </h1>
            </div>
            <p className="text-[10px] font-sans tracking-widest text-slate-500 uppercase font-mono">
              Vijaypur Petrochemical, Gas Compressor & LPG Plant, Guna (M.P.)
            </p>
          </div>

          {/* Cert Title block */}
          <div className="my-2 space-y-1">
            <p className="text-yellow-600 tracking-widest uppercase font-mono text-[10px] font-bold">
              Human Resource Development Department
            </p>
            <h2 className="text-2xl font-bold text-blue-950 font-sans tracking-wide">
              CERTIFICATE OF INTERNSHIP
            </h2>
            <span className="text-[11px] text-slate-400 font-sans">REGISTRATION NO: {certRegNumber}</span>
          </div>

          {/* Certificate Main Text */}
          <div className="text-sm leading-relaxed max-w-2xl mx-auto space-y-4 px-4">
            <p className="font-sans text-[13px] text-slate-500 italic">
              This is to certify that the administrative training audits and academic credentials confirm that
            </p>
            
            <p className="font-sans font-bold text-lg text-blue-900 border-b border-dashed border-blue-900 inline-block px-10 py-1 tracking-wide">
              {trainee.fullName}
            </p>

            <p className="font-sans text-[13px] text-slate-500 italic leading-loose">
              student of <span className="font-bold text-slate-800 not-italic">{trainee.collegeName}</span>, affiliated with <span className="font-semibold text-slate-800 not-italic">{trainee.university}</span>, 
              has successfully undergone Industrial Internship / Internship Training in <span className="font-bold text-slate-800 not-italic">{trainee.branch}</span> division.
            </p>

            <p className="font-sans text-[13px] text-slate-500 italic">
              The program was held under <span className="font-bold text-slate-800 not-italic">{trainee.department}</span> department at GAIL Vijaypur Operations Complex 
              from <span className="font-semibold text-slate-800 not-italic font-mono">{trainee.startDate}</span> to <span className="font-semibold text-slate-800 not-italic font-mono">{trainee.endDate}</span>.
            </p>

            <p className="font-sans text-[13px] text-slate-600 font-semibold pt-1">
              During the tenure, performance of the candidate was evaluated as outstanding with Rating Grade: <span className="font-mono text-yellow-600 font-bold bg-amber-50 px-2 py-0.5 rounded text-sm border border-amber-200">
                {trainee.grade || 'A+'}
              </span>
            </p>
          </div>

          {/* Signatures & Stamps block */}
          <div className="flex justify-between items-end border-t border-slate-100 pt-6 mt-2 font-sans">
            
            {/* Left Sign */}
            <div className="text-left w-48 space-y-1">
              <div className="h-10 flex items-end justify-start">
                <span className="font-serif italic text-xs text-blue-800 font-bold tracking-wider opacity-60">Sanjay Dixit</span>
              </div>
              <div className="border-t border-slate-300 pt-1">
                <p className="font-bold text-[10px] text-slate-900 leading-3">Sanjay Dixit</p>
                <span className="text-[8px] text-slate-500 block uppercase">Chief Manager (Mechanical/HRD)</span>
                <span className="text-[7px] text-slate-400 block font-mono">ID: GAIL-VJP-1194</span>
              </div>
            </div>

            {/* Middle Stamp */}
            <div className="relative w-28 h-20 flex items-center justify-center">
              {/* Gold embossed visual stamp */}
              <div className="w-16 h-16 rounded-full border border-amber-600/30 bg-amber-50/10 flex flex-col items-center justify-center text-amber-700/60 font-black text-[7px] select-none border-dashed transform -rotate-12 z-0">
                <span className="uppercase tracking-widest font-mono">GAIL</span>
                <span className="font-mono font-bold text-[6px]">VIJAYPUR</span>
                <span className="uppercase tracking-wide font-mono">HR SEAL</span>
              </div>
            </div>

            {/* Right Sign */}
            <div className="text-right w-48 space-y-1">
              <div className="h-10 flex items-end justify-end">
                <span className="font-serif italic text-xs text-blue-800 font-bold tracking-wider opacity-60">V. Agrawal</span>
              </div>
              <div className="border-t border-slate-300 pt-1">
                <p className="font-bold text-[10px] text-slate-900 leading-3">Vipin Agrawal</p>
                <span className="text-[8px] text-slate-500 block uppercase">DGM (Electrical & Training Head)</span>
                <span className="text-[7px] text-slate-400 block font-mono">ID: GAIL-VJP-0854</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
