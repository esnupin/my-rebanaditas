import { Component, inject, signal } from '@angular/core';
import { Comentarios as ComentarioServicio } from '../services/comentarios';
import { Comentario } from '../models/comentario.model';

@Component({
  imports: [],
  selector: 'app-comentarios',
  styleUrl: './comentarios.css',
  templateUrl: './comentarios.html',
})

export class Comentarios {

  comentarios = signal<Comentario[]>([]);

  private servicio = inject(ComentarioServicio)

  ngOnInit(): void {
  
    this.servicio.obtenerComentarios().subscribe(
      {
        next: (dato)=>{
          this.comentarios.set(dato);
          console.log(dato)
        }
      }
    )
  }
}
