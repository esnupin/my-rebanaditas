import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Comentario } from '../models/comentario.model';

@Injectable({
  providedIn: 'root'
})
export class ComentariosService {
  private readonly url = 'https://jsonplaceholder.typicode.com/comments';
  private readonly http = inject(HttpClient);

  obtenerComentarios(): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(this.url);
  }
}