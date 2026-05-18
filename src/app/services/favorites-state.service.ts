import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavoritesStateService {
  readonly favoritedIds = signal<string[]>([]);

  isFavorited(id: string): boolean {
    return this.favoritedIds().includes(id);
  }

  setAll(ids: string[]): void {
    this.favoritedIds.set(ids);
  }

  add(id: string): void {
    this.favoritedIds.update((current) => (current.includes(id) ? current : [...current, id]));
  }

  remove(id: string): void {
    this.favoritedIds.update((current) => current.filter((currentId) => currentId !== id));
  }
}
