import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GenerateDescriptionRequest {
  title: string;
  currentDescription?: string;
  categoryName?: string;
  price?: number;
  images?: string[];
}

export interface GenerateTitleRequest {
  currentTitle: string;
  categoryName?: string;
}

export interface AiResponse {
  description?: string;
  title?: string;
  generatedAt: string;
  service: string;
}

export interface AiStatusResponse {
  available: boolean;
  service: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = 'http://localhost:3000/ai';

  constructor(private http: HttpClient) {}

  /**
   * Genera una descripción mejorada para un producto usando IA
   */
  generateDescription(data: GenerateDescriptionRequest): Observable<AiResponse> {
    return this.http.post<AiResponse>(`${this.apiUrl}/generate-description`, data);
  }

  /**
   * Genera un título optimizado para un producto usando IA
   */
  generateTitle(data: GenerateTitleRequest): Observable<AiResponse> {
    return this.http.post<AiResponse>(`${this.apiUrl}/generate-title`, data);
  }

  /**
   * Verifica el estado del servicio de IA
   */
  checkStatus(): Observable<AiStatusResponse> {
    return this.http.post<AiStatusResponse>(`${this.apiUrl}/status`, {});
  }
}
