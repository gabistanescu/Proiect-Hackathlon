import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Material,
  MaterialCreate,
  MaterialSearchParams,
  FeedbackStats,
  FeedbackToggleResponse,
} from '../models/material.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  constructor(private apiService: ApiService) {}

  getMaterials(params?: MaterialSearchParams): Observable<Material[]> {
    if (params) {
      const query = new URLSearchParams();
      if (params.profile_type) query.set('profile_type', params.profile_type);
      if (params.subject) query.set('subject', params.subject);
      if (params.grade_level)
        query.set('grade_level', params.grade_level.toString());
      if (params.tags) query.set('tags', params.tags.join(','));
      if (params.search_query) query.set('search_query', params.search_query);
      if (params.professor_id)
        query.set('professor_id', params.professor_id.toString());

      return this.apiService.get<Material[]>(`/materials?${query.toString()}`);
    }
    return this.apiService.get<Material[]>('/materials');
  }

  getMaterialById(id: number): Observable<Material> {
    return this.apiService.get<Material>(`/materials/${id}`);
  }

  createMaterial(material: MaterialCreate): Observable<Material> {
    return this.apiService.post<Material>('/materials', material);
  }

  updateMaterial(
    id: number,
    material: Partial<MaterialCreate>
  ): Observable<Material> {
    return this.apiService.put<Material>(`/materials/${id}`, material);
  }

  deleteMaterial(id: number): Observable<void> {
    return this.apiService.delete<void>(`/materials/${id}`);
  }

  saveMaterial(id: number): Observable<void> {
    return this.apiService.post<void>(`/materials/${id}/save`, {});
  }

  searchMaterials(query: string): Observable<Material[]> {
    return this.apiService.post<Material[]>('/materials/search', {
      search_query: query,
    });
  }

  uploadFiles(files: File[]): Observable<{ file_paths: string[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return this.apiService.post<{ file_paths: string[] }>(
      '/materials/upload',
      formData
    );
  }

  uploadFile(
    file: File
  ): Observable<{ filename: string; file_path: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.post<{
      filename: string;
      file_path: string;
      message: string;
    }>('/materials/upload', formData, true); // true = skip Content-Type header
  }

  /**
   * Toggle professor feedback for a material
   */
  toggleProfessorFeedback(
    materialId: number
  ): Observable<FeedbackToggleResponse> {
    return this.apiService.post<FeedbackToggleResponse>(
      `/materials/${materialId}/feedback/professor`,
      {}
    );
  }

  /**
   * Toggle student feedback for a material
   */
  toggleStudentFeedback(
    materialId: number
  ): Observable<FeedbackToggleResponse> {
    return this.apiService.post<FeedbackToggleResponse>(
      `/materials/${materialId}/feedback/student`,
      {}
    );
  }

  /**
   * Get feedback statistics for a material
   */
  getFeedbackStats(materialId: number): Observable<FeedbackStats> {
    return this.apiService.get<FeedbackStats>(
      `/materials/${materialId}/feedback`
    );
  }
}
