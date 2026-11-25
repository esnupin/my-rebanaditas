import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // 👈 Agregamos RouterLink para el botón del HTML
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // 👈 Agregado en imports
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  modo: 'login' | 'registro' = 'login';

  loading = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');

  readonly loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)])
  });

  readonly registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)])
  });

  invalido(campo: string, tipoFormulario: 'login' | 'registro' = 'login'): boolean {
    const control = tipoFormulario === 'login' ? this.loginForm.get(campo) : this.registerForm.get(campo);
    return !!control && control.touched && control.invalid;
  }

  cambiarModo(nuevoModo: 'login' | 'registro'): void {
    this.modo = nuevoModo;
    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.loginForm.reset();
    this.registerForm.reset();
  }

  iniciarSesion(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    const { username, password } = this.loginForm.getRawValue();

    this.authService.login(username!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.loginForm.reset();
        this.mensajeExito.set('¡Sesión iniciada correctamente!');
        // Ya no redirige automáticamente: se queda aquí mostrando su rol y el botón al panel
      },
      error: () => {
        this.loading.set(false);
        this.mensajeError.set('Usuario o contraseña incorrectos.');
      }
    });
  }

  registrar(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.registerForm.getRawValue();
    this.authService.registrarUsuario(username!, password!).subscribe({
      next: () => {
        this.mensajeError.set('');
        this.mensajeExito.set('¡Cuenta creada con éxito! Ahora inicia sesión.');
        this.registerForm.reset();

        setTimeout(() => this.cambiarModo('login'), 1000);
      },
      error: () => {
        this.mensajeError.set('Ese nombre de usuario ya está registrado.');
      }
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.mensajeExito.set('');
    this.mensajeError.set('');
    this.loginForm.reset();
    this.registerForm.reset();
    this.router.navigate(['/login']);
  }
}
