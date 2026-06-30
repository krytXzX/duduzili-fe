import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  AdminLocationCity,
  AdminLocationState,
  AdminSettingsService,
} from '../../../services/admin-settings.service';
import { AppToastService } from '../../../services/app-toast.service';

@Component({
  selector: 'app-admin-locations-settings-panel',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="w-full max-w-[760px]">
      <header>
        <h2 class="text-[28px] font-semibold leading-10 text-[#1A1B1D] md:text-[28px]">
          Locations
        </h2>
        <p class="mt-1 max-w-[620px] text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
          Configure the states and cities shown in platform location pickers. Users select a state
          first, then choose one of the cities under it.
        </p>
      </header>

      <form
        class="mt-6 flex flex-col gap-3 rounded-[20px] border border-[#EFEFEF] bg-white p-4 sm:flex-row sm:items-center"
        (submit)="createState($event)"
      >
        <label class="sr-only" for="admin-location-state-name">State name</label>
        <input
          id="admin-location-state-name"
          type="text"
          name="stateName"
          [ngModel]="newStateName()"
          (ngModelChange)="newStateName.set($event)"
          placeholder="Add a state, e.g. Lagos"
          autocomplete="off"
          class="min-h-11 flex-1 rounded-[14px] border border-[#E7E7E7] px-4 text-[14px] outline-none transition placeholder:text-[#9EA3AE] focus:border-[#6453D9] focus:ring-4 focus:ring-[#6453D9]/10"
        />
        <button
          type="submit"
          [disabled]="isCreatingState() || !newStateName().trim()"
          class="min-h-11 rounded-[14px] bg-[#6453D9] px-5 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#5748C7] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isCreatingState() ? 'Adding...' : 'Add state' }}
        </button>
      </form>

      @if (isLoading()) {
        <div class="mt-5 space-y-3">
          @for (item of skeletonRows; track item) {
            <div class="overflow-hidden rounded-[20px] border border-[#EFEFEF] bg-white p-5">
              <div class="h-5 w-40 rounded-full bg-[#F1F1F1] skeleton-shimmer"></div>
              <div class="mt-4 flex flex-wrap gap-2">
                <div class="h-8 w-20 rounded-full bg-[#F1F1F1] skeleton-shimmer"></div>
                <div class="h-8 w-24 rounded-full bg-[#F1F1F1] skeleton-shimmer"></div>
                <div class="h-8 w-16 rounded-full bg-[#F1F1F1] skeleton-shimmer"></div>
              </div>
            </div>
          }
        </div>
      } @else if (loadError()) {
        <div class="mt-5 rounded-[20px] border border-[#F7D7D7] bg-[#FFF7F7] p-5">
          <p class="text-[15px] font-medium text-[#A43333]">
            We couldn’t load locations right now.
          </p>
          <button
            type="button"
            (click)="loadLocations()"
            class="mt-4 rounded-[12px] bg-[#1A1B1D] px-4 py-2 text-[13px] font-semibold text-white transition hover:-translate-y-0.5 active:translate-y-0"
          >
            Try again
          </button>
        </div>
      } @else if (states().length === 0) {
        <div class="mt-5 rounded-[20px] border border-dashed border-[#DCDCE4] bg-[#FAFAFA] p-6 text-center">
          <p class="text-[16px] font-semibold text-[#1A1B1D]">No platform locations yet</p>
          <p class="mx-auto mt-2 max-w-[420px] text-[14px] leading-5 text-[rgba(26,27,29,0.58)]">
            Add a state, then add cities beneath it. Only active states and active cities appear
            to users across the app.
          </p>
        </div>
      } @else {
        <div class="mt-5 space-y-4">
          @for (state of filteredStates(); track state.id) {
            <article class="rounded-[20px] border border-[#EFEFEF] bg-white p-5">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0 flex-1">
                  @if (editingStateId() === state.id) {
                    <form class="flex max-w-[420px] gap-2" (submit)="saveStateName($event, state)">
                      <label class="sr-only" [for]="'state-edit-' + state.id">Edit state</label>
                      <input
                        [id]="'state-edit-' + state.id"
                        type="text"
                        name="editingStateName"
                        [ngModel]="editingStateName()"
                        (ngModelChange)="editingStateName.set($event)"
                        autocomplete="off"
                        class="min-h-10 flex-1 rounded-[12px] border border-[#E7E7E7] px-3 text-[14px] outline-none focus:border-[#6453D9] focus:ring-4 focus:ring-[#6453D9]/10"
                      />
                      <button
                        type="submit"
                        class="rounded-[12px] bg-[#1A1B1D] px-3 text-[13px] font-semibold text-white transition hover:-translate-y-0.5 active:translate-y-0"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        (click)="cancelStateEdit()"
                        class="rounded-[12px] bg-[#F4F4F4] px-3 text-[13px] font-semibold text-[#1A1B1D] transition hover:-translate-y-0.5 active:translate-y-0"
                      >
                        Cancel
                      </button>
                    </form>
                  } @else {
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="text-[18px] font-semibold leading-6 text-[#1A1B1D]">
                        {{ state.name }}
                      </h3>
                      <span
                        class="rounded-full px-2.5 py-1 text-[12px] font-medium"
                        [class.bg-[#EAF9F1]]="state.is_active"
                        [class.text-[#16884A]]="state.is_active"
                        [class.bg-[#F1F1F1]]="!state.is_active"
                        [class.text-[#707684]]="!state.is_active"
                      >
                        {{ state.is_active ? 'Active' : 'Hidden' }}
                      </span>
                      <span class="text-[13px] text-[#8A8F9B]">
                        {{ activeCityCount(state) }} active {{ activeCityCount(state) === 1 ? 'city' : 'cities' }}
                      </span>
                    </div>
                  }
                </div>

                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    (click)="startStateEdit(state)"
                    class="rounded-[12px] bg-[#F6F6F6] px-3 py-2 text-[13px] font-semibold text-[#1A1B1D] transition hover:-translate-y-0.5 hover:bg-[#ECECEC] active:translate-y-0"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    (click)="toggleStateStatus(state)"
                    class="rounded-[12px] bg-[#F6F6F6] px-3 py-2 text-[13px] font-semibold text-[#1A1B1D] transition hover:-translate-y-0.5 hover:bg-[#ECECEC] active:translate-y-0"
                  >
                    {{ state.is_active ? 'Hide' : 'Show' }}
                  </button>
                  <button
                    type="button"
                    (click)="deleteState(state)"
                    class="rounded-[12px] bg-[#FFF1F1] px-3 py-2 text-[13px] font-semibold text-[#D33A3A] transition hover:-translate-y-0.5 hover:bg-[#FFE7E7] active:translate-y-0"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <form class="mt-4 flex flex-col gap-2 sm:flex-row" (submit)="createCity($event, state)">
                <label class="sr-only" [for]="'city-add-' + state.id">City name</label>
                <input
                  [id]="'city-add-' + state.id"
                  type="text"
                  name="cityName"
                  [ngModel]="newCityNameFor(state.id)"
                  (ngModelChange)="setNewCityName(state.id, $event)"
                  placeholder="Add a city under {{ state.name }}"
                  autocomplete="off"
                  class="min-h-10 flex-1 rounded-[12px] border border-[#E7E7E7] px-3 text-[14px] outline-none transition placeholder:text-[#9EA3AE] focus:border-[#6453D9] focus:ring-4 focus:ring-[#6453D9]/10"
                />
                <button
                  type="submit"
                  [disabled]="isCreatingCityFor(state.id) || !newCityNameFor(state.id).trim()"
                  class="min-h-10 rounded-[12px] bg-[#6453D9] px-4 text-[13px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#5748C7] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {{ isCreatingCityFor(state.id) ? 'Adding...' : 'Add city' }}
                </button>
              </form>

              @if (state.cities.length > 0) {
                <div class="mt-4 flex flex-wrap gap-2">
                  @for (city of state.cities; track city.id) {
                    <div
                      class="flex items-center gap-2 rounded-full border px-3 py-2"
                      [class.border-[#D9F0E2]]="city.is_active"
                      [class.bg-[#F4FBF7]]="city.is_active"
                      [class.border-[#E8E8E8]]="!city.is_active"
                      [class.bg-[#FAFAFA]]="!city.is_active"
                    >
                      @if (editingCityKey() === cityKey(state.id, city.id)) {
                        <input
                          type="text"
                          name="editingCityName"
                          [ngModel]="editingCityName()"
                          (ngModelChange)="editingCityName.set($event)"
                          class="h-7 w-32 rounded-[8px] border border-[#DADADA] px-2 text-[13px] outline-none focus:border-[#6453D9]"
                          aria-label="Edit city name"
                        />
                        <button
                          type="button"
                          (click)="saveCityName(state, city)"
                          class="text-[12px] font-semibold text-[#16884A]"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          (click)="cancelCityEdit()"
                          class="text-[12px] font-semibold text-[#707684]"
                        >
                          Cancel
                        </button>
                      } @else {
                        <span
                          class="text-[13px] font-medium"
                          [class.text-[#1A1B1D]]="city.is_active"
                          [class.text-[#8A8F9B]]="!city.is_active"
                        >
                          {{ city.name }}
                        </span>
                        <button
                          type="button"
                          (click)="startCityEdit(state, city)"
                          class="text-[12px] font-semibold text-[#6453D9] transition hover:text-[#5748C7]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          (click)="toggleCityStatus(state, city)"
                          class="text-[12px] font-semibold text-[#707684] transition hover:text-[#1A1B1D]"
                        >
                          {{ city.is_active ? 'Hide' : 'Show' }}
                        </button>
                        <button
                          type="button"
                          (click)="deleteCity(state, city)"
                          class="text-[12px] font-semibold text-[#D33A3A] transition hover:text-[#B42323]"
                        >
                          Delete
                        </button>
                      }
                    </div>
                  }
                </div>
              } @else {
                <p class="mt-4 rounded-[14px] bg-[#FAFAFA] px-4 py-3 text-[13px] text-[#707684]">
                  No cities have been added under {{ state.name }} yet.
                </p>
              }
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: `
    @keyframes location-shimmer {
      0% {
        background-position: -200% 0;
      }

      100% {
        background-position: 200% 0;
      }
    }

    .skeleton-shimmer {
      background-image: linear-gradient(90deg, #f1f1f1 0%, #fafafa 45%, #ececec 100%);
      background-size: 200% 100%;
      animation: location-shimmer 1.2s ease-in-out infinite;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLocationsSettingsPanelComponent {
  private readonly adminSettingsService = inject(AdminSettingsService);
  private readonly toast = inject(AppToastService);

  protected readonly states = signal<readonly AdminLocationState[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly newStateName = signal('');
  protected readonly isCreatingState = signal(false);
  protected readonly newCityNames = signal<Record<number, string>>({});
  protected readonly creatingCityStateIds = signal<ReadonlySet<number>>(new Set());
  protected readonly editingStateId = signal<number | null>(null);
  protected readonly editingStateName = signal('');
  protected readonly editingCityKey = signal<string | null>(null);
  protected readonly editingCityName = signal('');
  protected readonly skeletonRows = [1, 2, 3];

  protected readonly filteredStates = computed(() =>
    [...this.states()].sort((a, b) => a.name.localeCompare(b.name)),
  );

  constructor() {
    void this.loadLocations();
  }

  protected async loadLocations(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(false);

    try {
      const states = await firstValueFrom(this.adminSettingsService.getLocationStates());
      this.states.set(states.map((state) => this.sortStateCities(state)));
    } catch {
      this.loadError.set(true);
      this.showToast('We couldn’t load locations right now. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async createState(event: Event): Promise<void> {
    event.preventDefault();
    const name = this.newStateName().trim();
    if (!name || this.isCreatingState()) {
      return;
    }

    this.isCreatingState.set(true);
    try {
      const state = await firstValueFrom(this.adminSettingsService.createLocationState({ name }));
      this.states.update((states) => [...states, this.sortStateCities({ ...state, cities: [] })]);
      this.newStateName.set('');
      this.showToast(`${state.name} has been added.`);
    } catch {
      this.showToast('We couldn’t add that state. Please check the name and try again.');
    } finally {
      this.isCreatingState.set(false);
    }
  }

  protected startStateEdit(state: AdminLocationState): void {
    this.editingStateId.set(state.id);
    this.editingStateName.set(state.name);
  }

  protected cancelStateEdit(): void {
    this.editingStateId.set(null);
    this.editingStateName.set('');
  }

  protected async saveStateName(event: Event, state: AdminLocationState): Promise<void> {
    event.preventDefault();
    const name = this.editingStateName().trim();
    if (!name || name === state.name) {
      this.cancelStateEdit();
      return;
    }

    try {
      const updated = await firstValueFrom(
        this.adminSettingsService.updateLocationState(state.id, { name }),
      );
      this.replaceState({ ...state, ...updated });
      this.cancelStateEdit();
      this.showToast(`${updated.name} has been updated.`);
    } catch {
      this.showToast('We couldn’t update that state. Please try again.');
    }
  }

  protected async toggleStateStatus(state: AdminLocationState): Promise<void> {
    const nextStatus = !state.is_active;
    this.replaceState({ ...state, is_active: nextStatus });

    try {
      const updated = await firstValueFrom(
        this.adminSettingsService.updateLocationState(state.id, { is_active: nextStatus }),
      );
      this.replaceState({ ...state, ...updated });
      this.showToast(`${state.name} is now ${updated.is_active ? 'visible' : 'hidden'}.`);
    } catch {
      this.replaceState(state);
      this.showToast('We couldn’t update that state. Please try again.');
    }
  }

  protected async deleteState(state: AdminLocationState): Promise<void> {
    const confirmed = window.confirm(
      `Delete ${state.name} and all cities under it? Existing records using it will keep their saved text, but the location will no longer be selectable.`,
    );
    if (!confirmed) {
      return;
    }

    const previousStates = this.states();
    this.states.update((states) => states.filter((item) => item.id !== state.id));

    try {
      await firstValueFrom(this.adminSettingsService.deleteLocationState(state.id));
      this.showToast(`${state.name} has been deleted.`);
    } catch {
      this.states.set(previousStates);
      this.showToast('We couldn’t delete that state. Please try again.');
    }
  }

  protected setNewCityName(stateId: number, value: string): void {
    this.newCityNames.update((names) => ({ ...names, [stateId]: value }));
  }

  protected isCreatingCityFor(stateId: number): boolean {
    return this.creatingCityStateIds().has(stateId);
  }

  protected newCityNameFor(stateId: number): string {
    return this.newCityNames()[stateId] ?? '';
  }

  protected async createCity(event: Event, state: AdminLocationState): Promise<void> {
    event.preventDefault();
    const name = (this.newCityNames()[state.id] ?? '').trim();
    if (!name || this.isCreatingCityFor(state.id)) {
      return;
    }

    this.creatingCityStateIds.update((ids) => new Set(ids).add(state.id));
    try {
      const city = await firstValueFrom(
        this.adminSettingsService.createLocationCity(state.id, { name }),
      );
      this.replaceState({
        ...state,
        cities: [...state.cities, city].sort((a, b) => a.name.localeCompare(b.name)),
      });
      this.setNewCityName(state.id, '');
      this.showToast(`${city.name} has been added under ${state.name}.`);
    } catch {
      this.showToast('We couldn’t add that city. Please check the name and try again.');
    } finally {
      this.creatingCityStateIds.update((ids) => {
        const next = new Set(ids);
        next.delete(state.id);
        return next;
      });
    }
  }

  protected cityKey(stateId: number, cityId: number): string {
    return `${stateId}:${cityId}`;
  }

  protected startCityEdit(state: AdminLocationState, city: AdminLocationCity): void {
    this.editingCityKey.set(this.cityKey(state.id, city.id));
    this.editingCityName.set(city.name);
  }

  protected cancelCityEdit(): void {
    this.editingCityKey.set(null);
    this.editingCityName.set('');
  }

  protected async saveCityName(state: AdminLocationState, city: AdminLocationCity): Promise<void> {
    const name = this.editingCityName().trim();
    if (!name || name === city.name) {
      this.cancelCityEdit();
      return;
    }

    try {
      const updated = await firstValueFrom(
        this.adminSettingsService.updateLocationCity(state.id, city.id, { name }),
      );
      this.replaceCity(state, updated);
      this.cancelCityEdit();
      this.showToast(`${updated.name} has been updated.`);
    } catch {
      this.showToast('We couldn’t update that city. Please try again.');
    }
  }

  protected async toggleCityStatus(state: AdminLocationState, city: AdminLocationCity): Promise<void> {
    const previousCity = city;
    const optimisticCity = { ...city, is_active: !city.is_active };
    this.replaceCity(state, optimisticCity);

    try {
      const updated = await firstValueFrom(
        this.adminSettingsService.updateLocationCity(state.id, city.id, {
          is_active: optimisticCity.is_active,
        }),
      );
      this.replaceCity(state, updated);
      this.showToast(`${city.name} is now ${updated.is_active ? 'visible' : 'hidden'}.`);
    } catch {
      this.replaceCity(state, previousCity);
      this.showToast('We couldn’t update that city. Please try again.');
    }
  }

  protected async deleteCity(state: AdminLocationState, city: AdminLocationCity): Promise<void> {
    const confirmed = window.confirm(`Delete ${city.name} from ${state.name}?`);
    if (!confirmed) {
      return;
    }

    const previousState = state;
    this.replaceState({
      ...state,
      cities: state.cities.filter((item) => item.id !== city.id),
    });

    try {
      await firstValueFrom(this.adminSettingsService.deleteLocationCity(state.id, city.id));
      this.showToast(`${city.name} has been deleted.`);
    } catch {
      this.replaceState(previousState);
      this.showToast('We couldn’t delete that city. Please try again.');
    }
  }

  protected activeCityCount(state: AdminLocationState): number {
    return state.cities.filter((city) => city.is_active).length;
  }

  private replaceState(nextState: AdminLocationState): void {
    this.states.update((states) =>
      states.map((state) => (state.id === nextState.id ? this.sortStateCities(nextState) : state)),
    );
  }

  private replaceCity(state: AdminLocationState, nextCity: AdminLocationCity): void {
    this.replaceState({
      ...state,
      cities: state.cities.map((city) => (city.id === nextCity.id ? nextCity : city)),
    });
  }

  private sortStateCities(state: AdminLocationState): AdminLocationState {
    return {
      ...state,
      cities: [...state.cities].sort((a, b) => a.name.localeCompare(b.name)),
    };
  }

  private showToast(message: string): void {
    this.toast.show({ message, durationMs: 2600 });
  }
}
