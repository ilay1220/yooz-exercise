import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { signOut } from 'firebase/auth'
import { Observable, from } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  title = signal('My first APP that I made using Angular');
  authService = inject(AuthService)

  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([`/${path}`]);
  }

  logout()
  {
    this.authService.logout()
    this.navigateTo('login')
  }
}
