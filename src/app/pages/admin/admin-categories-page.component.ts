import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronDown,
  heroChevronRight,
  heroPencilSquare,
  heroPlus,
  heroSquares2x2,
  heroTrash,
} from '@ng-icons/heroicons/outline';
import { AppToastService } from '../../services/app-toast.service';
import {
  AdminCategoriesService,
  AdminCategoryParentOption,
  AdminManagedCategoryRecord,
} from '../../services/admin-categories.service';

type LimitType = 'automobile' | 'property' | 'other';
type EditorMode = 'create-parent' | 'create-subcategory' | 'edit' | null;

@Component({
  selector: 'app-admin-categories-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronRight,
      heroPencilSquare,
      heroPlus,
      heroSquares2x2,
      heroTrash,
    }),
  ],
  host: { class: 'block h-full' },
  template: `
    <section class="bg-white lg:hidden">
      <div class="flex items-center gap-2 px-5 pb-4 pt-[10px]">
        <a
          routerLink="/admin/more"
          class="inline-flex h-8 w-11 items-center justify-center rounded-full bg-[#F3F3F3]"
          aria-label="Back"
        >
          <img ngSrc="/assets/icons/listing-details-back.svg" width="20" height="20" alt="" class="h-5 w-5" aria-hidden="true" />
        </a>
        <h1 class="text-[20px] font-semibold leading-[1.2] text-black">Categories</h1>
      </div>

      <div class="px-4 pb-8">
        <div class="flex items-center gap-3">
          <label class="relative block min-w-0 flex-1">
            <input
              type="text"
              [value]="searchQuery()"
              (input)="updateSearchQuery($event)"
              placeholder="Search categories"
              class="h-10 w-full rounded-full bg-[#FAFAFA] px-4 text-[14px] text-[#1A1B1D] outline-none placeholder:text-[#777777]"
            >
          </label>
          <button
            type="button"
            (click)="openCreateParent()"
            class="inline-flex h-10 items-center justify-center rounded-full bg-[#6453D9] px-4 text-[14px] font-medium text-white"
          >
            <ng-icon name="heroPlus" class="mr-1 text-[16px]"></ng-icon>
            Add
          </button>
        </div>

        <div class="mt-4 flex items-center gap-3 text-[13px] text-[#777777]">
          <span>{{ countsLabel() }}</span>
        </div>

        <div class="mt-4 space-y-3">
          @if (isLoading()) {
            <p class="py-6 text-[14px] text-[#777777]">Loading categories...</p>
          } @else if (categories().length === 0) {
            <p class="py-6 text-[14px] text-[#777777]">No categories match your current search.</p>
          } @else {
            @for (category of categories(); track category.id) {
              <article class="rounded-[20px] border border-[#EFEFEF] bg-white p-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h2 class="truncate text-[16px] font-semibold text-[#1A1B1D]">{{ category.name }}</h2>
                    <p class="mt-1 text-[12px] text-[#777777]">{{ category.slug }} · {{ labelForLimitType(category.limit_type) }}</p>
                    <p class="mt-1 text-[12px] text-[#777777]">{{ category.listing_count }} listings · {{ category.subcategories.length }} subcategories</p>
                  </div>
                  <div class="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      (click)="openEdit(category)"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ECECEC] bg-white text-[#1A1B1D]"
                      aria-label="Edit category"
                    >
                      <ng-icon name="heroPencilSquare" class="text-[18px]"></ng-icon>
                    </button>
                    <button
                      type="button"
                      (click)="openCreateSubcategory(category)"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F3FF] text-[#6453D9]"
                      aria-label="Add subcategory"
                    >
                      <ng-icon name="heroPlus" class="text-[18px]"></ng-icon>
                    </button>
                    <button
                      type="button"
                      (click)="confirmDelete(category)"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#FDE2E2] bg-white text-[#D14343]"
                      aria-label="Delete category"
                    >
                      <ng-icon name="heroTrash" class="text-[18px]"></ng-icon>
                    </button>
                  </div>
                </div>

                @if (category.subcategories.length > 0) {
                  <div class="mt-4 space-y-2 border-t border-[#F4F4F4] pt-3">
                    @for (subCategory of category.subcategories; track subCategory.id) {
                      <div class="flex items-center justify-between gap-3 rounded-[14px] bg-[#FAFAFA] px-3 py-3">
                        <div class="min-w-0">
                          <p class="truncate text-[14px] font-medium text-[#1A1B1D]">{{ subCategory.name }}</p>
                          <p class="mt-1 text-[12px] text-[#777777]">{{ subCategory.slug }} · {{ subCategory.listing_count }} listings</p>
                        </div>
                        <button
                          type="button"
                          (click)="openEdit(subCategory)"
                          class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ECECEC] bg-white text-[#1A1B1D]"
                          aria-label="Edit subcategory"
                        >
                          <ng-icon name="heroPencilSquare" class="text-[16px]"></ng-icon>
                        </button>
                        <button
                          type="button"
                          (click)="confirmDelete(subCategory)"
                          class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#FDE2E2] bg-white text-[#D14343]"
                          aria-label="Delete subcategory"
                        >
                          <ng-icon name="heroTrash" class="text-[16px]"></ng-icon>
                        </button>
                      </div>
                    }
                  </div>
                }
              </article>
            }
          }
        </div>
      </div>
    </section>

    <section class="hidden h-full flex-col rounded-[24px] border border-[#F4F4F4] bg-white lg:flex">
      <div class="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-5">
        <div>
          <h1 class="text-[24px] font-medium leading-none text-[#0D0D0D]">Categories</h1>
          <p class="mt-2 text-[14px] text-[#777777]">Edit the categories and subcategories used across the marketplace.</p>
        </div>
        <button
          type="button"
          (click)="openCreateParent()"
          class="inline-flex h-10 items-center rounded-full bg-[#6453D9] px-5 text-[14px] font-medium text-white"
        >
          <ng-icon name="heroPlus" class="mr-2 text-[16px]"></ng-icon>
          Add category
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-6">
        <div class="mb-6 flex items-center justify-between gap-4">
          <label class="relative block w-full max-w-[280px]">
            <input
              type="text"
              [value]="searchQuery()"
              (input)="updateSearchQuery($event)"
              placeholder="Search categories"
              class="h-10 w-full rounded-full bg-[#FAFAFA] px-4 text-[14px] text-[#1A1B1D] outline-none placeholder:text-[#777777]"
            >
          </label>

          <div class="flex items-center gap-3 text-[14px] text-[#777777]">
            <span>{{ countsLabel() }}</span>
          </div>
        </div>

        @if (isLoading()) {
          <p class="py-6 text-[14px] text-[#777777]">Loading categories...</p>
        } @else if (categories().length === 0) {
          <p class="py-6 text-[14px] text-[#777777]">No categories match your current search.</p>
        } @else {
          <div class="space-y-4">
            @for (category of categories(); track category.id) {
              <article class="overflow-hidden rounded-[20px] border border-[#EFEFEF] bg-white">
                <div class="flex items-center justify-between gap-4 px-5 py-4">
                  <div class="flex min-w-0 items-center gap-4">
                    <div class="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#F7F7F7]">
                      @if (category.icon_url) {
                        <img [ngSrc]="category.icon_url" [alt]="category.name" width="28" height="28" loading="lazy" class="h-7 w-7 object-contain">
                      } @else {
                        <ng-icon name="heroSquares2x2" class="text-[20px] text-[#777777]"></ng-icon>
                      }
                    </div>
                    <div class="min-w-0">
                      <h2 class="truncate text-[18px] font-semibold text-[#1A1B1D]">{{ category.name }}</h2>
                      <p class="mt-1 text-[13px] text-[#777777]">{{ category.slug }} · {{ labelForLimitType(category.limit_type) }}</p>
                      <p class="mt-1 text-[13px] text-[#777777]">{{ category.listing_count }} listings · {{ category.subcategories.length }} subcategories</p>
                    </div>
                  </div>

                  <div class="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      (click)="openCreateSubcategory(category)"
                      class="inline-flex h-10 items-center rounded-full border border-[#ECECEC] bg-white px-4 text-[14px] font-medium text-[#1A1B1D]"
                    >
                      <ng-icon name="heroPlus" class="mr-2 text-[16px]"></ng-icon>
                      Add subcategory
                    </button>
                    <button
                      type="button"
                      (click)="openEdit(category)"
                      class="inline-flex h-10 items-center rounded-full bg-[#F5F3FF] px-4 text-[14px] font-medium text-[#6453D9]"
                    >
                      <ng-icon name="heroPencilSquare" class="mr-2 text-[16px]"></ng-icon>
                      Edit
                    </button>
                    <button
                      type="button"
                      (click)="confirmDelete(category)"
                      class="inline-flex h-10 items-center rounded-full border border-[#FDE2E2] bg-white px-4 text-[14px] font-medium text-[#D14343]"
                    >
                      <ng-icon name="heroTrash" class="mr-2 text-[16px]"></ng-icon>
                      Delete
                    </button>
                  </div>
                </div>

                @if (category.subcategories.length > 0) {
                  <div class="border-t border-[#F4F4F4] px-5 py-4">
                    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      @for (subCategory of category.subcategories; track subCategory.id) {
                        <div class="flex items-center justify-between gap-3 rounded-[16px] bg-[#FAFAFA] px-4 py-3">
                          <div class="min-w-0">
                            <p class="truncate text-[15px] font-medium text-[#1A1B1D]">{{ subCategory.name }}</p>
                            <p class="mt-1 text-[12px] text-[#777777]">{{ subCategory.slug }} · {{ subCategory.listing_count }} listings</p>
                          </div>
                          <button
                            type="button"
                            (click)="openEdit(subCategory)"
                            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ECECEC] bg-white text-[#1A1B1D]"
                            aria-label="Edit subcategory"
                          >
                            <ng-icon name="heroPencilSquare" class="text-[16px]"></ng-icon>
                          </button>
                          <button
                            type="button"
                            (click)="confirmDelete(subCategory)"
                            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#FDE2E2] bg-white text-[#D14343]"
                            aria-label="Delete subcategory"
                          >
                            <ng-icon name="heroTrash" class="text-[16px]"></ng-icon>
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                }
              </article>
            }
          </div>
        }
      </div>
    </section>

    @if (editorMode(); as mode) {
      <div class="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-4" aria-modal="true" role="dialog">
        <button type="button" class="absolute inset-0" (click)="closeEditor()" aria-label="Close category editor"></button>
        <section class="relative z-[1] w-full max-w-[560px] rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-[24px] font-semibold text-[#1A1B1D]">
                {{ mode === 'edit' ? 'Edit category' : mode === 'create-subcategory' ? 'Add subcategory' : 'Add category' }}
              </h2>
              <p class="mt-2 text-[14px] text-[#777777]">
                {{ mode === 'edit' ? 'Update the selected category details.' : 'Configure the category details used across the platform.' }}
              </p>
            </div>
            <button
              type="button"
              (click)="closeEditor()"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ECECEC] text-[18px] text-[#1A1B1D]"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <form class="mt-6 space-y-5" [formGroup]="categoryForm" (ngSubmit)="submitCategory()">
            <div>
              <label class="mb-2 block text-[14px] font-medium text-[#1A1B1D]" for="category-name">Name</label>
              <input
                id="category-name"
                type="text"
                formControlName="name"
                class="h-12 w-full rounded-[16px] border border-[#ECECEC] px-4 text-[14px] text-[#1A1B1D] outline-none focus:border-[#6453D9]"
              >
            </div>

            <div class="grid gap-5 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-[14px] font-medium text-[#1A1B1D]" for="category-slug">Slug</label>
                <input
                  id="category-slug"
                  type="text"
                  formControlName="slug"
                  class="h-12 w-full rounded-[16px] border border-[#ECECEC] px-4 text-[14px] text-[#1A1B1D] outline-none focus:border-[#6453D9]"
                >
              </div>

              <div>
                <label class="mb-2 block text-[14px] font-medium text-[#1A1B1D]" for="category-limit-type">Limit type</label>
                <select
                  id="category-limit-type"
                  formControlName="limitType"
                  class="h-12 w-full rounded-[16px] border border-[#ECECEC] bg-white px-4 text-[14px] text-[#1A1B1D] outline-none focus:border-[#6453D9]"
                >
                  @for (option of limitTypeOptions; track option.id) {
                    <option [value]="option.id">{{ option.label }}</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-[14px] font-medium text-[#1A1B1D]" for="category-parent">Parent category</label>
              <select
                id="category-parent"
                formControlName="parentId"
                class="h-12 w-full rounded-[16px] border border-[#ECECEC] bg-white px-4 text-[14px] text-[#1A1B1D] outline-none focus:border-[#6453D9]"
              >
                <option value="">No parent (top-level category)</option>
                @for (option of availableParentOptions(); track option.id) {
                  <option [value]="option.id">{{ option.name }}</option>
                }
              </select>
            </div>

            <div>
              <label class="mb-2 block text-[14px] font-medium text-[#1A1B1D]" for="category-icon">Category icon</label>
              <input
                id="category-icon"
                type="file"
                accept="image/*"
                (change)="handleIconSelection($event)"
                class="block w-full text-[14px] text-[#1A1B1D] file:mr-4 file:rounded-full file:border-0 file:bg-[#F5F3FF] file:px-4 file:py-2 file:text-[14px] file:font-medium file:text-[#6453D9]"
              >
              @if (selectedIconName()) {
                <p class="mt-2 text-[12px] text-[#777777]">Selected: {{ selectedIconName() }}</p>
              } @else if (editingCategory()?.icon_url) {
                <p class="mt-2 text-[12px] text-[#777777]">Current icon will be kept unless you choose a new file.</p>
              }
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="closeEditor()"
                class="inline-flex h-11 items-center rounded-full border border-[#ECECEC] px-5 text-[14px] font-medium text-[#1A1B1D]"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="inline-flex h-11 items-center rounded-full bg-[#6453D9] px-5 text-[14px] font-medium text-white disabled:opacity-60"
              >
                {{ isSubmitting() ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create category' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoriesPageComponent {
  private readonly adminCategoriesService = inject(AdminCategoriesService);
  private readonly appToastService = inject(AppToastService);

  readonly searchQuery = signal('');
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly categoriesResponse = signal<{
    results: AdminManagedCategoryRecord[];
    parentOptions: AdminCategoryParentOption[];
    counts: { total: number; topLevel: number; subcategories: number };
  }>({
    results: [],
    parentOptions: [],
    counts: { total: 0, topLevel: 0, subcategories: 0 },
  });
  readonly editorMode = signal<EditorMode>(null);
  readonly editingCategory = signal<AdminManagedCategoryRecord | null>(null);
  readonly selectedIconFile = signal<File | null>(null);
  readonly selectedIconName = signal('');

  readonly categoryForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    slug: new FormControl('', { nonNullable: true }),
    limitType: new FormControl<LimitType>('other', { nonNullable: true, validators: [Validators.required] }),
    parentId: new FormControl('', { nonNullable: true }),
  });

  readonly limitTypeOptions: ReadonlyArray<{ id: LimitType; label: string }> = [
    { id: 'automobile', label: 'Automobile' },
    { id: 'property', label: 'Property' },
    { id: 'other', label: 'Other' },
  ];

  readonly categories = computed(() => this.categoriesResponse().results);
  readonly availableParentOptions = computed(() => {
    const editingCategoryId = this.editingCategory()?.id ?? null;
    return this.categoriesResponse().parentOptions.filter((option) => option.id !== editingCategoryId);
  });
  readonly countsLabel = computed(() => {
    const counts = this.categoriesResponse().counts;
    return `${counts.total} total · ${counts.topLevel} top-level · ${counts.subcategories} subcategories`;
  });

  constructor() {
    this.loadCategories();
  }

  updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.searchQuery.set(input?.value ?? '');
    this.loadCategories();
  }

  openCreateParent(): void {
    this.editorMode.set('create-parent');
    this.editingCategory.set(null);
    this.selectedIconFile.set(null);
    this.selectedIconName.set('');
    this.categoryForm.reset({
      name: '',
      slug: '',
      limitType: 'other',
      parentId: '',
    });
  }

  openCreateSubcategory(parent: AdminManagedCategoryRecord): void {
    this.editorMode.set('create-subcategory');
    this.editingCategory.set(null);
    this.selectedIconFile.set(null);
    this.selectedIconName.set('');
    this.categoryForm.reset({
      name: '',
      slug: '',
      limitType: parent.limit_type,
      parentId: String(parent.id),
    });
  }

  openEdit(category: AdminManagedCategoryRecord): void {
    this.editorMode.set('edit');
    this.editingCategory.set(category);
    this.selectedIconFile.set(null);
    this.selectedIconName.set('');
    this.categoryForm.reset({
      name: category.name,
      slug: category.slug,
      limitType: category.limit_type,
      parentId: category.parent ? String(category.parent) : '',
    });
  }

  closeEditor(): void {
    this.editorMode.set(null);
    this.editingCategory.set(null);
    this.selectedIconFile.set(null);
    this.selectedIconName.set('');
  }

  handleIconSelection(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.item(0) ?? null;
    this.selectedIconFile.set(file);
    this.selectedIconName.set(file?.name ?? '');
  }

  submitCategory(): void {
    if (this.categoryForm.invalid || this.isSubmitting()) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const mode = this.editorMode();
    if (!mode) {
      return;
    }

    const rawValue = this.categoryForm.getRawValue();
    const payload = {
      name: rawValue.name.trim(),
      slug: rawValue.slug.trim(),
      limit_type: rawValue.limitType,
      parent: rawValue.parentId ? Number(rawValue.parentId) : null,
      icon: this.selectedIconFile(),
    };

    this.isSubmitting.set(true);
    const request$ =
      mode === 'edit' && this.editingCategory()
        ? this.adminCategoriesService.updateCategory(this.editingCategory()!.id, payload)
        : this.adminCategoriesService.createCategory(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeEditor();
        this.loadCategories();
        this.appToastService.show({
          message: mode === 'edit' ? 'Category updated successfully.' : 'Category created successfully.',
        });
      },
      error: (error: unknown) => {
        this.isSubmitting.set(false);
        this.appToastService.show({
          message: this.categoryErrorMessage(error, mode === 'edit' ? 'update' : 'create'),
        });
      },
    });
  }

  labelForLimitType(limitType: LimitType): string {
    switch (limitType) {
      case 'automobile':
        return 'Automobile';
      case 'property':
        return 'Property';
      default:
        return 'Other';
    }
  }

  confirmDelete(category: AdminManagedCategoryRecord): void {
    const label = category.parent ? 'subcategory' : 'category';
    const confirmed = globalThis.confirm(
      `Delete ${label} "${category.name}"? We will stop this if it still has linked listings or subcategories.`,
    );

    if (!confirmed) {
      return;
    }

    this.adminCategoriesService.deleteCategory(category.id).subscribe({
      next: (response) => {
        this.loadCategories();
        this.appToastService.show({ message: response.detail || 'Category deleted successfully.' });
      },
      error: (error: unknown) => {
        this.appToastService.show({ message: this.categoryErrorMessage(error, 'delete') });
      },
    });
  }

  private loadCategories(): void {
    this.isLoading.set(true);
    this.adminCategoriesService.getCategories(this.searchQuery()).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.categoriesResponse.set({
          results: response.results,
          parentOptions: response.parent_options,
          counts: {
            total: response.counts.total,
            topLevel: response.counts.top_level,
            subcategories: response.counts.subcategories,
          },
        });
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.categoriesResponse.set({
          results: [],
          parentOptions: [],
          counts: { total: 0, topLevel: 0, subcategories: 0 },
        });
        this.appToastService.show({ message: this.categoryErrorMessage(error, 'load') });
      },
    });
  }

  private categoryErrorMessage(error: unknown, action: 'load' | 'create' | 'update' | 'delete'): string {
    const fallbackMap = {
      load: 'We could not load categories right now.',
      create: 'We could not create this category right now.',
      update: 'We could not update this category right now.',
      delete: 'We could not delete this category right now.',
    } as const;

    if (!(error instanceof HttpErrorResponse)) {
      return fallbackMap[action];
    }

    if (error.status === 403) {
      return 'You do not have permission to manage categories.';
    }

    const detail =
      typeof error.error?.detail === 'string'
        ? error.error.detail
        : typeof error.error?.message === 'string'
          ? error.error.message
          : null;

    return detail ?? fallbackMap[action];
  }
}
