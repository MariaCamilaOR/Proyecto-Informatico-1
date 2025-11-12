import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export type AlertType = "baseline_request" | "quiz_request" | "quiz_invite";

export async function listMyAlerts() {
  try {
    const { data } = await api.get("/notifications");
    if (Array.isArray(data)) return data;
  } catch { /* noop */ }
  const { data } = await api.get("/notifications/inbox");
  return data;
}

export async function markAlertRead(id: string) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
}

export async function createAlert(payload: {
  patientId: string;
  type: AlertType;
  message?: string;
  payload?: any;
}) {
  const { data } = await api.post("/notifications", payload);
  return data;
}

/** Hooks compatibles con Settings.js */
export function useInboxNotifications(patientId?: string) {
  return useQuery({
    queryKey: ["inbox-notifications", patientId ?? "me"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/notifications");
        if (Array.isArray(data)) return data;
      } catch { /* fallback */ }
      const { data } = await api.get("/notifications/inbox");
      return data;
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => markAlertRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbox-notifications"] });
    },
  });
}
