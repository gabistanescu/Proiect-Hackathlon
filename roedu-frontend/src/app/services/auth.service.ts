import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { User, TokenResponse } from '../models/user.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('access_token'));
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {
    this.loadCurrentUser();
  }

  login(email: string, password: string): Observable<TokenResponse> {
    return this.apiService.post<TokenResponse>('/auth/login', { email, password }).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        this.isLoggedInSubject.next(true);
        this.loadCurrentUser();
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  loadCurrentUser(): void {
    if (localStorage.getItem('access_token')) {
      this.apiService.get<User>('/auth/me').subscribe(
        user => {
          this.currentUserSubject.next(user);
        },
        error => {
          console.error('Error loading current user:', error);
          this.logout();
        }
      );
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  verifyToken(): Observable<any> {
    return this.apiService.get('/auth/verify');
  }
}
