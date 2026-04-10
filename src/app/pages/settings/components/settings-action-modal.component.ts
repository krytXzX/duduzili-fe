import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown, heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-settings-action-modal',
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ heroChevronDown, heroXMark })],
  template: `
    <div class="fixed inset-0 z-[220] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]" (click)="close.emit()">
      <div class="w-full max-w-[390px] rounded-[20px] bg-white p-4 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]" (click)="$event.stopPropagation()">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-[16px] font-black tracking-tight text-[#1A1C21]">{{ title() }}</h3>
            <p class="mt-2 max-w-[310px] text-[11px] font-medium leading-5 text-[#98A0AA]">{{ description() }}</p>
          </div>

          <button
            type="button"
            (click)="close.emit()"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F7F8] text-[#6B7079] transition hover:bg-[#EFEFF2]"
            aria-label="Close modal"
          >
            <ng-icon name="heroXMark" class="text-sm"></ng-icon>
          </button>
        </div>

        <div class="mt-5">
          <label for="settings-modal-input" class="mb-2 block text-[11px] font-medium text-[#A3A8B1]">{{ fieldLabel() }}</label>
          <div class="flex items-center gap-2 rounded-[12px] border border-[#E8EAF0] bg-white px-3 py-2.5">
            <input
              id="settings-modal-input"
              [type]="inputType()"
              [value]="value()"
              (input)="onInput($event)"
              class="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#2A2D34] outline-none placeholder:text-[#B5BAC4]"
            >
            @if (showDropdown()) {
              <ng-icon name="heroChevronDown" class="text-sm text-[#B0B4BD]"></ng-icon>
            }
          </div>
        </div>

        <div class="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            (click)="close.emit()"
            class="rounded-full border border-[#E7EAF0] bg-white px-4 py-2.5 text-[11px] font-semibold text-[#2F333B] transition hover:bg-[#FAFAFC]"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="confirm.emit()"
            class="rounded-full bg-[#6653E4] px-4 py-2.5 text-[11px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB]"
          >
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsActionModalComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly fieldLabel = input.required<string>();
  readonly value = input.required<string>();
  readonly inputType = input<'text' | 'email' | 'tel'>('text');
  readonly confirmLabel = input.required<string>();
  readonly showDropdown = input(false);

  readonly close = output<void>();
  readonly confirm = output<void>();
  readonly valueChange = output<string>();

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(input.value);
  }
}
