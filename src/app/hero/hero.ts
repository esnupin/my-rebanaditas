import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductosServices } from '../services/productos';
import { Producto } from '../models/producto.model';
import { ComentariosService as ComentarioServicio } from '../services/comentarios';
import { Comentario } from '../models/comentario.model';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class HeroComponent implements OnInit {

  private readonly productosService = inject(ProductosServices);

  private readonly comentariosService = inject(ComentarioServicio);

  // estas referencias nos permiten acceder directamente a los elementos del html
  // las utilizamos para controlar el movimiento de los dos carruseles
  @ViewChild('carruselEspecialidades') carruselEspecialidades!: ElementRef<HTMLDivElement>;
  @ViewChild('carruselNuevos') carruselNuevos!: ElementRef<HTMLDivElement>;

  favoritos = signal<Producto[]>([]);
  nuevos = signal<Producto[]>([]);
  cargando = signal<boolean>(true);
  comentarios = signal<Comentario[]>([]);
  cargandoComentarios = signal<boolean>(true);

  // para ver si el m esanje se envio y empiez en false pq no se ha mandado naada
  mensajeEnviado = false;

  readonly formulario = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    numeroTelefono: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{10}$')
    ]),

    comentario: new FormControl('', [
      Validators.required,
      Validators.minLength(10)
    ]),
  });

  ngOnInit(): void {

    this.cargarPostresDestacados();
    this.cargarComentariosAPI();
  }

  cargarPostresDestacados(): void {

    this.cargando.set(true);

    this.productosService.obtenerPorCategoria('dona').subscribe({
      next: (datos) => {
        this.favoritos.set(datos);
        this.cargando.set(false);
      },

      error: (err) => {

        console.error('Error al cargar favoritos:', err);

        this.cargando.set(false);
      }
    });

    this.productosService.obtenerPorCategoria('galletas').subscribe({
      next: (datos) => {

        this.nuevos.set(datos.slice(0, 6));
      },

      error: (err) => console.error('Error al cargar lo más nuevo:', err)
    });
  }


  cargarComentariosAPI(): void {

    this.cargandoComentarios.set(true);

    this.comentariosService.obtenerComentarios().subscribe({
      next: (datos) => {

        this.comentarios.set(datos.slice(0, 15));
        this.cargandoComentarios.set(false);
      },

      error: (err) => {

        console.error('Error al cargar comentarios:', err);
        this.cargandoComentarios.set(false);
      }
    });
  }

  // metodo para mover el carrusel de especialidades hacia la izquierda o derecha
  // recibe la dirección que queremos utilizar
  desplazar(direccion: 'izq' | 'der'): void {

    if (!this.carruselEspecialidades) return;

    // obtenemos el elemento html del carrusel para poder controlar su desplazamiento
    const contenedor = this.carruselEspecialidades.nativeElement;
    const distancia = direccion === 'izq' ? -320 : 320;
    contenedor.scrollBy({ left: distancia, behavior: 'smooth' });
  }

  desplazarNuevos(direccion: 'izq' | 'der'): void {

    if (!this.carruselNuevos) return;

    // obtenemos el elemento html del carrusel
    const contenedor = this.carruselNuevos.nativeElement;
    const distancia = direccion === 'izq' ? -320 : 320;
    contenedor.scrollBy({ left: distancia, behavior: 'smooth' });
  }

  // lleva suavemente a la sección de contacto evitando que el navbar la tape
  irAContacto(event: Event): void {
    event.preventDefault();
    const elemento = document.getElementById('contacto-seccion');
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // este metodo sirve para comprobar si un campo del formulario tiene algún error
  invalido(campo: string): boolean {

    const control = this.formulario.get(campo);
    return !!control && control.touched && control.invalid;
  }

  // este metodo se ejecuta cuando el usuario intenta enviar el formulario
  envio(): void {

    if (this.formulario.invalid) {

      this.formulario.markAllAsTouched();
      return;
    }

    console.log('Mensaje enviado:', this.formulario.value);

    // cambiamos la variable a true para mostrar el mensaje de confirmación en el html
    this.mensajeEnviado = true;

    this.formulario.reset();

    setTimeout(() => {
      this.mensajeEnviado = false;
    }, 5000);
  }
}
