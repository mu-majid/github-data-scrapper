import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],  
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'gh-integration-frontend';
}
