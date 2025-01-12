import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'app-update',
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatError],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss'
})
export class UpdateComponent implements OnInit {
  // Injecti all of the required services
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  router = inject(Router);

  errorMessage: string | null = null;

  // Form group initialization
  form = this.fb.nonNullable.group({
    username: [`${this.authService.firebaseAuth.currentUser?.displayName}`, Validators.required], // Username field
    email: [`${this.authService.firebaseAuth.currentUser?.email}`, Validators.required], // Email field 
    password: ['', Validators.required], // Password field
  });

  // Update form with current user data
  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.form.patchValue({
          username: user.displayName || '',
          email: user.email || ''
        });
      }
    });
  }

  // Submit update form
  onSubmit() {
    const rawForm = this.form.getRawValue();
    this.errorMessage = null;
    this.authService.update(rawForm.email, rawForm.username, rawForm.password)
      .subscribe({
        next: () => this.router.navigateByUrl('/login'), // Navigate to login on success
        error: (err) => {
          console.error('Update error:', err);
          this.errorMessage = err.text;
        }
      });
  }
}
