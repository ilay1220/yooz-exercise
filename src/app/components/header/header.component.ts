import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatButtonModule, 
    MatToolbarModule, 
    MatIconModule,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  title = 'Yooz App';

  // Inject required services
  authService = inject(AuthService);
  constructor(private router: Router, private cdRef: ChangeDetectorRef) {}

  /**
   * Navigate to a specific route.
   * @param path - Path to navigate to
   */
  navigateTo(path: string) {
    this.router.navigate([`/${path}`]);
  }

  /**
   * Logs the user out and navigates to the login page.
   */
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.cdRef.detectChanges(); 
        this.navigateTo('login');
      },
      error: (err) => {
        console.error('Logout failed:', err);
      }
    });
  }
}
