import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, HomeComponent, RouterOutlet],
  template: `
    <app-header/>
    <div class="container">
     <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
      main{
        padding: 16px;       
      }
    `],
})
export class AppComponent {
  title = 'yooz-exercise';
}
