import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  router = inject(Router);
  errorMessage: string | null = null;

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit() {
    console.log("here");
    const rawForm = this.form.getRawValue();
    this.errorMessage = null; 
    this.authService.signup(rawForm.email, rawForm.username, rawForm.password)
      .subscribe({
        next: () => this.router.navigateByUrl('/login'),
        error: (err) => {
          console.error('Signup error:', err);
          this.errorMessage = this.getErrorMessage(err); 
        }
      });
  }

  private getErrorMessage(error: any): string {
    if (error?.code === 'auth/weak-password') {
      return 'Password should be at least 6 characters.';
    }
    if (error?.code === 'auth/email-already-in-use') {
      return 'This email is already registered.';
    }
    if (error?.code === 'auth/invalid-email') {
      return 'Invalid email address.';
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
