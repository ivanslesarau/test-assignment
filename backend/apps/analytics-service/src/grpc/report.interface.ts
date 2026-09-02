import { Observable } from 'rxjs';

export interface DataPoint {
  timestamp: number;
  value: number;
}

export interface TimeSeriesData {
  metricName: string;
  points: DataPoint[];
}

export interface ReportRequest {
  title: string;
  dateRangeLabel: string;
  metrics: TimeSeriesData[];
}

export interface ReportResponse {
  pdfContent: Uint8Array;
  errorMessage?: string;
}

export interface ReportGeneratorClient {
  generatePdfReport(request: ReportRequest): Observable<ReportResponse>;
}
