import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment, CommentCreate, CommentUpdate } from '../models/comment.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private apiService: ApiService) { }

  getComments(materialId?: number): Observable<Comment[]> {
    if (materialId) {
      return this.apiService.get<Comment[]>(`/comments?material_id=${materialId}`);
    }
    return this.apiService.get<Comment[]>('/comments');
  }

  getCommentById(id: number): Observable<Comment> {
    return this.apiService.get<Comment>(`/comments/${id}`);
  }

  createComment(comment: CommentCreate): Observable<Comment> {
    return this.apiService.post<Comment>('/comments', comment);
  }

  updateComment(id: number, comment: CommentUpdate): Observable<Comment> {
    return this.apiService.put<Comment>(`/comments/${id}`, comment);
  }

  deleteComment(id: number): Observable<void> {
    return this.apiService.delete<void>(`/comments/${id}`);
  }

  approveComment(id: number): Observable<Comment> {
    return this.apiService.put<Comment>(`/comments/${id}/approve`, { is_approved: true });
  }
}
