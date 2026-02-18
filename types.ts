
export interface PropertyReport {
  address: string;
  postcode: string;
  broadband: {
    providers: string[];
    maxSpeed: string;
    uploadSpeed: string;
    latency: string;
    fiberAvailable: boolean;
    description: string;
  };
  shops: {
    name: string;
    type: string;
    distance: string;
  }[];
  schools: {
    name: string;
    type: string;
    ofstedRating: string;
    distance: string;
  }[];
  crime: {
    level: string;
    recentStats: string;
    commonTypes: string[];
  };
  transport: {
    name: string;
    type: string;
    distance: string;
  }[];
  healthcare: {
    name: string;
    type: string;
    distance: string;
  }[];
  gyms: {
    name: string;
    type: string;
    distance: string;
  }[];
  floodRisk: {
    riskLevel: string; // e.g., "Very Low", "Low", "Medium", "High"
    details: string;
  };
  summary: string;
  deepAnalysis?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  REPORT = 'REPORT',
  COMPARING = 'COMPARING',
  ERROR = 'ERROR'
}
