export interface Story {
  id: string;
  title: string;
  imageUrl: string | null;
  createdAt: string;
  scenes?: Scene[];
}

export interface Scene {
  id: string;
  stepNumber: number;
  narration: string;
  imageUrl: string | null;
} 