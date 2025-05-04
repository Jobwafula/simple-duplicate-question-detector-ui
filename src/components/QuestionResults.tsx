import { useState } from 'react';
import { QuestionResult } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, AlertTriangle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';

interface QuestionResultsProps {
  results: QuestionResult[];
  cleanedFilePath?: string;
}

const QuestionResults: React.FC<QuestionResultsProps> = ({ results, cleanedFilePath }) => {
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Filter unique and similar questions
  const uniqueQuestions = results.filter((result) => !result.isDuplicate);
  const similarQuestions = results.filter((result) => result.isDuplicate);

  const handleDownload = () => {
    if (uniqueQuestions.length === 0) {
      setDownloadError('No unique questions to download.');
      return;
    }

    const fileName = `unique_questions.xlsx`;

    try {
      setDownloadError(null);
      
      // Prepare data for Excel
      const data = uniqueQuestions.map((q, index) => ({
        '#': index + 1,
        'Question': q.question,
        ...(q.rowData && typeof q.rowData === 'object' ? q.rowData : {})
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Auto-size columns
      const colWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(
          ...data.map(row => 
            String(row[key] || '').length
          ),
          key.length
        ) + 2
      }));
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Unique Questions");
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      setDownloadError('Failed to generate Excel file. Please try again.');
      console.error('Download failed:', err);
    }
  };

  const handleDownloadCleanedFile = async () => {
    try {
      if (!cleanedFilePath) {
        setDownloadError('No cleaned file available for download.');
        return;
      }

      const response = await axios.get(`http://localhost:3000/download/${cleanedFilePath}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', cleanedFilePath);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setDownloadError('Failed to download cleaned file. Please try again.');
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
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 text-sm"
                    aria-label="Download unique questions as Excel"
                  >
                    <Download className="mr-2" size={16} aria-hidden="true" />
                    Download Results
                  </motion.button>
                  {cleanedFilePath && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownloadCleanedFile}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 text-sm"
                      aria-label="Download cleaned original file"
                    >
                      <Download className="mr-2" size={16} aria-hidden="true" />
                      Download Cleaned File
                    </motion.button>
                  )}
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