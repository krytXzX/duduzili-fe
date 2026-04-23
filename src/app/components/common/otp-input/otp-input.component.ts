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
  variant = input<'default' | 'settingsVerification'>('default');
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
    if (this.variant() === 'settingsVerification') {
      if (index === 0) {
        return '24px 10px 10px 24px';
      }

      if (index === this.length() - 1) {
        return '10px 24px 24px 10px';
      }

      return '10px';
    }

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

  protected containerClass(): string {
    return this.variant() === 'settingsVerification'
      ? 'flex w-full items-center justify-start gap-[5.447px] md:gap-[14px]'
      : 'flex w-full items-center justify-center gap-[11.573px]';
  }

  protected groupClass(): string {
    return this.variant() === 'settingsVerification'
      ? 'flex items-center gap-[3.631px] md:gap-3'
      : 'flex items-center gap-[6.613px]';
  }

  protected inputClass(): string {
    const base = 'border bg-[#f3f3f3] text-center leading-none font-semibold text-[#1a1b1d] transition-[background-color,border-color,box-shadow] focus:bg-white focus-visible:border-[#6453d9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]';

    return this.variant() === 'settingsVerification'
      ? `${base} h-[57.193px] w-[48.487px] text-[25.419px] tracking-[-0.381px] md:h-[70px] md:w-[70px] md:text-[28px] md:tracking-[-0.42px]`
      : `${base} h-[57.864px] w-[49.598px] text-[24px] tracking-[-0.36px]`;
  }

  protected separatorClass(): string {
    return this.variant() === 'settingsVerification'
      ? 'block h-px w-[5.447px] bg-[#cfcfd4] md:w-3'
      : 'block h-px w-[9.92px] bg-[#cfcfd4]';
  }
}
