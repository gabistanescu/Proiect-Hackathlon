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

  // We have a token, check if user is already loaded
  return authService.currentUser$.pipe(
    take(1),
    switchMap((user) => {
      if (user) {
        // User is already loaded, allow access
        return of(true);
      } else {
        // User not loaded yet, load from backend
        return authService.loadCurrentUser().pipe(
          map((loadedUser) => {
            if (loadedUser) {
              return true;
            } else {
              // Failed to load user, redirect to login
              router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
              return false;
            }
          })
        );
      }
    })
  );
};
