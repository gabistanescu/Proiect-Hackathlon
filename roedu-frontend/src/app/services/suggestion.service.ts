import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  MaterialSuggestion,
  SuggestionCreate,
  SuggestionUpdate,
  SuggestionComment,
  SuggestionCommentCreate,
  SuggestionStatus,
} from '../models/material.model';

@Injectable({
  providedIn: 'root',
})
export class SuggestionService {
  private api = inject(ApiService);

  /**
   * Create a new suggestion for a material
   */
  createSuggestion(
    materialId: number,
    data: SuggestionCreate
  ): Observable<MaterialSuggestion> {
    return this.api.post<MaterialSuggestion>(
      `/api/v1/materials/${materialId}/suggestions`,
      data
    );
  }

  /**
   * List all suggestions for a material with optional filters
   */
  listSuggestions(
    materialId: number,
    params?: {
      status?: SuggestionStatus;
      skip?: number;
      limit?: number;
    }
  ): Observable<MaterialSuggestion[]> {
    return this.api.get<MaterialSuggestion[]>(
      `/api/v1/materials/${materialId}/suggestions`,
      params
    );
  }

  /**
   * Get a single suggestion by ID
   */
  getSuggestion(suggestionId: number): Observable<MaterialSuggestion> {
    return this.api.get<MaterialSuggestion>(
      `/api/v1/materials/suggestions/${suggestionId}`
    );
  }

  /**
   * Update suggestion status (only owner can do this)
   */
  updateSuggestion(
    suggestionId: number,
    data: SuggestionUpdate
  ): Observable<MaterialSuggestion> {
    return this.api.put<MaterialSuggestion>(
      `/api/v1/materials/suggestions/${suggestionId}`,
      data
    );
  }

  /**
   * Delete a suggestion (only owner can do this)
   */
  deleteSuggestion(suggestionId: number): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(
      `/api/v1/materials/suggestions/${suggestionId}`
    );
  }

  /**
   * Add a comment to a suggestion
   */
  createComment(
    suggestionId: number,
    data: SuggestionCommentCreate
  ): Observable<SuggestionComment> {
    return this.api.post<SuggestionComment>(
      `/api/v1/materials/suggestions/${suggestionId}/comments`,
      data
    );
  }

  /**
   * List all comments for a suggestion
   */
  listComments(suggestionId: number): Observable<SuggestionComment[]> {
    return this.api.get<SuggestionComment[]>(
      `/api/v1/materials/suggestions/${suggestionId}/comments`
    );
  }

  /**
   * Delete a comment (only comment author can do this)
   */
  deleteComment(commentId: number): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(
      `/api/v1/materials/suggestions/comments/${commentId}`
    );
  }
}
