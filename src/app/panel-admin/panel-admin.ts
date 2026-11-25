import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth';
import { ProductosServices } from '../services/productos';
import { Producto, ProductInput } from '../models/producto.model';
import { UsuariosService } from '../services/usuarios';
import { Usuario } from '../models/usuario.model';
import { Comentarios } from '../services/comentarios';
import { Comentario } from '../models/comentario.model';

type SeccionAdmin = 'productos' | 'usuarios' | 'comentarios' | 'pedidos';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.css'
})
export class PanelAdminComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly productosService = inject(ProductosServices);
  private readonly usuariosService = inject(UsuariosService);
  private readonly comentariosService = inject(Comentarios);

  seccionActiva = signal<SeccionAdmin>('productos');

  // --- ESTADO PRODUCTOS ---
  productos = signal<Producto[]>([]);
  cargandoProductos = signal<boolean>(false);
  editandoProductoId = signal<number | null>(null);
  mensajeProducto = signal<string>('');

  readonly productoForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    category: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
  });

  // --- ESTADO USUARIOS ---
  usuarios = signal<Usuario[]>([]);
  cargandoUsuarios = signal<boolean>(false);
  editandoUsuarioId = signal<number | null>(null);
  mensajeUsuario = signal<string>('');

  readonly usuarioForm = new FormGroup({
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
  });

  // --- ESTADO COMENTARIOS DE CLIENTES ---
  comentariosLista = signal<Comentario[]>([]);
  cargandoComentarios = signal<boolean>(false);
  filtroComentario = signal<string>('');
  mensajeComentario = signal<string>('');

  comentariosFiltrados = computed(() => {
    const termino = this.filtroComentario().trim().toLowerCase();
    const lista = this.comentariosLista();
    if (!termino) return lista;
    return lista.filter(c =>
      (c.name ?? '').toLowerCase().includes(termino) ||
      (c.email ?? '').toLowerCase().includes(termino) ||
      (c.body ?? '').toLowerCase().includes(termino) ||
      (c.comentario ?? '').toLowerCase().includes(termino)
    );
  });

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarUsuarios();
    this.cargarComentarios();
  }

  cambiarSeccion(seccion: SeccionAdmin): void {
    this.seccionActiva.set(seccion);
  }

  // ==================== CRUD PRODUCTOS ====================
  cargarProductos(): void {
    this.cargandoProductos.set(true);
    this.productosService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargandoProductos.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.cargandoProductos.set(false);
      }
    });
  }

  guardarProducto(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    const raw = this.productoForm.getRawValue();
    const payload: ProductInput = {
      name: raw.name!.trim(),
      price: Number(raw.price),
      category: raw.category!.trim(),
      image: raw.image!.trim(),
    };

    const idEdit = this.editandoProductoId();

    if (idEdit !== null) {
      this.productosService.actualizarProducto(idEdit, payload).subscribe({
        next: () => {
          this.productos.update(lista =>
            lista.map(p => (p.id === idEdit ? { ...p, ...payload, id: idEdit } : p))
          );
          this.notificarProducto('Producto actualizado correctamente.');
          this.cancelarEdicionProducto();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else {
      this.productosService.crearProducto(payload).subscribe({
        next: (creado) => {
          const nuevoItem: Producto = {
            ...payload,
            id: creado?.id ?? Date.now()
          };
          this.productos.update(lista => [nuevoItem, ...lista]);
          this.notificarProducto('Producto creado con éxito.');
          this.productoForm.reset();
        },
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }

  prepararEditarProducto(prod: Producto): void {
    this.editandoProductoId.set(prod.id);
    this.productoForm.patchValue({
      name: prod.name,
      price: prod.price,
      category: prod.category,
      image: prod.image
    });
  }

  cancelarEdicionProducto(): void {
    this.editandoProductoId.set(null);
    this.productoForm.reset();
  }

  borrarProducto(id: number): void {
    this.productosService.eliminarProducto(id).subscribe({
      next: () => {
        this.productos.update(lista => lista.filter(p => p.id !== id));
        this.notificarProducto('Producto eliminado.');
      },
      error: (err) => console.error('Error al eliminar:', err)
    });
  }

  private notificarProducto(msg: string): void {
    this.mensajeProducto.set(msg);
    setTimeout(() => this.mensajeProducto.set(''), 3500);
  }

  // ==================== CRUD USUARIOS ====================
  cargarUsuarios(): void {
    this.cargandoUsuarios.set(true);
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargandoUsuarios.set(false);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.cargandoUsuarios.set(false);
      }
    });
  }

  guardarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const raw = this.usuarioForm.getRawValue();
    const editId = this.editandoUsuarioId();

    const baseData: Partial<Usuario> = {
      name: {
        firstname: raw.firstname!.trim(),
        lastname: raw.lastname!.trim(),
      },
      username: raw.username!.trim(),
      email: raw.email!.trim(),
      phone: raw.phone!.trim(),
    };

    if (editId !== null) {
      this.usuariosService.actualizarUsuario(editId, baseData).subscribe({
        next: () => {
          this.usuarios.update(lista =>
            lista.map(u => (u.id === editId ? { ...u, ...baseData, name: baseData.name! } : u))
          );
          this.notificarUsuario('Usuario actualizado.');
          this.cancelarEdicionUsuario();
        },
        error: (err) => console.error('Error al actualizar usuario:', err)
      });
    } else {
      this.usuariosService.crearUsuario(baseData).subscribe({
        next: (creado) => {
          const nuevoUser: Usuario = {
            id: creado?.id ?? Date.now(),
            email: baseData.email!,
            username: baseData.username!,
            phone: baseData.phone!,
            name: baseData.name!,
          };
          this.usuarios.update(lista => [nuevoUser, ...lista]);
          this.notificarUsuario('Usuario registrado.');
          this.usuarioForm.reset();
        },
        error: (err) => console.error('Error al crear usuario:', err)
      });
    }
  }

  prepararEditarUsuario(user: Usuario): void {
    this.editandoUsuarioId.set(user.id);
    this.usuarioForm.patchValue({
      firstname: user.name.firstname,
      lastname: user.name.lastname,
      username: user.username,
      email: user.email,
      phone: user.phone,
    });
  }

  cancelarEdicionUsuario(): void {
    this.editandoUsuarioId.set(null);
    this.usuarioForm.reset();
  }

  borrarUsuario(id: number): void {
    this.usuariosService.eliminarUsuario(id).subscribe({
      next: () => {
        this.usuarios.update(lista => lista.filter(u => u.id !== id));
        this.notificarUsuario('Usuario eliminado.');
      },
      error: (err) => console.error('Error al eliminar usuario:', err)
    });
  }

  private notificarUsuario(msg: string): void {
    this.mensajeUsuario.set(msg);
    setTimeout(() => this.mensajeUsuario.set(''), 3500);
  }

  // ==================== REVISAR COMENTARIOS ====================
  cargarComentarios(): void {
    this.cargandoComentarios.set(true);
    this.comentariosService.obtenerComentarios().subscribe({
      next: (data) => {
        // Tomamos los primeros 25 para mantener ágil la revisión en el panel
        this.comentariosLista.set(data.slice(0, 25));
        this.cargandoComentarios.set(false);
      },
      error: (err) => {
        console.error('Error al cargar comentarios:', err);
        this.cargandoComentarios.set(false);
      }
    });
  }

  actualizarFiltroComentario(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.filtroComentario.set(valor);
  }

  borrarComentario(id: number): void {
    this.comentariosLista.update(lista => lista.filter(c => c.id !== id));
    this.mensajeComentario.set('Comentario retirado de la revisión.');
    setTimeout(() => this.mensajeComentario.set(''), 3000);
  }

  salirAdmin(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}