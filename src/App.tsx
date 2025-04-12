import { useState } from 'react';
import QuestionForm from './components/QuestionForm';
import QuestionResults from './components/QuestionResults';
import { QuestionResult } from './types';

function App() {
  const [results, setResults] = useState<QuestionResult[]>([]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Question Checker
      </h1>
      <QuestionForm onSubmit={(results) => setResults(results)} />
      <QuestionResults results={results} />
    </div>
  );
}

export default App;