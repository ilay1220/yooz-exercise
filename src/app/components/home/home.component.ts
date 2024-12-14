import { Component, signal } from '@angular/core';
import { LoginComponent } from "../login/login.component";
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-home',
  imports: [LoginComponent, SignupComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  greetMsg = signal('Hello everyone');
}
