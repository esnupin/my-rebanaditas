import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap, of } from 'rxjs';

interface LoginResponse {
  token: string;
}

interface TokenPayload {
  user?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://fakestoreapi.com/auth/login';
  private readonly storageKey = 'fakestore_token';
  private readonly localUsersKey = 'rebanaditas_custom_users';

  private tokenSignal = signal<string | null>(localStorage.getItem(this.storageKey));

  readonly username = computed(() => {
    const token = this.tokenSignal();
    return token ? this.readUsername(token) : null;
  });

  readonly isAuthenticated = computed(() => this.username() !== null);
  readonly isAdmin = computed(() => this.username() === 'admin');

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  registrarUsuario(username: string, email: string, password: string): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      const usuariosLocales = this.obtenerUsuariosLocales();
      const userClean = username.trim().toLowerCase();
      const emailClean = email.trim().toLowerCase();

      if (usuariosLocales.some(u => u.username.toLowerCase() === userClean)) {
        observer.error({ status: 400, message: 'Ese nombre de usuario ya está registrado.' });
        return;
      }

      if (usuariosLocales.some(u => u.email?.toLowerCase() === emailClean)) {
        observer.error({ status: 400, message: 'Este correo electrónico ya está registrado.' });
        return;
      }

      this.hashPassword(password).then((passwordHash) => {
        usuariosLocales.push({
          username: username.trim(),
          email: emailClean,
          password: passwordHash
        });
        localStorage.setItem(this.localUsersKey, JSON.stringify(usuariosLocales));
        observer.next(true);
        observer.complete();
      });
    });
  }

  login(username: string, password: string): Observable<any> {
    const idClean = username.trim().toLowerCase();

    if (idClean === 'admin' && password === 'admin123') {
      const payloadBase64 = btoa(JSON.stringify({ user: 'admin' }));
      const fakeToken = `local.${payloadBase64}.signature`;
      localStorage.setItem(this.storageKey, fakeToken);
      this.tokenSignal.set(fakeToken);
      return of({ token: fakeToken });
    }

    return new Observable((observer) => {
      this.hashPassword(password).then((passwordHash) => {
        const usuariosLocales = this.obtenerUsuariosLocales();
        const usuarioLocalEncontrado = usuariosLocales.find(
          u => (u.username.toLowerCase() === idClean || u.email?.toLowerCase() === idClean) &&
               u.password === passwordHash
        );

        if (usuarioLocalEncontrado) {
          const payloadBase64 = btoa(JSON.stringify({ user: usuarioLocalEncontrado.username }));
          const fakeToken = `local.${payloadBase64}.signature`;
          localStorage.setItem(this.storageKey, fakeToken);
          this.tokenSignal.set(fakeToken);
          observer.next({ token: fakeToken });
          observer.complete();
        } else {
          this.http.post<LoginResponse>(this.apiUrl, {
            username,
            password
          }).pipe(
            tap((response) => {
              localStorage.setItem(this.storageKey, response.token);
              this.tokenSignal.set(response.token);
            })
          ).subscribe({
            next: (res) => {
              observer.next(res);
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        }
      });
    });
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.tokenSignal.set(null);
  }

  private obtenerUsuariosLocales(): any[] {
    const data = localStorage.getItem(this.localUsersKey);
    return data ? JSON.parse(data) : [];
  }

  private readUsername(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;

      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const data = JSON.parse(atob(padded)) as TokenPayload;
      return data.user ?? null;
    } catch {
      return null;
    }
  }
}