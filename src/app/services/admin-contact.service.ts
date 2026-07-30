import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminContactSubmission {
  id: number | string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AdminContactService {
  private readonly http = inject(HttpClient);
  readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getSubmissions(): Observable<AdminContactSubmission[]> {
    return this.http.get<AdminContactSubmission[]>(`${this.apiUrl}/admin/contact-us/`);
  }

  updateSubmissionStatus(id: number | string, status: 'unread' | 'read' | 'replied'): Observable<AdminContactSubmission> {
    return this.http.patch<AdminContactSubmission>(`${this.apiUrl}/admin/contact-us/${id}/`, { status });
  }
}
