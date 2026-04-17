import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  effect,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-otp-input',
  imports: [],
  templateUrl: './otp-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
  },
})
export class OtpInputComponent {
  length = input<number>(6);
  submitted = input<boolean>(false);
  codeChange = output<string>();
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

    value = value.replace(/\D/g, '');
    inputElement.value = value;

    if (value.length > 1) value = value.slice(-1);

    const fields = [...this.otpFields()];
    fields[index] = value;
    this.otpFields.set(fields);

    const fullValue = fields.join('');
    this.codeChange.emit(fullValue);

    if (fullValue.length === this.length()) {
      this.codeFilled.emit(fullValue);
    }

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

    const nextIndex = digits.length < this.length() ? digits.length : this.length() - 1;
    setTimeout(() => {
      this.inputs.toArray()[nextIndex].nativeElement.focus();
    });
  }

  protected fieldBorderRadius(index: number): string {
    if (index === 0) {
      return '19.839px 8.266px 8.266px 19.839px';
    }

    if (index === this.length() - 1) {
      return '8.266px 19.839px 19.839px 8.266px';
    }

    return '8.266px';
  }

  protected fieldAriaLabel(index: number): string {
    return `Verification code digit ${index + 1}`;
  }
}
