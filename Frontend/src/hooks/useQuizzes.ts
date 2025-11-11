import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface QuizItem {
  id: string;
  type: 'yn' | 'mc';
  prompt: string;
  options?: string[];
  correctIndex?: number;
}

export interface Quiz {
  id: string;
  patientId: string;
  status: 'open' | 'completed';
  items: QuizItem[];
  createdAt?: Date;
  submittedAt?: Date;
  score?: number;
  classification?: string;
}

export interface QuizGenerateParams {
  patientId: string;
  photoId?: string;
  descriptionIds?: string[];
  limitPerDesc?: number;
}

export interface QuizAnswer {
  itemId: string;
  answerIndex?: number;
  yn?: boolean;
}

export const useQuizzes = () => {
  const generateQuiz = async ({
    patientId,
    photoId,
    descriptionIds = [],
    limitPerDesc = 5
  }: QuizGenerateParams): Promise<Quiz> => {
    const { data } = await api.post('/quizzes/generate', {
      patientId,
      photoId,
      descriptionIds,
      limitPerDesc
    });
    return data as Quiz;
  };

  const getQuiz = async (quizId: string): Promise<Quiz> => {
    const { data } = await api.get(`/quizzes/${quizId}`);
    return data as Quiz;
  };

  const submitQuiz = async (quizId: string, answers: QuizAnswer[], reportId?: string) => {
    const payload = { answers, ...(reportId && { reportId }) };
    const { data } = await api.post(`/quizzes/${quizId}/submit`, payload);
    return data;
  };

  const getPatientQuizzes = async (patientId: string) => {
    const { data } = await api.get(`/quizzes/patient/${patientId}`);
    return data as Quiz[];
  };

  return {
    generateQuiz,
    getQuiz,
    submitQuiz,
    getPatientQuizzes,
    useQuizQuery: (quizId: string) => 
      useQuery({
        queryKey: ['quiz', quizId],
        queryFn: () => getQuiz(quizId)
      }),
    usePatientQuizzesQuery: (patientId: string) =>
      useQuery({
        queryKey: ['patientQuizzes', patientId],
        queryFn: () => getPatientQuizzes(patientId)
      }),
    useQuizGeneration: () => 
      useMutation({
        mutationFn: (params: QuizGenerateParams) => generateQuiz(params)
      }),
    useQuizSubmission: () =>
      useMutation({
        mutationFn: ({ quizId, answers, reportId }: { 
          quizId: string; 
          answers: QuizAnswer[]; 
          reportId?: string 
        }) => submitQuiz(quizId, answers, reportId)
      })
  };
};