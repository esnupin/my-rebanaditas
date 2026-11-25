import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductInput, Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductosServices {
  private readonly baseUrl = 'https://devsapihub.com/api-fast-food';
  private readonly http = inject(HttpClient);

  // 1. GET: Listar todos los productos
  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.baseUrl);
  }

  // 2. GET: Obtener un producto por ID
  obtenerProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }

  // 3. POST: Crear un producto nuevo
  crearProducto(producto: ProductInput): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/product`, producto);
  }

  // 4. PUT: Actualizar un producto (Nota el /product/ antes del ID según la API)
  actualizarProducto(id: number, producto: ProductInput): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/product/${id}`, producto);
  }

  // 5. DELETE: Eliminar un producto
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/product/${id}`);
  }

  // 6. GET: Filtrar comidas por categoría
  obtenerPorCategoria(category: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/category/${category}`);
  }
}