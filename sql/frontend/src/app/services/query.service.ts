import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import {
  QueryRequest,
  QueryResponse,
  ExampleQuery,
} from "../models/query-response.model";

@Injectable({
  providedIn: "root",
})
export class QueryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Send natural language query to backend
   */
  executeQuery(question: string, role?: string): Observable<QueryResponse> {
    const request: QueryRequest = {
      question,
      role,
      sessionId: this.getSessionId(),
    };

    return this.http
      .post<QueryResponse>(`${this.apiUrl}/query`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get example queries
   */
  getExamples(): Observable<ExampleQuery[]> {
    return this.http
      .get<{ success: boolean; examples: ExampleQuery[] }>(
        `${this.apiUrl}/examples`
      )
      .pipe(
        map((response) => response.examples),
        catchError(this.handleError)
      );
  }

  /**
   * Get schema information
   */
  getSchema(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/schema`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Health check
   */
  healthCheck(): Observable<any> {
    return this.http
      .get(`${this.apiUrl.replace("/api", "")}/health`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    let sessionId = localStorage.getItem("chronicle_session_id");
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem("chronicle_session_id", sessionId);
    }
    return sessionId;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  }

  /**
   * Error handler
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = "An error occurred";

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.error || error.message || "Server error";
    }

    return throwError(() => new Error(errorMessage));
  }
}
