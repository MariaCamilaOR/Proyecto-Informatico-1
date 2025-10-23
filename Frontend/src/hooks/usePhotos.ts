import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function usePhotos(patientId: string) {
  return useQuery({
    queryKey: ["photos", patientId],
    queryFn: async () => {
      const response = await api.get(`/photos/patient/${patientId}`);
      return response.data;
    },
    enabled: !!patientId
  });
}