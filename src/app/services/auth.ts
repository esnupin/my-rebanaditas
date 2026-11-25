import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap, of, throwError } from 'rxjs';

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
  readonly isAdmin = computed(() => this.username() === 'johnd');

  // Método para REGISTRAR un usuario nuevo localmente
  registrarUsuario(username: string, password: string): Observable<boolean> {
    const usuariosLocales = this.obtenerUsuariosLocales();

    // Validar si ya existe
    const existe = usuariosLocales.some(u => u.username.toLowerCase() === username.toLowerCase().trim());
    if (existe) {
      return throwError(() => ({ status: 400, message: 'El usuario ya existe' }));
    }

    usuariosLocales.push({ username: username.trim(), password });
    localStorage.setItem(this.localUsersKey, JSON.stringify(usuariosLocales));

    return of(true);
  }

  // Método de LOGIN que revisa primero si es local o si va a la API
  login(username: string, password: string): Observable<any> {
    const usuariosLocales = this.obtenerUsuariosLocales();
    const usuarioLocalEncontrado = usuariosLocales.find(
      u => u.username.toLowerCase() === username.toLowerCase().trim() && u.password === password
    );

    // Payload en el índice 1 para que readUsername() lea el usuario local
    if (usuarioLocalEncontrado) {
      const payloadBase64 = btoa(JSON.stringify({ user: usuarioLocalEncontrado.username }));
      const fakeToken = `local.${payloadBase64}.signature`;
      localStorage.setItem(this.storageKey, fakeToken);
      this.tokenSignal.set(fakeToken);
      return of({ token: fakeToken });
    }

    // Si no es local, intentamos con la API real de FakeStoreAPI (ej. johnd)
    return this.http.post<LoginResponse>(this.apiUrl, {
      username,
      password
    }).pipe(
      tap((response) => {
        localStorage.setItem(this.storageKey, response.token);
        this.tokenSignal.set(response.token);
      })
    );
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