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
  // List of required Angular modules and material components
  imports: [ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent 
{
  // Inject required services using Angular's Dependency Injection
  authService = inject(AuthService); // Service for handling authentication logic
  fb = inject(FormBuilder); // FormBuilder for making forms
  router = inject(Router); // Router for navigation after loginning in
  errorMessage: string | null = null; // Holds error messages to display to the user

  // A reactive form group with email and password fields
  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  // Handles form submission
  onSubmit() {
    const rawForm = this.form.getRawValue(); // Get form values
    this.errorMessage = null; // Clears previous errors

     // Calls the login method from AuthService with email and password
    this.authService.login(rawForm.email, rawForm.password)
      .subscribe({
        // Navigate to 'to-do-list' page after successful login
        next: () => this.router.navigateByUrl('/to-do-list'),
        error: (err) => {
          console.error('Login error:', err);
          this.errorMessage = this.getErrorMessage(err); 
        }
      });
  }

  // Handles Google login using AuthService
  onGoogleLogin() {
    this.authService.loginWithGoogle().subscribe({
      // Navigate to 'to-do-list' page after successful login
      next: () => this.router.navigateByUrl('/to-do-list'),
      error: (err) => {
        console.error('Google login error:', err);
        this.errorMessage = this.getErrorMessage(err);
      }
    });
  }

  // Translates Firebase authentication error codes into user-friendly messages.
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
