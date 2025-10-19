import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
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
    // Only load on constructor
    this.loadCurrentUser().subscribe();
  }

  login(email: string, password: string): Observable<TokenResponse> {
    return this.apiService.post<TokenResponse>('/auth/login', { email, password }).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        this.isLoggedInSubject.next(true);
        this.loadCurrentUser().subscribe();
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  /**
   * Load current user from backend and update state
   * Returns Observable that completes when user is loaded
   */
  loadCurrentUser(): Observable<User | null> {
    if (!localStorage.getItem('access_token')) {
      return of(null);
    }
    
    return this.apiService.get<User>('/auth/me').pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
        // Save role to localStorage for UI role-based rendering
        if (user?.role) {
          localStorage.setItem('role', user.role);
        }
      }),
      catchError(error => {
        console.error('Error loading current user:', error);
        this.logout();
        return of(null);
      })
    );
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

  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user?.role || null;
  }

  getStudentName(): string | null {
    const user = this.currentUserSubject.value;
    if (!user) return null;
    return user.username || user.email;
  }
}
