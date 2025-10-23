export type Report = {
  id: string;
  patientId: string;
  from?: string;
  to?: string;
  metrics: string[];
  createdAt: string;
};