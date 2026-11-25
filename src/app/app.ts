import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar';
import { FooterComponent } from './footer/footer'; // <-- Aquí: FooterComponent en lugar de Footer

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent], // <-- Aquí también
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'my-rebanaditas';
}