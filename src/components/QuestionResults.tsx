import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface QuestionResult {
  question: string;
  isDuplicate: boolean;
  mostSimilarQuestion: string | null;
  similarityScore: number | null;
  rowData?: Record<string, any>;
}

interface QuestionResultsProps {
  results: QuestionResult[];
  cleanedFileName?: string;
  stats?: {
    totalQuestions: number;
    duplicatesFound: number;
    uniqueQuestions?: number;
    processingTime?: string;
  };
}

const QuestionResults: React.FC<QuestionResultsProps> = ({ 
  results, 
  cleanedFileName,
  stats 
}) => {
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const uniqueQuestions = results.filter((result) => !result.isDuplicate);
  const similarQuestions = results.filter((result) => result.isDuplicate);

  const handleDownloadCleanedFile = async () => {
    try {
      setIsDownloading(true);
      setDownloadError(null);
      
      if (!cleanedFileName) {
        throw new Error('No cleaned file available for download.');
      }

      const response = await axios.get(`http://localhost:3000/download/${cleanedFileName}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', cleanedFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
    } catch (err) {
      setDownloadError(
        err instanceof Error 
          ? err.message 
          : 'Failed to download cleaned file. Please try again.'
      );
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full bg-white/80 rounded-3xl shadow-2xl p-6 sm:p-8 border border-indigo-100/30 backdrop-blur-md"
    >
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Similarity Results
        </h2>
        
        {stats && (
          <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <div>Total: {stats.totalQuestions}</div>
            <div>Unique: {stats.uniqueQuestions || stats.totalQuestions - stats.duplicatesFound}</div>
            <div>Duplicates: {stats.duplicatesFound}</div>
            {stats.processingTime && <div>Time: {stats.processingTime}</div>}
          </div>
        )}
      </div>

      {/* Similar Questions Notification */}
      {similarQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 mb-6"
          role="alert"
        >
          <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-red-700">
              Similar Questions Detected ({similarQuestions.length})
            </h3>
            <ul className="mt-2 space-y-2 text-sm text-gray-700">
              {similarQuestions.slice(0, 3).map((result, index) => (
                <li key={index}>
                  <span className="font-medium">"{result.question}"</span> is similar to "
                  {result.mostSimilarQuestion ?? 'another question'}" (
                  {result.similarityScore !== undefined
                    ? `${(result.similarityScore * 100).toFixed(2)}%`
                    : 'N/A'}{' '}
                  similarity).
                </li>
              ))}
              {similarQuestions.length > 3 && (
                <li className="text-gray-500">
                  + {similarQuestions.length - 3} more similar questions...
                </li>
              )}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Unique Questions Section */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            Unique Questions ({uniqueQuestions.length})
          </h3>
          
          {cleanedFileName && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadCleanedFile}
              disabled={isDownloading}
              className={`flex items-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                isDownloading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-400 text-white'
              }`}
              aria-label="Download cleaned original file"
            >
              <Download className="mr-2" size={16} />
              {isDownloading ? 'Downloading...' : 'Download Cleaned File'}
            </motion.button>
          )}
        </div>

        {uniqueQuestions.length === 0 ? (
          <p className="text-gray-500 text-sm py-2">No unique questions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uniqueQuestions.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {result.question}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Download Error Notification */}
      <AnimatePresence>
        {downloadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm"
            role="alert"
          >
            {downloadError}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuestionResults;