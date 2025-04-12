export interface QuestionResult {
    question: string;
    isDuplicate: boolean;
    mostSimilarQuestion: string | null;
    similarityScore: number;
  }
  
  export interface ApiResponse {
    results: QuestionResult[];
  }
  
  export interface ApiError {
    error: string;
    details?: string;
  }