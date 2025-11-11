import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

/** Tipos comunes para reportes */
export type Trend = "up" | "down" | "stable";

export interface ReportSummary {
  patientId: string;
  patientName: string;
  period: string;
  baselineScore: number;
  currentScore: number;
  trend: Trend;
  sessionsCompleted: number;
  photosDescribed: number;
  averageRecall: number;
  averageCoherence: number;
  lastSession: string | number | Date;
  recommendations: string[];
  perPhoto?: {
    [photoId: string]: {
      count: number;
      sum: number;
      avg: number;
      title?: string;
      lastAttempt?: string | number | Date;
    };
  };
}

/** Lista de reportes por paciente (rango opcional) */
export function useReports(patientId?: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ["reports", patientId, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      const { data } = await api.get(`/reports/patient/${patientId}?${params}`);
      return data as any[];
    },
    enabled: !!patientId,
  });
}

/** ✅ Hook que faltaba y que usa SimpleReport.js */
export function useReportSummary(
  patientId?: string,
  period: "7d" | "30d" | "90d" = "30d"
) {
  return useQuery<ReportSummary>({
    queryKey: ["report-summary", patientId, period],
    queryFn: async () => {
      const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
      const { data } = await api.get(`/reports/summary/${patientId}?days=${days}`);
      return data as ReportSummary;
    },
    enabled: !!patientId,
  });
}

/** Fetch directo (lo usa la versión TSX de SimpleReport) */
export async function getReportSummary(
  patientId: string,
  days = 30
): Promise<ReportSummary> {
  const { data } = await api.get(`/reports/summary/${patientId}?days=${days}`);
  return data as ReportSummary;
}

/** Crear reporte */
export async function createReport(payload: {
  patientId: string;
  data: any;
  baseline?: string | null;
}) {
  const { data } = await api.post("/reports", payload);
  return data;
}

/** Adjuntar resultado de quiz a un reporte */
export async function attachQuizToReport(
  reportId: string,
  result: { quizId: string; score: number; classification: string; submittedAt?: any }
) {
  const { data } = await api.patch(`/reports/${reportId}/attach-quiz`, result);
  return data;
}
