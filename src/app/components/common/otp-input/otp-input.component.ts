import { ChangeDetectionStrategy, Component, input, output, signal, effect, ElementRef, ViewChildren, QueryList } from '@angular/core';

@Component({
  selector: 'app-otp-input',
  imports: [],
  templateUrl: './otp-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col items-center w-full',
  },
})
export class OtpInputComponent {
  /** Total number of digits in the OTP */
  length = input<number>(6);
  
  /** Whether the parent form has been submitted (to show error styling) */
  submitted = input<boolean>(false);
  
  /** Emits the full code whenever any digit changes */
  codeChange = output<string>();
  
  /** Emits the full code only when it's fully filled */
  codeFilled = output<string>();

  @ViewChildren('digitInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  protected readonly otpFields = signal<string[]>([]);
  protected readonly halfLength = signal<number>(3);

  constructor() {
    effect(() => {
      const len = this.length();
      this.otpFields.set(Array.from({ length: len }, () => ''));
      this.halfLength.set(Math.floor(len / 2));
    }, { allowSignalWrites: true });
  }

  protected updateOtpValue(index: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;
    
    // Accept only numeric characters
    value = value.replace(/\D/g, '');
    inputElement.value = value;
    
    // Only take the last character if multiple are entered
    if (value.length > 1) value = value.slice(-1);
    
    const fields = [...this.otpFields()];
    fields[index] = value;
    this.otpFields.set(fields);
    
    const fullValue = fields.join('');
    this.codeChange.emit(fullValue);
    
    if (fullValue.length === this.length()) {
      this.codeFilled.emit(fullValue);
    }
    
    // Auto-focus next
    if (value && index < this.length() - 1) {
      setTimeout(() => {
        this.inputs.toArray()[index + 1].nativeElement.focus();
      });
    }
  }

  protected handleKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.otpFields()[index] && index > 0) {
      this.inputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  protected handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text') || '';
    const digits = pasteData.replace(/\D/g, '').split('').slice(0, this.length());

    const fields = [...this.otpFields()];
    digits.forEach((digit, index) => {
      fields[index] = digit;
    });
    this.otpFields.set(fields);

    const fullValue = fields.join('');
    this.codeChange.emit(fullValue);
    
    if (fullValue.length === this.length()) {
      this.codeFilled.emit(fullValue);
    }

    // Attempt to focus the next empty box or the last one
    const nextIndex = digits.length < this.length() ? digits.length : this.length() - 1;
    setTimeout(() => {
      this.inputs.toArray()[nextIndex].nativeElement.focus();
    });
  }
}
