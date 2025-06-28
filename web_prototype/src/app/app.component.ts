import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="container">
      <header class="header">
        <h1>🏢 Building Evacuation System</h1>
        <p class="subtitle">Web Prototype - Angular + Three.js</p>
        <nav style="margin-top: 1rem;">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" 
             style="margin-right: 2rem; text-decoration: none; color: #667eea; font-weight: 500;">
            🎮 Simulation
          </a>
          <a routerLink="/analysis" routerLinkActive="active" 
             style="text-decoration: none; color: #667eea; font-weight: 500;">
            📊 Analysis
          </a>
        </nav>
      </header>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    nav a {
      transition: all 0.3s ease;
    }
    
    nav a:hover {
      color: #764ba2;
      transform: translateY(-1px);
    }
    
    nav a.active {
      color: #764ba2;
      font-weight: 600;
    }
  `]
})
export class AppComponent {
  title = 'Building Evacuation System';
}
