export enum SentimentType {
  POSITIVE = 'Positive',
  NEGATIVE = 'Negative',
  NEUTRAL = 'Neutral',
  INSIGHTFUL = 'Insightful',
  URGENT = 'Urgent', // Churn risk or severe bug
}

export interface RawSurveyRow {
  id: string | number;
  comment: string;
  [key: string]: any;
}

export interface WordFrequency {
  word: string;
  count: number;
  sentiment: 'positive' | 'negative';
}

export interface ActionItem {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  department: 'Product' | 'Sales' | 'Support' | 'Marketing';
}

export interface Opportunity {
  title: string;
  description: string;
  potentialRevenueImpact: 'High' | 'Medium' | 'Low';
}

export interface AnalysisResult {
  sentimentCounts: Record<SentimentType, number>;
  totalAnalyzed: number;
  wordCloud: WordFrequency[];
  actionItems: ActionItem[];
  opportunities: Opportunity[];
  keyCorrelations: string[]; // e.g. "Long wait times correlated with Negative sentiment"
  marketingHooks: string[]; // Generated ad copy based on positive feedback
  processedRows: {
    original: string;
    sentiment: SentimentType;
    category: string;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  password?: string; // Simulating auth
  lastLogin?: string;
}

export interface AppState {
  user: User | null;
  hasKey: boolean;
  isAnalyzing: boolean;
  data: AnalysisResult | null;
  fileName: string | null;
  error: string | null;
  currentView: 'workspace' | 'admin';
}