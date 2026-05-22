import { useState } from 'react';
import { Technique } from '../types';
import { getReportString, copyToClipboard, exportMarkdown, exportPDF, exportDocx } from '../utils/export';
import { ArrowLeft, Copy, FileText, Download, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  technique: Technique;
  onClose: () => void;
}

export function ReportGenerator({ technique, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const reportText = getReportString(technique);

  const handleCopy = async () => {
    const success = await copyToClipboard(technique);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div 
      className="bg-bg-base h-full flex flex-col"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center justify-between mb-6 shrink-0">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-text-dim hover:text-text-primary transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Editor (Esc)
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-bg-elevated hover:bg-border-default border border-border-default rounded text-sm transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-status-confirmed" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button 
            onClick={() => exportMarkdown(technique)}
            className="flex items-center gap-2 px-3 py-1.5 bg-bg-elevated hover:bg-border-default border border-border-default rounded text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> .md
          </button>
          <button 
            onClick={() => exportPDF(technique)}
            className="flex items-center gap-2 px-3 py-1.5 bg-bg-elevated hover:bg-border-default border border-border-default rounded text-sm transition-colors"
          >
            <FileText className="w-4 h-4 text-red-400" /> .pdf
          </button>
          <button 
            onClick={() => exportDocx(technique)}
            className="flex items-center gap-2 px-3 py-1.5 bg-bg-elevated hover:bg-border-default border border-border-default rounded text-sm transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-400" /> .docx
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex justify-center bg-bg-surface border border-border-default rounded-lg">
        <div className="w-full max-w-3xl h-full overflow-y-auto p-8 shadow-inner">
          <pre className="font-mono text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
            {reportText}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}
