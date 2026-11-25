import { Component, inject, OnInit, signal } from '@angular/core';
import { ComentariosService } from '../services/comentarios';
import { Comentario } from '../models/comentario.model';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [],
  templateUrl: './comentarios.html',
  styleUrl: './comentarios.css',
})
export class Comentarios implements OnInit {
  comentarios = signal<Comentario[]>([]);
  private servicio = inject(ComentariosService);

  ngOnInit(): void {
    this.servicio.obtenerComentarios().subscribe({
      next: (dato) => {
        this.comentarios.set(dato);
      }
    });
  }
}