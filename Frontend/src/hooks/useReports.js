import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export function useReports(patientId, from, to) {
  return useQuery({
    queryKey: ["reports", patientId, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      const { data } = await api.get(`/reports/patient/${patientId}?${params}`);
      return data;
    },
    enabled: !!patientId,
  });
}

/** NUEVO: hook usado por SimpleReport.js */
export function useReportSummary(patientId, period = "30d") {
  return useQuery({
    queryKey: ["report-summary", patientId, period],
    queryFn: async () => {
      const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
      const { data } = await api.get(`/reports/summary/${patientId}?days=${days}`);
      return data;
    },
    enabled: !!patientId,
  });
}

export async function getReportSummary(patientId, days = 30) {
  const { data } = await api.get(`/reports/summary/${patientId}?days=${days}`);
  return data;
}

export async function createReport(payload) {
  const { data } = await api.post("/reports", payload);
  return data;
}

export async function attachQuizToReport(reportId, result) {
  const { data } = await api.patch(`/reports/${reportId}/attach-quiz`, result);
  return data;
}
