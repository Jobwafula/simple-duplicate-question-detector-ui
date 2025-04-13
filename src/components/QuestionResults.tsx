import { useState } from 'react';
import { QuestionResult } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, AlertTriangle, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface QuestionResultsProps {
  results: QuestionResult[];
}

const QuestionResults: React.FC<QuestionResultsProps> = ({ results }) => {
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx' | 'txt'>('pdf');
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Filter unique and similar questions
  const uniqueQuestions = results.filter((result) => !result.isDuplicate);
  const similarQuestions = results.filter((result) => result.isDuplicate);

  const handleDownload = async () => {
    if (uniqueQuestions.length === 0) {
      setDownloadError('No unique questions to download.');
      return;
    }

    const content = uniqueQuestions.map((q) => q.question).join('\n');
    const fileName = `unique_questions.${downloadFormat}`;

    try {
      setDownloadError(null);
      if (downloadFormat === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text('Unique Questions', 20, 20);
        let y = 30;
        uniqueQuestions.forEach((q, index) => {
          // Split long questions to fit page
          const lines = doc.splitTextToSize(`${index + 1}. ${q.question}`, 170);
          lines.forEach((line: string) => {
            doc.text(line, 20, y);
            y += 7;
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
          });
        });
        doc.save(fileName);
      } else if (downloadFormat === 'docx') {
        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Unique Questions', bold: true, size: 24 })],
                }),
                ...uniqueQuestions.map(
                  (q, index) =>
                    new Paragraph({
                      children: [new TextRun({ text: `${index + 1}. ${q.question}`, size: 20 })],
                      spacing: { after: 200 },
                    })
                ),
              ],
            },
          ],
        });
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // TXT
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setDownloadError('Failed to generate file. Please try again.');
      console.error('Download failed:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full bg-white/80 rounded-3xl shadow-2xl p-6 sm:p-8 border border-indigo-100/30 backdrop-blur-md"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 tracking-tight">
        Similarity Results
      </h2>

      {results.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No results to display.</p>
      ) : (
        <div className="space-y-8">
          {/* Similar Questions Notification */}
          {similarQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
              role="alert"
            >
              <AlertTriangle className="text-red-500 flex-shrink-0" size={24} aria-hidden="true" />
              <div>
                <h3 className="text-lg font-semibold text-red-700">
                  Similar Questions Detected
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                  {similarQuestions.map((result, index) => (
                    <li key={index}>
                      <span className="font-medium">"{result.question}"</span> is similar to "
                      {result.mostSimilarQuestion ?? 'another question'}" (
                      {result.similarityScore !== undefined
                        ? `${(result.similarityScore * 100).toFixed(2)}%`
                        : 'N/A'}{' '}
                      similarity).
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* Unique Questions */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} aria-hidden="true" />
                Unique Questions ({uniqueQuestions.length})
              </h3>
              {uniqueQuestions.length > 0 && (
                <div className="flex items-center gap-3">
                  <select
                    value={downloadFormat}
                    onChange={(e) =>
                      setDownloadFormat(e.target.value as 'pdf' | 'docx' | 'txt')
                    }
                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    aria-label="Select download format"
                  >
                    <option value="pdf">PDF</option>
                    <option value="docx">DOCX</option>
                    <option value="txt">TXT</option>
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 text-sm"
                    aria-label="Download unique questions"
                  >
                    <Download className="mr-2" size={16} aria-hidden="true" />
                    Download
                  </motion.button>
                </div>
              )}
            </div>
            {uniqueQuestions.length === 0 ? (
              <p className="text-gray-500 text-sm py-2">No unique questions found.</p>
            ) : (
              <ul className="space-y-3">
                {uniqueQuestions.map((result, index) => (
                  <li
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg text-gray-800 text-sm"
                  >
                    {result.question}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Download Error Notification */}
      <AnimatePresence>
        {downloadError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-red-500 text-sm font-medium"
            role="alert"
          >
            {downloadError}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuestionResults;