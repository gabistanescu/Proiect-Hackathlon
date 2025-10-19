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

  getQuiz(id: number): Observable<Quiz> {
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

  startAttempt(quizId: number): Observable<QuizAttempt> {
    return this.apiService.post<QuizAttempt>(`/quizzes/start/${quizId}`, {});
  }

  syncTimer(attemptId: number): Observable<QuizAttempt> {
    return this.apiService.put<QuizAttempt>(`/quizzes/attempts/${attemptId}/timer-sync`, {});
  }

  autoSubmitAttempt(attemptId: number, answers?: any): Observable<QuizAttempt> {
    const body = answers ? { answers } : {};
    return this.apiService.post<QuizAttempt>(`/quizzes/attempts/${attemptId}/auto-submit`, body);
  }

  getResults(id: number): Observable<QuizAttempt[]> {
    return this.apiService.get<QuizAttempt[]>(`/quizzes/${id}/results`);
  }

  getAttemptResult(attemptId: number): Observable<any> {
    return this.apiService.get<any>(`/quizzes/attempt/${attemptId}`);
  }

  getQuizAttempts(quizId: number): Observable<any[]> {
    return this.apiService.get<any[]>(`/quizzes/${quizId}/attempts`);
  }

  generateAIQuiz(materialId: number, topic: string): Observable<Quiz> {
    return this.apiService.post<Quiz>('/quizzes/generate-ai', {
      material_id: materialId,
      topic
    });
  }

  reportAIEvaluation(attemptId: number, questionId: number, reason: string): Observable<any> {
    return this.apiService.post<any>(
      `/ai_evaluation_reports/attempts/${attemptId}/questions/${questionId}/report`,
      { reason }
    );
  }

  updateQuestionScore(attemptId: number, questionId: number, newScore: number, feedback: string): Observable<any> {
    return this.apiService.put<any>(
      `/ai_evaluation_reports/attempts/${attemptId}/questions/${questionId}/score`,
      { 
        status: 'resolved',
        new_score: newScore,
        professor_feedback: feedback
      }
    );
  }

  generateQuizFromMaterial(materialId: number): Observable<Quiz> {
    return this.apiService.post<Quiz>(
      `/quizzes/generate-from-material/${materialId}`,
      {}
    );
  }

  deleteAttempt(attemptId: number): Observable<void> {
    return this.apiService.delete<void>(`/quizzes/attempts/${attemptId}`);
  }
}
