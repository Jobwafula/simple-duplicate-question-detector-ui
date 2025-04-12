import { QuestionResult } from '../types';

interface QuestionResultsProps {
  results: QuestionResult[];
}

const QuestionResults: React.FC<QuestionResultsProps> = ({ results }) => {
  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Results</h2>
      {results.length === 0 ? (
        <p className="text-gray-600">No results to display.</p>
      ) : (
        <ul className="space-y-4">
          {results.map((result, index) => (
            <li key={index} className="border-b pb-4">
              <p className="font-semibold text-gray-800">
                Question: {result.question}
              </p>
              <p className="text-gray-600">
                Status: {result.isDuplicate ? 'Duplicate' : 'Unique'}
              </p>
              {result.mostSimilarQuestion && (
                <p className="text-gray-600">
                  Most Similar: {result.mostSimilarQuestion} (Similarity:{' '}
                  {(result.similarityScore * 100).toFixed(2)}%)
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionResults;