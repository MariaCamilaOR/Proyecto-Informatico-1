import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

/** --------- funciones directas --------- */
export async function listMyAlerts() {
  try {
    const { data } = await api.get("/notifications");
    if (Array.isArray(data)) return data;
  } catch {}
  // Fallback si el backend expone /notifications/inbox
  const { data } = await api.get("/notifications/inbox");
  return data;
}

export async function markAlertRead(id) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
}

export async function createAlert(payload) {
  const { data } = await api.post("/notifications", payload);
  return data;
}

/** --------- hooks compatibles (lo que pide Settings.js) --------- */
export function useInboxNotifications(patientId) {
  // patientId es opcional; la inbox se deduce por el token del usuario
  return useQuery({
    queryKey: ["inbox-notifications", patientId ?? "me"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/notifications");
        if (Array.isArray(data)) return data;
      } catch {}
      const { data } = await api.get("/notifications/inbox");
      return data;
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => markAlertRead(id),
    onSuccess: () => {
      // refresca bandeja
      qc.invalidateQueries({ queryKey: ["inbox-notifications"] });
    },
  });
}
