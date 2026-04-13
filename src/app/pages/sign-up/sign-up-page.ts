import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { faBrandApple, faBrandGoogle } from '@ng-icons/font-awesome/brands';

import { OtpInputComponent } from '../../components/common/otp-input/otp-input.component';

@Component({
  selector: 'app-sign-up-page',
  imports: [ReactiveFormsModule, NgIcon, OtpInputComponent],
  templateUrl: './sign-up-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ faBrandGoogle, faBrandApple })],
  host: {
    class: 'flex flex-col gap-5',
  },
})
export class SignUpPageComponent {
  private readonly router = inject(Router);
  
  // Multi-step management: 1=Email, 2=OTP, 3=Security
  protected readonly currentStep = signal(1);
  protected readonly totalSteps = 3;
  protected readonly submitted = signal(false);
  protected readonly isProcessing = signal(false);

  protected readonly signupForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    otp: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly emailControl = this.signupForm.controls.email;
  protected readonly fullNameControl = this.signupForm.controls.fullName;
  protected readonly otpControl = this.signupForm.controls.otp;
  protected readonly passwordControl = this.signupForm.controls.password;
  protected readonly confirmPasswordControl = this.signupForm.controls.confirmPassword;

  protected readonly isStep1Valid = computed(() => this.emailControl.valid);
  protected readonly isStep2Valid = computed(() => this.otpControl.valid);
  protected readonly isStep3Valid = computed(() => 
    this.fullNameControl.valid &&
    this.passwordControl.valid && 
    this.confirmPasswordControl.value === this.passwordControl.value
  );

  protected nextStep(): void {
    const step = this.currentStep();
    this.submitted.set(true);

    if (step === 1 && this.isStep1Valid()) {
      this.isProcessing.set(true);
      // Mock validation
      setTimeout(() => {
        this.isProcessing.set(false);
        this.currentStep.set(2);
        this.submitted.set(false);
      }, 800);
    } else if (step === 2 && this.isStep2Valid()) {
      this.isProcessing.set(true);
      // Mock OTP verify
      setTimeout(() => {
        this.isProcessing.set(false);
        this.currentStep.set(3);
        this.submitted.set(false);
      }, 800);
    } else if (step === 3 && this.isStep3Valid()) {
      this.finishSignup();
    }
  }

  protected prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
      this.submitted.set(false);
    }
  }

  private finishSignup(): void {
    this.isProcessing.set(true);
    console.log('User Registered:', this.signupForm.value);
    // Mock success
    setTimeout(() => {
      this.isProcessing.set(false);
      // Navigate to success or login
      this.router.navigate(['/listings']);
    }, 1500);
  }
}
