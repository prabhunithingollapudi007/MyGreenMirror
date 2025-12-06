export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio'
}

export enum MainCategory {
  WASTE = 'Waste',
  TRANSPORT = 'Transport',
  FOOD = 'Food',
  ENERGY = 'Energy',
  LIFESTYLE = 'Lifestyle'
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DetectedItem {
  id: string;
  name: string;
  category: 'Recyclable' | 'Compostable' | 'Landfill' | 'Hazardous' | 'Reusable' | 'Other';
  carbonFootprint: number; // Estimated g CO2e
  impactDescription: string;
  suggestion: string;
  box?: BoundingBox; // Only for images
}

export interface AnalysisResult {
  summary: string;
  mainCategory: MainCategory;
  totalCarbonScore: number; // 0-100 scale (100 = high impact)
  items: DetectedItem[];
  generalTips: string[];
}

export interface LogEntry {
  id: string;
  date: string; // ISO string
  mediaType: MediaType;
  result: AnalysisResult;
  visualizationUrl?: string;
  pointsEarned: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  totalPoints: number;
  streakDays: number;
  logs: LogEntry[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarUrl: string;
  points: number;
  isCurrentUser: boolean;
  rank: number;
}