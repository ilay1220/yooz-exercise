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

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  // Inject dependencies
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  router = inject(Router);
  errorMessage: string | null = null;

  // Signup form with validation rules
  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  // Submit the form
  onSubmit() {
    const rawForm = this.form.getRawValue();
    this.errorMessage = null; 
    this.authService.signup(rawForm.email, rawForm.username, rawForm.password)
      .subscribe({
        // Navigate to Login page after successful login
        next: () => this.router.navigateByUrl('/login'),
        error: (err) => {
          console.error('Signup error:', err);
          this.errorMessage = this.getErrorMessage(err); 
        }
      });
  }

  // Google Sign-Up Handler
  onGoogleSignup() {
    this.authService.loginWithGoogle().subscribe({
      // Navigate to Login page after successful login
      next: () => this.router.navigateByUrl('/login'),
      error: (err) => {
        console.error('Google signup error:', err);
        this.errorMessage = this.getErrorMessage(err);
      }
    });
  }

   // Translates Firebase authentication error codes into user-friendly messages.
  private getErrorMessage(error: any): string {
    if (error?.code === 'auth/weak-password') {
      return 'Password should be at least 6 characters.';
    }
    if (error?.code === 'auth/email-already-in-use') {
      return 'This email is already in use.';
    }
    if (error?.code === 'auth/invalid-email') {
      return 'Invalid email address.';
    }
    return 'An unexpected error happened, please try again.';
  }
}
