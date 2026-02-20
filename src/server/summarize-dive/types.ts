export type DiveLocationPayload = {
  name?: string | null;
  country?: string | null;
};

export type DiverProfilePayload = {
  cert_level?: string | null;
  total_dives?: number | null;
  average_depth?: number | null;
  average_duration?: number | null;
  recent_dives_30d?: number | null;
  average_rmv?: number | null;
};

export type DivePayload = {
  id?: string | null;
  location_id?: string | null;
  location?: string | null;
  country?: string | null;
  locationName?: string | null;
  locationCountry?: string | null;
  locations?: DiveLocationPayload | null;
  date?: string | null;
  depth?: number | null;
  duration?: number | null;
  water_temp?: number | null;
  visibility?: string | null;
  dive_type?: string | null;
  water_type?: string | null;
  exposure?: string | null;
  currents?: string | null;
  weight?: number | null;
  gas?: string | null;
  nitrox_percent?: number | null;
  start_pressure?: number | null;
  end_pressure?: number | null;
  air_usage?: number | null;
  cylinder_type?: string | null;
  cylinder_size?: number | null;
  equipment?: string[] | null;
  wildlife?: string[] | null;
  notes?: string | null;
  average_depth?: number | null;
};

export type DiveContext = {
  id?: string;
  date: string;
  location: string;
  country: string | null;
  maxDepthMeters: number | null;
  averageDepthMeters: number | null;
  averageDepthSource: 'logged' | 'estimated' | 'unknown';
  durationMinutes: number | null;
  waterTempCelsius: number | null;
  visibility: string | null;
  diveType: string | null;
  waterType: string | null;
  exposure: string | null;
  currents: string | null;
  gas: string | null;
  startPressureBar: number | null;
  endPressureBar: number | null;
  gasUsedBar: number | null;
  cylinderType: string | null;
  cylinderSizeLiters: number | null;
  notes: string | null;
  equipment: string[] | null;
  wildlife: string[] | null;
};

export type DiverProfile = {
  certificationLevel: string | null;
  totalLoggedDives: number;
  avgDepth: number | null;
  avgDuration: number | null;
  recentDives30d: number;
  avgEstimatedRMV?: number | null;
};

export type DiveSignal = {
  code: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  source: 'context' | 'metrics' | 'profile';
};

export type ComputedMetrics = {
  estimatedRMV: number | null;
  rmvConfidence: 'measured' | 'estimated' | 'missing';
  averageDepthSource: 'logged' | 'estimated' | 'unknown';
  comparisons: ComparisonResult[];
  topComparison: ComparisonResult | null;
  baselineAvailability: BaselinesBundle['availability'];
};

export type ComparisonResult = {
  kind: 'depth' | 'duration' | 'rmv';
  baseline: 'location' | 'global' | 'recent';
  text: string;
  evidence: string[];
  score: number;
  delta: number;
  percent?: number | null;
};

export type BaselineCore = {
  scope: 'global' | 'location' | 'recent';
  sampleSize: number;
  avgDepth: number | null;
  avgDuration: number | null;
  avgRMV: number | null;
  lastDiveDate?: string | null;
  windowDays?: number | null;
  locationKey?: string | null;
};

export type GlobalBaseline = BaselineCore & { scope: 'global' };
export type LocationBaseline = BaselineCore & { scope: 'location'; locationKey: string };
export type RecentBaseline = BaselineCore & { scope: 'recent'; windowDays: 30 | 90 };

export type BaselinesBundle = {
  global?: GlobalBaseline | null;
  location?: LocationBaseline | null;
  recent?: RecentBaseline | null;
  availability: {
    hasGlobalBaseline: boolean;
    hasLocationBaseline: boolean;
    hasRecentBaseline: boolean;
  };
};

export type DiveInsightRecommendation = {
  action: string;
  rationale: string;
};

export type DiveInsightContent = {
  text: string;
  baseline_comparison: string;
  evidence: string[];
};

export type DiveInsightResponse = {
  recap: string;
  dive_insight: DiveInsightContent;
  recommendations: DiveInsightRecommendation[] | 'No specific recommendations.';
};

export type ParseDiveInsightResult =
  | { ok: true; data: DiveInsightResponse }
  | { ok: false; error: string; fallback: DiveInsightResponse };

export type StoredDiveInsight = {
  promptVersion: string;
  model: string;
  inputHash: string;
  generatedAt: string;
  insight: DiveInsightResponse;
  metrics: ComputedMetrics;
  signals: DiveSignal[];
  baselines: BaselinesBundle;
};

export type DiveInsightResponseMeta = {
  cached: boolean;
  model: string;
  promptVersion: string;
  generatedAt: string;
};

export type DiveInsightApiResponse = {
  insight: DiveInsightResponse;
  summary: string;
  meta: DiveInsightResponseMeta;
};

export type DiveInsightRequest = {
  dive: DivePayload;
  profile?: DiverProfilePayload;
  signals?: DiveSignal[];
  regenerate?: boolean;
};

export type BuildDiveInsightPromptInput = {
  dive: DiveContext;
  profile: DiverProfile;
  signals: DiveSignal[];
  metrics: ComputedMetrics;
  baselines: BaselinesBundle;
};
