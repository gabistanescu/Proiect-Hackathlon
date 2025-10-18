import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if we have a token in localStorage
  const hasToken = !!localStorage.getItem('access_token');
  
  if (!hasToken) {
    // No token, redirect to login
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // We have a token, check if user is loaded
  return authService.currentUser$.pipe(
    take(1),
    switchMap((user) => {
      if (user) {
        // User is already loaded
        return of(true);
      } else {
        // User not loaded yet, try to load from backend
        authService.loadCurrentUser();
        // Wait for user to load
        return authService.currentUser$.pipe(
          take(1),
          map((loadedUser) => {
            if (loadedUser) {
              return true;
            } else {
              router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
              return false;
            }
          })
        );
      }
    })
  );
};
