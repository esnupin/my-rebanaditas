import { Component, inject, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {

  readonly authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  @ViewChild('menuCollapse') menuCollapse!: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    const menuElement = this.menuCollapse?.nativeElement;

    if (!clickedInside && menuElement && menuElement.classList.contains('show')) {
      menuElement.classList.remove('show');
    }
  }

  cerrarMenu() {
    const menuElement = this.menuCollapse?.nativeElement;

    if (menuElement && menuElement.classList.contains('show')) {
      menuElement.classList.remove('show');
    }
  }

  irAContacto(event: Event) {
    event.preventDefault();
    this.cerrarMenu();

    this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        const elemento = document.getElementById('contacto-seccion');
        if (elemento) {
          elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    });
  }
}
