import { useState, FormEvent, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // Add framer-motion for animations

interface QuestionFormProps {
  onSubmit: (results: any) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit }) => {
  const [questions, setQuestions] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]); // For focusing new inputs

  const handleAddQuestion = () => {
    if (questions.length < 5) {
      setQuestions([...questions, '']);
      // Focus the new input after a slight delay
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:3000/check-batch', {
        questions: questions.filter(q => q.trim() !== ''),
      });
      onSubmit(response.data.results);
      // Reset form after successful submission
      setQuestions(['']);
      inputRefs.current = [null];
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-2xl mt-8"
    >
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
        Submit Your Questions
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence>
          {questions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-3"
            >
              <div className="flex-1 relative">
                <label
                  htmlFor={`question-${index}`}
                  className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium text-gray-600"
                >
                  Question {index + 1}
                </label>
                <input
                  id={`question-${index}`}
                  type="text"
                  value={question}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  placeholder="Enter your question"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                  required
                  ref={(el) => (inputRefs.current[index] = el)}
                  aria-describedby={error && index === 0 ? 'error-message' : undefined}
                />
              </div>
              {questions.length > 1 && (
                <motion.button
                  type="button"
                  onClick={() => handleRemoveQuestion(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                  aria-label={`Remove question ${index + 1}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="flex justify-between items-center">
          {questions.length < 5 && (
            <motion.button
              type="button"
              onClick={handleAddQuestion}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
              disabled={isSubmitting}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Question
            </motion.button>
          )}
          <div className="flex-1" />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            disabled={isSubmitting || questions.every(q => q.trim() === '')}
            aria-label="Check questions"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              'Check Questions'
            )}
          </motion.button>
        </div>
      </form>
      <AnimatePresence>
        {error && (
          <motion.p
            id="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-red-600 font-medium"
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