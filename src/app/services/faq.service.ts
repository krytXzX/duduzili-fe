import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FAQItem {
  id?: number;
  title: string;
  content: string;
  user_type: 'Buyers' | 'Sellers';
  status: 'Published' | 'Draft' | 'Archived';
  author_name?: string;
  author_email?: string;
  author_avatar?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FaqService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/faqs/`;

  getFaqs(params?: { status?: string; user_type?: string; search?: string }): Observable<FAQItem[]> {
    return this.http.get<FAQItem[]>(this.apiUrl, { params: params as any });
  }

  createFaq(faq: FAQItem): Observable<FAQItem> {
    return this.http.post<FAQItem>(this.apiUrl, faq);
  }

  updateFaq(id: number, faq: Partial<FAQItem>): Observable<FAQItem> {
    return this.http.patch<FAQItem>(`${this.apiUrl}${id}/`, faq);
  }

  deleteFaq(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
