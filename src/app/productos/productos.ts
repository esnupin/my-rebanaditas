import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductosServices } from '../services/productos';
import { Producto } from '../models/producto.model';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos implements OnInit {

  private servicio = inject(ProductosServices);

  // Signals que guardan la información que utiliza este componente
  // El primero almacena los productos, el segundo el texto de búsqueda
  // y el tercero guarda la categoría que el usuario seleccionó
  productos = signal<Producto[]>([]);
  terminoBusqueda = signal<string>('');
  categoriaActiva = signal<string>('todos');

  productosFiltrados = computed(() => {

    const lista = this.productos();
    const termino = this.terminoBusqueda().toLowerCase().trim();
    const cat = this.categoriaActiva();

    return lista.filter(prod => {

      // Comprueba si el producto pertenece a la categoría seleccionada
      // Si la categoría es todos, se aceptan todos los productos
      const coincideCategoria = cat === 'todos' || prod.category.toLowerCase() === cat.toLowerCase();

      // Comprueba si el nombre del producto contiene el texto que escribió el usuario
      // Si no hay nada escrito, se aceptan todos los nombres
      const coincideBusqueda = !termino || prod.name.toLowerCase().includes(termino);

      return coincideCategoria && coincideBusqueda;
    });
  });

  ngOnInit(): void {

    this.servicio.obtenerProductos().subscribe({

      next: (datos: Producto[]) => {
        this.productos.set(datos);
      },

      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  cambiarFiltro(categoria: string): void {

    this.categoriaActiva.set(categoria);
  }
}