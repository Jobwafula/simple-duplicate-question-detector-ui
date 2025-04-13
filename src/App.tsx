import { useState } from 'react';
import QuestionForm from './components/QuestionForm';
import QuestionResults from './components/QuestionResults';
import { QuestionResult } from './types';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';

function App() {
  const [results, setResults] = useState<QuestionResult[]>([]);

  return (
    <>
      <Navbar />
      <section className="relative min-h-screen bg-gradient-to-b from-white to-indigo-50 flex items-center justify-center py-20 sm:py-24 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
            <span className="text-[10rem] sm:text-[12rem] md:text-[16rem] font-black text-indigo-500 opacity-30 tracking-[0.25em] select-none pl-6 sm:pl-8 md:pl-12">
              TRY
            </span>
          </div>
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-row items-start w-full max-w-7xl mx-auto px-6 sm:px-8 md:px-12 gap-8 sm:gap-12">
          {/* Spacer for "TRY" */}
          <div className="w-1/4 flex-shrink-0 hidden lg:block"></div>
          {/* Content Area */}
          <div className="flex-1 flex flex-col gap-8 max-w-2xl">
            <header className="flex flex-col gap-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                Question Similarity Checker
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-md">
                Upload a file or enter questions to find and filter similarities.
              </p>
            </header>
            <QuestionForm onSubmit={(results) => setResults(results)} />
            <QuestionResults results={results} />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default App;