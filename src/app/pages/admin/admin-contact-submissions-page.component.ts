import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminContactService, AdminContactSubmission } from '../../services/admin-contact.service';
import { AppToastService } from '../../services/app-toast.service';

@Component({
  selector: 'app-admin-contact-submissions-page',
  imports: [DatePipe],
  template: `
    <div class="px-4 py-6 sm:px-8 sm:py-8">
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Contact Submissions</h1>
          <p class="mt-1 text-sm text-gray-500">View and manage messages from the contact form.</p>
        </div>
      </div>

      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead class="bg-gray-50 text-gray-500">
              <tr>
                <th scope="col" class="px-6 py-4 font-semibold uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-4 font-semibold uppercase tracking-wider">Name</th>
                <th scope="col" class="px-6 py-4 font-semibold uppercase tracking-wider">Email</th>
                <th scope="col" class="px-6 py-4 font-semibold uppercase tracking-wider">Message</th>
                <th scope="col" class="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              @for (submission of submissions(); track submission.id) {
                <tr class="transition-colors hover:bg-gray-50">
                  <td class="whitespace-nowrap px-6 py-4 text-gray-500">
                    {{ submission.created_at | date: 'mediumDate' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    {{ submission.name }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-gray-500">
                    {{ submission.email }}
                  </td>
                  <td class="max-w-xs truncate px-6 py-4 text-gray-500" [title]="submission.message">
                    {{ submission.message }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4">
                    <span
                      class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      [class.bg-yellow-100]="submission.status === 'unread'"
                      [class.text-yellow-800]="submission.status === 'unread'"
                      [class.bg-blue-100]="submission.status === 'read'"
                      [class.text-blue-800]="submission.status === 'read'"
                      [class.bg-green-100]="submission.status === 'replied'"
                      [class.text-green-800]="submission.status === 'replied'"
                    >
                      {{ submission.status }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right">
                    <select
                      class="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      [value]="submission.status"
                      (change)="updateStatus(submission, $event)"
                      [disabled]="isUpdating() === submission.id"
                    >
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                    </select>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No contact submissions found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContactSubmissionsPageComponent implements OnInit {
  private readonly adminContactService = inject(AdminContactService);
  private readonly toastService = inject(AppToastService);

  readonly submissions = signal<AdminContactSubmission[]>([]);
  readonly isLoading = signal(false);
  readonly isUpdating = signal<string | number | null>(null);

  ngOnInit(): void {
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.isLoading.set(true);
    this.adminContactService.getSubmissions().subscribe({
      next: (data) => {
        this.submissions.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.show({ message: 'Failed to load submissions' });
      },
    });
  }

  updateStatus(submission: AdminContactSubmission, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as 'unread' | 'read' | 'replied';

    this.isUpdating.set(submission.id);
    this.adminContactService.updateSubmissionStatus(submission.id, newStatus).subscribe({
      next: (updated) => {
        this.submissions.update((subs) =>
          subs.map((sub) => (sub.id === updated.id ? updated : sub))
        );
        this.isUpdating.set(null);
        this.toastService.show({ message: 'Status updated successfully' });
      },
      error: () => {
        select.value = submission.status;
        this.isUpdating.set(null);
        this.toastService.show({ message: 'Failed to update status' });
      },
    });
  }
}
