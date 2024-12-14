import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet],
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
