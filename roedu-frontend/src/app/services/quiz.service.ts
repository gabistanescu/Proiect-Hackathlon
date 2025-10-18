import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Quiz, QuizCreate, QuizAttempt } from '../models/quiz.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  constructor(private apiService: ApiService) { }

  getQuizzes(): Observable<Quiz[]> {
    return this.apiService.get<Quiz[]>('/quizzes');
  }

  getQuizById(id: number): Observable<Quiz> {
    return this.apiService.get<Quiz>(`/quizzes/${id}`);
  }

  createQuiz(quiz: QuizCreate): Observable<Quiz> {
    return this.apiService.post<Quiz>('/quizzes', quiz);
  }

  updateQuiz(id: number, quiz: Partial<QuizCreate>): Observable<Quiz> {
    return this.apiService.put<Quiz>(`/quizzes/${id}`, quiz);
  }

  deleteQuiz(id: number): Observable<void> {
    return this.apiService.delete<void>(`/quizzes/${id}`);
  }

  copyQuiz(id: number): Observable<Quiz> {
    return this.apiService.post<Quiz>(`/quizzes/${id}/copy`, {});
  }

  submitAttempt(id: number, answers: any[]): Observable<QuizAttempt> {
    return this.apiService.post<QuizAttempt>(`/quizzes/${id}/attempt`, { answers });
  }

  getResults(id: number): Observable<QuizAttempt[]> {
    return this.apiService.get<QuizAttempt[]>(`/quizzes/${id}/results`);
  }

  generateAIQuiz(materialId: number, topic: string): Observable<Quiz> {
    return this.apiService.post<Quiz>('/quizzes/generate-ai', {
      material_id: materialId,
      topic
    });
  }
}
