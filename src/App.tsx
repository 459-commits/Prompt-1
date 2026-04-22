import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Receipt, FileText, Info, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import FileUploader from './components/FileUploader';
import TransactionTable from './components/TransactionTable';
import SummaryDashboard from './components/SummaryDashboard';
import { Transaction, extractTransactions } from './services/geminiService';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [status, setStatus] = useState<string>('');
  const [filesToProcess, setFilesToProcess] = useState<File[]>([]);

  const [processedCount, setProcessedCount] = useState(0);
  const [currentFileName, setCurrentFileName] = useState<string>('');

  const handleFilesSelect = (files: File[]) => {
    setFilesToProcess(files);
    setTransactions(null);
    setError(null);
    setProcessedCount(0);
  };

  const startAnalysis = async () => {
    if (filesToProcess.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    setTransactions(null);
    setProcessedCount(0);
    
    const allTransactions: Transaction[] = [];

    try {
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        setCurrentFileName(file.name);
        setStatus(`Analyzing ${file.name}...`);
        
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        
        const fileData = await base64Promise;
        const results = await extractTransactions(fileData, file.type);
        allTransactions.push(...results);
        setProcessedCount(i + 1);
      }
      
      setTransactions(allTransactions);
      setStatus('Analysis complete');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to extract transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Subtle background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-50/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-rose-50/50 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
          >
            <Receipt size={12} strokeWidth={3} />
            AI-Powered Scanner
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[0.9] mb-6"
          >
            StmtScan <span className="text-indigo-600">OCR</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed font-light"
          >
            Upload multiple bank statements and let intelligence do the sorting. 
            Turn batches of PDFs into consolidated, structured data in seconds.
          </motion.p>
        </header>

        <section className="relative">
          {!transactions && <FileUploader onFilesSelect={handleFilesSelect} isLoading={isLoading} />}
          
          {filesToProcess.length > 0 && !transactions && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mt-6"
            >
              <button
                onClick={startAnalysis}
                className="group relative px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Analyze {filesToProcess.length} {filesToProcess.length === 1 ? 'Statement' : 'Statements'}
              </button>
            </motion.div>
          )}

          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col p-10 bg-white border border-slate-200 rounded-[32px] shadow-2xl mt-8 max-w-2xl mx-auto"
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">Processing Batch</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Extraction in progress</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold font-mono">
                    <Loader2 className="animate-spin" size={14} />
                    {Math.round((processedCount / filesToProcess.length) * 100)}%
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Files</p>
                    <p className="text-2xl font-black text-slate-900">{filesToProcess.length}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                    <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-wider mb-1">Completed</p>
                    <p className="text-2xl font-black text-emerald-600">{processedCount}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                    <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-wider mb-1">Pending</p>
                    <p className="text-2xl font-black text-amber-600">{filesToProcess.length - processedCount}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-sm font-semibold text-slate-700 truncate max-w-[70%]">
                        {currentFileName}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest animate-pulse">
                        Analyzing...
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                      <motion.div
                        className="h-full bg-indigo-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(processedCount / filesToProcess.length) * 100}%` }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-xs text-slate-500 font-light italic leading-relaxed text-center">
                      "{status}"
                    </p>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
                   {[1, 2, 3].map(i => (
                     <motion.div
                       key={i}
                       animate={{ 
                         opacity: [0.3, 1, 0.3],
                         scale: [1, 1.2, 1]
                       }}
                       transition={{ 
                         duration: 2, 
                         repeat: Infinity,
                         delay: i * 0.3
                       }}
                       className="w-1 h-1 rounded-full bg-indigo-300"
                     />
                   ))}
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-start gap-3 max-w-2xl mx-auto shadow-sm"
              >
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-bold text-sm">Processing Error</p>
                  <p className="text-sm font-light leading-snug">{error}</p>
                </div>
              </motion.div>
            )}

            {transactions && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12"
              >
                <div className="flex items-center gap-3 mb-6 px-2">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-none">Extraction Successful</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mt-1">Verified with Gemini 2.0 Vision</p>
                  </div>
                </div>
                <SummaryDashboard transactions={transactions} />
                <TransactionTable transactions={transactions} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <footer className="mt-24 pt-12 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-slate-400 text-xs font-light uppercase tracking-widest">
            &copy; 2026 StmtScan OCR • Secure Client-Side Analysis
          </div>
          <div className="flex justify-start md:justify-end gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-indigo-400" />
              Privacy-First Analysis
            </div>
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-indigo-400" />
              CSV Export Ready
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

