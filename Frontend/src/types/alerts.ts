export type AlertPolicy = {
  id: string;
  patientId: string;
  metric: string;
  threshold: number;
  frequency: "immediate" | "daily" | "weekly";
};