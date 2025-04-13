import { useState, FormEvent, useRef, ChangeEvent } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Plus } from 'lucide-react'; // Icons for upload/remove/add

interface QuestionFormProps {
  onSubmit: (results: any) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit }) => {
  const [questions, setQuestions] = useState<string[]>(['']);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddQuestion = () => {
    if (questions.length < 5) {
      setQuestions([...questions, '']);
      setTimeout(() => {
        inputRefs.current[questions.length]?.focus();
      }, 100);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    inputRefs.current = inputRefs.current.filter((_, i) => i !== index);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/plain' || selectedFile.type === 'text/csv') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a .txt or .csv file.');
        setFile(null);
        e.target.value = ''; // Reset input
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (file) {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post('http://localhost:3000/check-file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onSubmit(response.data.results);
        setFile(null);
        setQuestions(['']);
        inputRefs.current = [null];
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        // Handle manual questions
        const filteredQuestions = questions.filter((q) => q.trim() !== '');
        if (filteredQuestions.length === 0) {
          throw new Error('Please enter at least one question or upload a file.');
        }
        const response = await axios.post('http://localhost:3000/check-batch', {
          questions: filteredQuestions,
        });
        onSubmit(response.data.results);
        setQuestions(['']);
        inputRefs.current = [null];
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
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
        Check Question Similarity
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Manual Question Inputs */}
        <AnimatePresence>
          {questions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className="flex-1">
                <label
                  htmlFor={`question-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Question {index + 1}
                </label>
                <input
                  id={`question-${index}`}
                  type="text"
                  value={question}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  placeholder="Enter your question"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  ref={(el) => (inputRefs.current[index] = el)}
                  aria-describedby={error && index === 0 ? 'error-message' : undefined}
                  disabled={isSubmitting || !!file}
                />
              </div>
              {questions.length > 1 && (
                <motion.button
                  type="button"
                  onClick={() => handleRemoveQuestion(index)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200"
                  aria-label={`Remove question ${index + 1}`}
                  disabled={isSubmitting}
                >
                  <X size={18} />
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* File Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Or Upload a File (.txt or .csv)
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                disabled={isSubmitting}
                aria-describedby={error ? 'error-message' : undefined}
              />
              <div
                className={`flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 ${
                  file ? 'bg-indigo-50 border-indigo-200' : ''
                } hover:bg-indigo-100 transition-all duration-200`}
              >
                <Upload size={18} className="mr-2" />
                <span>{file ? file.name : 'Choose file'}</span>
              </div>
            </label>
            {file && (
              <motion.button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200"
                aria-label="Remove file"
                disabled={isSubmitting}
              >
                <X size={18} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-between items-center pt-4">
          {!file && questions.length < 5 && (
            <motion.button
              type="button"
              onClick={handleAddQuestion}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
              disabled={isSubmitting}
            >
              <Plus size={18} className="mr-2" />
              Add Question
            </motion.button>
          )}
          <div className="flex-1" />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            disabled={
              isSubmitting ||
              (!file && questions.every((q) => q.trim() === ''))
            }
            aria-label="Check similarity"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Checking...
              </span>
            ) : (
              'Check Similarity'
            )}
          </motion.button>
        </div>
      </form>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-red-500 text-sm font-medium"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuestionForm;