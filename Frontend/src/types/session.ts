export type Session = {
  id: string;
  patientId: string;
  photoId?: string;
  text?: string;
  audioPath?: string;
  metrics?: {
    recall?: number;
    coherence?: number;
  };
  status: "pending" | "done";
  createdAt: string;
};