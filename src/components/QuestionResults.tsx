import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import axios from 'axios';

interface SimilarityExplanation {
  type?: string;
  words?: string[];
  count?: number;
  text?: string;
}

interface QuestionResult {
  question: string;
  isDuplicate: boolean;
  mostSimilarQuestion: string | null;
  similarityScore: number | null;
  similarityExplanation?: (SimilarityExplanation | string)[];
  semanticAnalysis?: string;
  rowData?: Record<string, any>;
  originalIndex?: number;
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
  onResetSuccess?: () => void;
}

const QuestionResults: React.FC<QuestionResultsProps> = ({ 
  results, 
  cleanedFileName,
  stats,
  onResetSuccess
}) => {
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [resetStatus, setResetStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
  }>({ loading: false, error: null, success: false });

  // Add original indices to results (1-based)
  const indexedResults = results.map((result, index) => ({
    ...result,
    originalIndex: index + 1,
  }));

  // Create a map of duplicate relationships for reference
  const duplicateMap = new Map<number, { index: number, question: string }>();
  indexedResults.forEach((result) => {
    if (result.isDuplicate && result.mostSimilarQuestion) {
      const original = indexedResults.find(
        (q) => q.question === result.mostSimilarQuestion && !q.isDuplicate
      );
      if (original) {
        duplicateMap.set(result.originalIndex!, {
          index: original.originalIndex!,
          question: original.question
        });
      }
    }
  });

  const renderSimilarityExplanation = (explanation: (SimilarityExplanation | string)[] = []) => {
    return explanation.map((item, idx) => {
      if (typeof item === 'string') {
        return (
          <div key={idx} className="mt-1 text-xs text-gray-600">
            <span className="font-medium">Reason:</span> {item}
          </div>
        );
      } else {
        switch (item.type) {
          case "common_words":
            return (
              <div key={idx} className="mt-1 text-xs text-gray-600">
                <span className="font-medium">Common words:</span> {item.words?.join(', ')} 
                {item.count && item.count > 3 && ` (${item.count} words in common)`}
              </div>
            );
          case "similar_start":
            return (
              <div key={idx} className="mt-1 text-xs text-gray-600">
                <span className="font-medium">Same beginning:</span> "{item.text}..."
              </div>
            );
          case "similar_end":
            return (
              <div key={idx} className="mt-1 text-xs text-gray-600">
                <span className="font-medium">Same ending:</span> "...{item.text}"
              </div>
            );
          case "same_question_structure":
            return (
              <div key={idx} className="mt-1 text-xs text-gray-600">
                Both questions follow the same question structure
              </div>
            );
          default:
            return null;
        }
      }
    });
  };

  const highlightCommonWords = (text: string, commonWords: string[] = []) => {
    if (!commonWords || commonWords.length === 0) return text;
    
    return text.split(/(\s+)/).map((word, i) => (
      <span 
        key={i} 
        className={commonWords.includes(word.toLowerCase().replace(/[^\w]/g, '')) ? 
          "bg-yellow-100 px-1 rounded" : ""}
      >
        {word}
      </span>
    ));
  };

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

  const handleResetQuestions = async () => {
    try {
      setResetStatus({ loading: true, error: null, success: false });
      
      const response = await axios.post('http://localhost:3000/reset-questions');
      
      if (response.data.success) {
        setResetStatus({ loading: false, error: null, success: true });
        
        if (onResetSuccess) {
          onResetSuccess();
        }
        
        setTimeout(() => {
          setResetStatus(prev => ({ ...prev, success: false }));
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Failed to reset questions');
      }
    } catch (err) {
      setResetStatus({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to reset questions',
        success: false
      });
      console.error('Reset failed:', err);
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
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

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleResetQuestions}
          disabled={resetStatus.loading}
          className={`flex items-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
            resetStatus.loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 focus:ring-red-400 text-white'
          }`}
          aria-label="Reset questions database"
        >
          <Trash2 className="mr-2" size={16} />
          {resetStatus.loading ? 'Resetting...' : 'Reset Questions DB'}
        </motion.button>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {resetStatus.success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm"
            role="alert"
          >
            Questions database has been reset successfully
          </motion.div>
        )}

        {resetStatus.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm"
            role="alert"
          >
            {resetStatus.error}
          </motion.div>
        )}

        {downloadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm"
            role="alert"
          >
            {downloadError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Questions with Similarity Analysis */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            Question Analysis ({indexedResults.length})
          </h3>
        </div>

        {indexedResults.length === 0 ? (
          <p className="text-gray-500 text-sm py-2">No questions analyzed.</p>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Most Similar Question
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Similarity Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Analysis
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {indexedResults.map((result) => {
                  const commonWords = result.similarityExplanation
                    ?.filter((e): e is SimilarityExplanation => typeof e !== 'string' && e.type === "common_words")
                    .flatMap(e => e.words || []) || [];
                  const duplicateInfo = duplicateMap.get(result.originalIndex!);

                  return (
                    <tr key={result.originalIndex} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.originalIndex}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {highlightCommonWords(result.question, commonWords)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={result.isDuplicate ? "text-red-600" : "text-green-600"}>
                          {result.isDuplicate ? "Duplicate" : "Unique"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {duplicateInfo ? (
                          <span>
                            Question #{duplicateInfo.index}: {highlightCommonWords(duplicateInfo.question, commonWords)}
                          </span>
                        ) : result.mostSimilarQuestion ? (
                          highlightCommonWords(result.mostSimilarQuestion, commonWords)
                        ) : (
                          "None"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.similarityScore !== null && result.similarityScore !== undefined
                          ? `${(result.similarityScore * 100).toFixed(2)}%`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {result.similarityExplanation && result.similarityExplanation.length > 0 && (
                          <div className="mb-2">
                            <div className="font-medium text-gray-700">Reasons:</div>
                            {renderSimilarityExplanation(result.similarityExplanation)}
                          </div>
                        )}
                        {result.semanticAnalysis && (
                          <div>
                            <div className="font-medium text-gray-700">Detailed Analysis:</div>
                            <div className="text-gray-600">{result.semanticAnalysis}</div>
                          </div>
                        )}
                        {!result.similarityExplanation?.length && !result.semanticAnalysis && (
                          <div className="text-gray-600">
                            {result.isDuplicate ? "Similar to another question." : "No significant similarity detected."}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QuestionResults;