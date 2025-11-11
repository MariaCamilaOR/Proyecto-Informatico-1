import { api } from "../api";

export const useQuizzes = () => {
  /**
   * Generar quiz.
   * @param {{ patientId: string, photoId?: string, descriptionIds?: string[], limitPerDesc?: number }} args
   */
  const generateQuiz = async ({ patientId, photoId, descriptionIds = [], limitPerDesc = 5 }) => {
    // el backend prioriza photoId; descriptionIds queda para compatibilidad
    const payload = { patientId, photoId, descriptionIds, limitPerDesc };
    const { data } = await api.post("/quizzes/generate", payload);
    return data;
  };

  /** Obtener quiz por id */
  const getQuiz = async (quizId) => {
    const { data } = await api.get(`/quizzes/${quizId}`);
    return data;
  };

  /**
   * Enviar respuestas.
   * @param {string} quizId
   * @param {Array<{ itemId: string, answerIndex?: number, yn?: boolean }>} answers
   * @param {string=} reportId
   */
  const submitQuiz = async (quizId, answers, reportId) => {
    const payload = { answers };
    if (reportId) payload.reportId = reportId;
    const { data } = await api.post(`/quizzes/${quizId}/submit`, payload);
    return data;
  };

  /** Historial del paciente */
  const listByPatient = async (patientId) => {
    const { data } = await api.get(`/quizzes/patient/${patientId}`);
    return data;
  };

  const attachQuizToReport = async () => {
    throw new Error("attachQuizToReport ya no es necesario: usa submitQuiz(quizId, answers, reportId)");
  };

  return { generateQuiz, getQuiz, submitQuiz, listByPatient, attachQuizToReport };
};
