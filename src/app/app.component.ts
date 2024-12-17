import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { AuthService } from './auth.service';

/**
 * Root component of the Angular application.
 * Includes the header and a container for routing.
 */
@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet],
  template: `
    <app-header/>
    <div class="container">
     <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      main{
        padding: 16px;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  // Injected authentication service
  authService = inject(AuthService);

  // Initializes user authentication state
  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if(user) {
        this.authService.currentUserSignal.set({
          email: user.email!,
          username: user.displayName!,
          uid: user.uid!
        });
      } else {
        this.authService.currentUserSignal.set(null);
      }
      console.log(this.authService.currentUserSignal());
    });
  }

  title = 'yooz-exercise';
}
