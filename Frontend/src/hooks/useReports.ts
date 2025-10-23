import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useReports(patientId: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ["reports", patientId, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      
      const response = await api.get(`/reports/patient/${patientId}?${params}`);
      return response.data;
    },
    enabled: !!patientId
  });
}