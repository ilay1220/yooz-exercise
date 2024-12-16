import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { GoogleAuthProvider } from 'firebase/auth';
import * as firebaseui from 'firebaseui';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  router = inject(Router);
  errorMessage: string | null = null;

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit() {
    console.log("here");
    const rawForm = this.form.getRawValue();
    this.errorMessage = null; 
    this.authService.login(rawForm.email, rawForm.password)
      .subscribe({
        next: () => this.router.navigateByUrl('/to-do-list'),
        error: (err) => {
          console.error('Login error:', err);
          this.errorMessage = this.getErrorMessage(err); 
        }
      });
  }

  onGoogleLogin() {
    this.authService.loginWithGoogle().subscribe({
      next: () => this.router.navigateByUrl('/to-do-list'),
      error: (err) => {
        console.error('Google login error:', err);
        this.errorMessage = this.getErrorMessage(err);
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error?.code === 'auth/user-not-found') {
      return 'No user found with this email.';
    }
    if (error?.code === 'auth/wrong-password') {
      return 'Incorrect password. Please try again.';
    }
    if (error?.code === 'auth/invalid-email') {
      return 'Invalid email format.';
    }
    if (error?.code === 'auth/too-many-requests') {
      return 'Too many login attempts. Please try again later.';
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
