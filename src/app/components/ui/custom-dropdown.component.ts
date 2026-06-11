import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

export interface CustomDropdownOption<T extends string = string> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-custom-dropdown',
  imports: [],
  template: `
    <div class="relative inline-block" [class.w-full]="fullWidth()">
      <button
        type="button"
        [class]="buttonClass()"
        [attr.aria-expanded]="isOpen()"
        aria-haspopup="listbox"
        (click)="toggle($event)"
      >
        <span [class]="labelClass()">{{ selectedLabel() }}</span>
        <svg
          class="h-4 w-4 shrink-0 transition-transform"
          [class.rotate-180]="isOpen()"
          [class]="iconClass()"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path d="M5 7.5 10 12.5l5-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      @if (isOpen()) {
        <button
          type="button"
          class="fixed inset-0 z-40 cursor-default bg-transparent"
          aria-label="Close dropdown"
          (click)="close()"
        ></button>

        <div
          class="fixed z-[60] overflow-hidden rounded-[18px] border border-[#EAEAEA] bg-white p-1 shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
          [style.left.px]="menuPosition().left"
          [style.top.px]="menuPosition().top"
          [style.min-width.px]="menuPosition().minWidth"
          [class]="menuClass()"
        >
          <div role="listbox" [attr.aria-label]="ariaLabel()">
            @for (option of options(); track option.value) {
              <button
                type="button"
                role="option"
                [attr.aria-selected]="option.value === value()"
                [class]="optionButtonClass(option.value === value())"
                (click)="select(option.value)"
              >
                {{ option.label }}
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  host: {
    class: 'contents',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomDropdownComponent<T extends string = string> {
  readonly options = input.required<readonly CustomDropdownOption<T>[]>();
  readonly value = input.required<T>();
  readonly placeholder = input('Select');
  readonly ariaLabel = input('Select option');
  readonly fullWidth = input(false);
  readonly align = input<'left' | 'right'>('left');
  readonly buttonClass = input(
    'inline-flex h-10 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-4 text-[14px] font-medium text-[#1A1B1D] transition-all duration-200 hover:bg-gray-50 active:scale-95',
  );
  readonly labelClass = input('truncate');
  readonly iconClass = input('text-[#6F6F6F]');
  readonly menuClass = input('min-w-[180px]');
  readonly optionClass = input(
    'flex w-full items-center rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition-all duration-200 hover:bg-[#F7F7FA] active:scale-[0.98]',
  );
  readonly activeOptionClass = input('bg-[#F3F1FF] text-[#6453D9]');
  readonly valueChange = output<T>();

  readonly isOpen = signal(false);
  readonly menuPosition = signal({ left: 0, top: 0, minWidth: 0 });

  readonly selectedLabel = computed(() => {
    const selected = this.options().find((option) => option.value === this.value());
    return selected?.label ?? this.placeholder();
  });

  toggle(event: Event): void {
    if (this.isOpen()) {
      this.close();
      return;
    }

    const trigger = event.currentTarget;
    if (!(trigger instanceof HTMLElement)) {
      this.isOpen.set(true);
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const minWidth = rect.width;
    const estimatedMenuWidth = Math.max(minWidth, 180);
    const left = this.align() === 'right'
      ? Math.max(12, rect.right - estimatedMenuWidth)
      : Math.max(12, rect.left);
    const top = rect.bottom + 8;

    this.menuPosition.set({
      left,
      top,
      minWidth,
    });
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  select(value: T): void {
    this.valueChange.emit(value);
    this.close();
  }

  optionButtonClass(isActive: boolean): string {
    return `${this.optionClass()} ${isActive ? this.activeOptionClass() : ''}`.trim();
  }
}
