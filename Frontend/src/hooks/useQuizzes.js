import { api } from "../lib/api";


export const useQuizzes = () => {
  /**
   * Generar quiz con base en descripciones del paciente.
    @param {{ patientId: string, descriptionIds?: string[], limitPerDesc?: number }} args
   */
  const generateQuiz = async ({ patientId, descriptionIds = [], limitPerDesc = 3 }) => {
    const { data } = await api.post("/quizzes/generate", { patientId, descriptionIds, limitPerDesc });
    return data; // { id, patientId, items, status, createdAt, ... }
  };

  /**
   * Obtener un quiz por ID (para que el paciente lo resuelva).
   * @param {string} quizId
   */
  const getQuiz = async (quizId) => {
    const { data } = await api.get(`/quizzes/${quizId}`);
    return data; // { id, patientId, items, status, ... }
  };

  /**
   * Enviar respuestas del quiz.
   * IMPORTANTE: si pasas reportId, el backend adjunta el resultado a ese reporte;
   * si NO lo pasas, adjunta al último reporte del paciente o crea uno si no existe.
   *
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

  /**
   * Listar quizzes de un paciente (para su histórico / resultados).
   * @param {string} patientId
   */
  const listByPatient = async (patientId) => {
    const { data } = await api.get(`/quizzes/patient/${patientId}`);
    return data; // Quiz[]
  };

 
  const attachQuizToReport = async () => {
    throw new Error("attachQuizToReport ya no es necesario: usa submitQuiz(quizId, answers, reportId)");
  };

  return { generateQuiz, getQuiz, submitQuiz, listByPatient, attachQuizToReport };
};
