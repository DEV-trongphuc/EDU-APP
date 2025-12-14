import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCertificateById } from '../services/dataService';
import { Certificate as CertType } from '../types';
import { FaLinkedin, FaDownload, FaLink, FaCheckCircle, FaAward, FaUniversity } from 'react-icons/fa';

const Certificate: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const [certData, setCertData] = useState<CertType | undefined>(undefined);

  useEffect(() => {
      if(id) {
          const c = getCertificateById(id);
          setCertData(c);
      }
  }, [id]);

  const handleDownload = () => {
      window.print();
  };

  const handleShare = () => {
      if(id) {
          // Construct the full verify URL
          const url = `${window.location.origin}${window.location.pathname}#/verify/${id}`;
          navigator.clipboard.writeText(url);
          alert(`Link copied to clipboard!\n${url}`);
      }
  };

  if (!certData) return <div className="min-h-screen flex items-center justify-center text-gray-500">Certificate not found or invalid ID.</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 animate-fade-in print:bg-white print:p-0">
      <div className="max-w-4xl w-full space-y-8 print:space-y-0">
        {/* Verification Status */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between print:hidden">
           <div className="flex items-center gap-3">
               <div className="bg-green-100 p-2 rounded-full">
                   <FaCheckCircle className="text-green-600 text-xl" />
               </div>
               <div>
                   <h3 className="font-bold text-gray-900">Credential Verified</h3>
                   <p className="text-sm text-gray-500">Certificate ID: <span className="font-mono bg-gray-100 px-1 rounded">{certData.id}</span></p>
               </div>
           </div>
           <button onClick={handleDownload} className="hidden sm:flex bg-primary-600 text-white px-4 py-2 rounded-lg font-bold text-sm items-center gap-2 hover:bg-primary-700 transition-colors">
               <FaDownload /> Download PDF
           </button>
        </div>

        {/* Certificate Visual */}
        <div className="bg-white text-gray-900 p-10 md:p-16 rounded-2xl shadow-2xl border-8 border-double border-gray-200 relative overflow-hidden text-center print:shadow-none print:border-none print:w-full print:h-screen print:flex print:flex-col print:justify-center">
             <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-primary-600 to-secondary-600 print:hidden"></div>
             
             {/* Background Watermark */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                 <FaAward size={400} />
             </div>

             <div className="relative z-10 space-y-6">
                 <div className="mb-8">
                     <div className="flex items-center justify-center gap-2 text-primary-700 mb-2">
                         <FaUniversity size={30} />
                         <span className="text-2xl font-bold tracking-widest">EDUPRO ACADEMY</span>
                     </div>
                     <div className="h-0.5 w-24 bg-primary-600 mx-auto"></div>
                 </div>

                 <h1 className="text-4xl md:text-5xl font-serif text-gray-800">Certificate of Completion</h1>
                 <p className="text-gray-500 text-lg uppercase tracking-wide">This is to certify that</p>
                 
                 <h2 className="text-3xl md:text-5xl font-bold text-primary-700 font-serif italic py-4">{certData.studentName}</h2>
                 
                 <p className="text-gray-500 text-lg">has successfully completed the course</p>
                 <h3 className="text-2xl font-bold text-gray-800">{certData.courseName}</h3>
                 
                 <p className="text-gray-600">
                    Achieving a final score of <strong>{certData.score.toFixed(0)}%</strong>.
                 </p>

                 <div className="grid grid-cols-2 gap-10 mt-12 max-w-xl mx-auto">
                     <div className="text-center">
                         <div className="border-b border-gray-400 pb-2 mb-2 font-dancing-script text-2xl text-gray-800">
                             {certData.issueDate}
                         </div>
                         <p className="text-xs uppercase text-gray-500 tracking-wider">Date Issued</p>
                     </div>
                     <div className="text-center">
                          <div className="h-10 mx-auto mb-2 text-2xl font-dancing-script text-gray-600 italic">EduPro Team</div>
                         <div className="border-b border-gray-400 pb-2 mb-2"></div>
                         <p className="text-xs uppercase text-gray-500 tracking-wider">{certData.instructorName}</p>
                     </div>
                 </div>
             </div>
        </div>

        {/* Share Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 print:hidden">
            <button className="flex items-center justify-center gap-2 bg-[#0077b5] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#006097] transition-colors shadow-lg">
                <FaLinkedin size={20} /> Add to LinkedIn Profile
            </button>
            <button onClick={handleShare} className="flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors shadow-lg">
                <FaLink size={20} /> Copy Link
            </button>
        </div>
      </div>
    </div>
  );
};

export default Certificate;