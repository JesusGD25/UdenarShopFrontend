import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UploadResponse {
  url: string;
  message: string;
}

export interface MultipleUploadResponse {
  urls: string[];
  count: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = 'http://localhost:3000/upload';

  constructor(private http: HttpClient) { }

  /**
   * Sube una sola imagen al servidor
   * @param file - Archivo de imagen a subir
   * @returns Observable con la URL de la imagen
   */
  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(`${this.apiUrl}/image`, formData);
  }

  /**
   * Sube múltiples imágenes al servidor (máximo 5)
   * @param files - Array de archivos de imagen
   * @returns Observable con las URLs de las imágenes
   */
  uploadMultipleImages(files: File[]): Observable<MultipleUploadResponse> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    return this.http.post<MultipleUploadResponse>(`${this.apiUrl}/images`, formData);
  }

  /**
   * Valida que el archivo sea una imagen
   * @param file - Archivo a validar
   * @returns true si es una imagen válida
   */
  isValidImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  /**
   * Valida el tamaño del archivo (máximo 5MB)
   * @param file - Archivo a validar
   * @returns true si el tamaño es válido
   */
  isValidSize(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSize;
  }

  /**
   * Obtiene un mensaje de error amigable para el usuario
   * @param file - Archivo que falló la validación
   * @returns Mensaje de error
   */
  getValidationError(file: File): string | null {
    if (!this.isValidImage(file)) {
      return `${file.name} no es una imagen válida. Solo se permiten JPG, PNG, GIF y WebP.`;
    }
    if (!this.isValidSize(file)) {
      return `${file.name} es demasiado grande. El tamaño máximo es 5MB.`;
    }
    return null;
  }
}
