import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppChartComponent, AppChartOptions } from '../../components/charts/app-chart.component';
import { createSparkBarChartOptions } from '../../components/charts/chart-mock-data';

interface TodoItem {
  id: string;
  title: string;
  sender: string;
  period: 'today' | 'yesterday';
  icon: 'banner' | 'kyc';
}

interface PaymentItem {
  id: string;
  name: string;
  plan: string;
  amount: string;
  date: string;
  initials: string;
  avatarBackground: string;
}

interface ActivityItem {
  id: string;
  subject: string;
  actor: string;
  period: 'today' | 'previous';
  timeAgo: string;
  icon: 'kyc' | 'signup' | 'listing' | 'review';
}

@Component({
  selector: 'app-admin-dashboard-home-page',
  imports: [AppChartComponent],
  template: `
    <section class="flex min-h-full flex-col">
      <header class="border-b border-[#EEF0F4] px-6 py-6 sm:px-8">
        <h1 class="text-[20px] font-semibold tracking-[-0.03em] text-[#1A1C21]">Home</h1>
      </header>

      <div class="flex flex-1 flex-col px-4 py-5 sm:px-8 sm:py-6">
        <div>
          <h2 class="text-[28px] font-semibold leading-none tracking-[-0.05em] text-[#1A1C21] sm:text-[34px]">
            <span class="text-[#A5A7AE]">Welcome back,</span> Bryan 👋🏻
          </h2>
          <p class="mt-3 text-[14px] font-medium text-[#8E9199]">Here is what’s going on today</p>
        </div>

        <div class="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <section class="rounded-[26px] bg-[#FAFAFB] p-4 sm:p-5">
            <div class="flex items-center gap-2">
              <h3 class="text-[16px] font-semibold tracking-[-0.03em] text-[#1A1C21]">Things to do</h3>
              <span class="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#6B5CF0] px-2 text-[12px] font-semibold text-white">
                {{ todoItems().length }}
              </span>
            </div>

            <div class="mt-4 rounded-[22px] border border-[#E8EAF0] bg-white p-5">
              <div class="mb-3 flex items-center gap-3">
                <span class="text-[12px] font-medium uppercase tracking-[0.08em] text-[#9AA0AA]">Today</span>
                <span class="h-px flex-1 bg-[#E6E8EE]"></span>
              </div>

              @for (item of todayTodoItems(); track item.id) {
                <div class="flex items-start gap-4 py-4">
                  <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E8EAF0] bg-white text-[#666B75]">
                    @if (item.icon === 'banner') {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M4 3.75A1.75 1.75 0 015.75 2h8.5A1.75 1.75 0 0116 3.75v8.5A1.75 1.75 0 0114.25 14h-8.5A1.75 1.75 0 014 12.25v-8.5zm1.75-.25a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-8.5a.25.25 0 00-.25-.25h-8.5z"/><path d="M6.25 11.25l2.2-2.45a.75.75 0 011.08-.03l1.28 1.28.82-.96a.75.75 0 011.14.98l-1.35 1.58a.75.75 0 01-1.11.06l-1.35-1.35-1.66 1.85a.75.75 0 01-1.12-1z"/><path d="M8 6.75a1 1 0 11-2 0 1 1 0 012 0z"/>
                      </svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10 2a.75.75 0 01.75.75V4h2.5A1.75 1.75 0 0115 5.75v8.5A1.75 1.75 0 0113.25 16h-6.5A1.75 1.75 0 015 14.25v-8.5A1.75 1.75 0 016.75 4h2.5V2.75A.75.75 0 0110 2zm3.25 3.5h-6.5a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h6.5a.25.25 0 00.25-.25v-8.5a.25.25 0 00-.25-.25z"/><path d="M8.25 8.5a.75.75 0 010-1.5h3.5a.75.75 0 010 1.5h-3.5zm0 3a.75.75 0 010-1.5h2a.75.75 0 010 1.5h-2z"/>
                      </svg>
                    }
                  </span>
                  <div class="min-w-0">
                    <p class="text-[14px] font-semibold text-[#1A1C21] sm:text-[15px]">{{ item.title }}</p>
                    <div class="mt-2 flex items-center gap-2">
                      <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#E7F4FF] text-[10px] font-semibold text-[#1A1C21]">
                        MJ
                      </span>
                      <span class="text-[13px] font-medium text-[#8E9199]">From {{ item.sender }}</span>
                    </div>
                  </div>
                </div>
              }

              <div class="my-3 flex items-center gap-3">
                <span class="text-[12px] font-medium text-[#9AA0AA]">Yesterday</span>
                <span class="h-px flex-1 bg-[#E6E8EE]"></span>
              </div>

              @for (item of yesterdayTodoItems(); track item.id) {
                <div class="flex items-start gap-4 py-4 last:pb-0">
                  <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E8EAF0] bg-white text-[#666B75]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M4 3.75A1.75 1.75 0 015.75 2h8.5A1.75 1.75 0 0116 3.75v8.5A1.75 1.75 0 0114.25 14h-8.5A1.75 1.75 0 014 12.25v-8.5zm1.75-.25a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-8.5a.25.25 0 00-.25-.25h-8.5z"/><path d="M6.25 11.25l2.2-2.45a.75.75 0 011.08-.03l1.28 1.28.82-.96a.75.75 0 011.14.98l-1.35 1.58a.75.75 0 01-1.11.06l-1.35-1.35-1.66 1.85a.75.75 0 01-1.12-1z"/><path d="M8 6.75a1 1 0 11-2 0 1 1 0 012 0z"/>
                    </svg>
                  </span>
                  <div class="min-w-0">
                    <p class="text-[14px] font-semibold text-[#1A1C21] sm:text-[15px]">{{ item.title }}</p>
                    <div class="mt-2 flex items-center gap-2">
                      <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#E7F4FF] text-[10px] font-semibold text-[#1A1C21]">
                        MJ
                      </span>
                      <span class="text-[13px] font-medium text-[#8E9199]">From {{ item.sender }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>

          <section class="flex flex-col rounded-[26px] bg-[#FAFAFB] p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-[16px] font-semibold tracking-[-0.03em] text-[#A5A7AE]">Subscription earnings</h3>
                <p class="mt-4 text-[34px] font-semibold tracking-[-0.05em] text-[#1A1C21] sm:text-[44px]">
                  ₦ 1,760,000<span class="text-[#A5A7AE]">.00</span>
                </p>
                <span class="mt-3 inline-flex rounded-full bg-[#E9F8EC] px-3 py-1 text-[14px] font-medium text-[#2FB04A]">
                  +28% from last month
                </span>
              </div>
              <button type="button" class="text-[15px] font-medium text-[#1A1C21] underline underline-offset-4">
                See details
              </button>
            </div>

            <div class="mt-auto pt-10">
              <app-chart [config]="subscriptionEarningsChartOptions" containerClass="min-h-[240px]"></app-chart>
            </div>
          </section>
        </div>

        <div class="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <section class="rounded-[26px] bg-[#FAFAFB] p-5">
            <div class="flex items-center justify-between gap-4">
              <h3 class="text-[16px] font-semibold tracking-[-0.03em] text-[#1A1C21]">Subscription payments</h3>
              <button type="button" class="text-[15px] font-medium text-[#1A1C21] underline underline-offset-4">
                View all
              </button>
            </div>

            <div class="mt-4 border-t border-[#E6E8EE] pt-4">
              @for (payment of payments(); track payment.id) {
                <div class="flex items-center justify-between gap-4 py-4">
                  <div class="flex min-w-0 items-center gap-3">
                    <span
                      class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-[#1A1C21]"
                      [style.background]="payment.avatarBackground"
                    >
                      {{ payment.initials }}
                      <span class="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white text-[#7C818A]">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M10.75 3.5a.75.75 0 00-1.5 0v7.19L6.53 7.97a.75.75 0 10-1.06 1.06l4 4a.75.75 0 001.06 0l4-4a.75.75 0 10-1.06-1.06l-2.72 2.72V3.5z"/>
                        </svg>
                      </span>
                    </span>
                    <div class="min-w-0">
                      <p class="truncate text-[16px] font-medium text-[#1A1C21]">{{ payment.name }}</p>
                      <p class="mt-1 truncate text-[13px] font-medium text-[#9AA0AA]">
                        {{ payment.date }} · {{ payment.plan }}
                      </p>
                    </div>
                  </div>
                  <p class="text-[16px] font-semibold text-[#1A1C21]">{{ payment.amount }}</p>
                </div>
              }
            </div>
          </section>

          <section class="rounded-[26px] bg-[#FAFAFB] p-5">
            <div class="flex items-center justify-between gap-4">
              <h3 class="text-[16px] font-semibold tracking-[-0.03em] text-[#1A1C21]">Recent activities</h3>
            </div>

            <div class="mt-4 border-t border-[#E6E8EE] pt-4">
              <div class="flex items-center gap-3">
                <span class="text-[12px] font-medium uppercase tracking-[0.08em] text-[#9AA0AA]">Today</span>
                <span class="h-px flex-1 bg-[#E6E8EE]"></span>
              </div>

              @for (activity of todayActivities(); track activity.id) {
                <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-4">
                  <span class="flex h-7 w-7 items-center justify-center rounded-full border border-[#E8EAF0] bg-white text-[#B6BAC2]">
                    @switch (activity.icon) {
                      @case ('kyc') {
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a.75.75 0 01.75.75V4h2.5A1.75 1.75 0 0115 5.75v8.5A1.75 1.75 0 0113.25 16h-6.5A1.75 1.75 0 015 14.25v-8.5A1.75 1.75 0 016.75 4h2.5V2.75A.75.75 0 0110 2zm3.25 3.5h-6.5a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h6.5a.25.25 0 00.25-.25v-8.5a.25.25 0 00-.25-.25z"/><path d="M8.25 8.5a.75.75 0 010-1.5h3.5a.75.75 0 010 1.5h-3.5zm0 3a.75.75 0 010-1.5h2a.75.75 0 010 1.5h-2z"/></svg>
                      }
                      @case ('signup') {
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a3 3 0 110 6 3 3 0 010-6zM4.75 15a5.25 5.25 0 1110.5 0 .75.75 0 01-1.5 0 3.75 3.75 0 10-7.5 0 .75.75 0 01-1.5 0z"/></svg>
                      }
                      @default {
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4.75A1.75 1.75 0 015.75 3h8.5A1.75 1.75 0 0116 4.75v10.5A1.75 1.75 0 0114.25 17h-8.5A1.75 1.75 0 014 15.25V4.75zM5.75 4.5a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V4.75a.25.25 0 00-.25-.25h-8.5z"/></svg>
                      }
                    }
                  </span>
                  <p class="text-[14px] font-medium text-[#9AA0AA]">
                    {{ activity.subject }} by
                    <span class="font-semibold text-[#1A1C21]">{{ activity.actor }}</span>
                  </p>
                  <span class="text-[14px] font-medium text-[#8E9199]">{{ activity.timeAgo }}</span>
                </div>
              }

              <div class="mt-1 flex items-center gap-3">
                <span class="text-[12px] font-medium uppercase tracking-[0.08em] text-[#9AA0AA]">Previous activity</span>
                <span class="h-px flex-1 bg-[#E6E8EE]"></span>
              </div>

              @for (activity of previousActivities(); track activity.id) {
                <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-4">
                  <span class="flex h-7 w-7 items-center justify-center rounded-full border border-[#E8EAF0] bg-white text-[#B6BAC2]">
                    @if (activity.icon === 'listing') {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4.75A1.75 1.75 0 015.75 3h8.5A1.75 1.75 0 0116 4.75v10.5A1.75 1.75 0 0114.25 17h-8.5A1.75 1.75 0 014 15.25V4.75zM5.75 4.5a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V4.75a.25.25 0 00-.25-.25h-8.5z"/><path d="M6.5 7.25a.75.75 0 010-1.5h7a.75.75 0 010 1.5h-7zm0 3a.75.75 0 010-1.5h7a.75.75 0 010 1.5h-7zm0 3a.75.75 0 010-1.5h4a.75.75 0 010 1.5h-4z"/></svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2.75a.75.75 0 01.75.75v.55a4.502 4.502 0 013.7 3.7h.55a.75.75 0 010 1.5h-.55a4.502 4.502 0 01-3.7 3.7v.55a.75.75 0 01-1.5 0v-.55a4.502 4.502 0 01-3.7-3.7h-.55a.75.75 0 010-1.5h.55a4.502 4.502 0 013.7-3.7v-.55A.75.75 0 0110 2.75zm0 2.75a3 3 0 100 6 3 3 0 000-6z"/></svg>
                    }
                  </span>
                  <p class="text-[14px] font-medium text-[#9AA0AA]">
                    {{ activity.subject }} by
                    <span class="font-semibold text-[#1A1C21]">{{ activity.actor }}</span>
                  </p>
                  <span class="text-[14px] font-medium text-[#8E9199]">{{ activity.timeAgo }}</span>
                </div>
              }
            </div>
          </section>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardHomePageComponent {
  readonly subscriptionEarningsChartOptions: AppChartOptions = createSparkBarChartOptions(
    240,
    ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    [94, 102, 134, 188, 134],
    ['#DAD7F7', '#DAD7F7', '#DAD7F7', '#6B5CF0', '#DAD7F7'],
    false,
  );
  readonly todoItems = signal<TodoItem[]>([
    {
      id: 'todo-1',
      title: 'Ad banner approval',
      sender: 'Mary Jane',
      period: 'today',
      icon: 'banner',
    },
    {
      id: 'todo-2',
      title: 'KYC approval request',
      sender: 'Mary Jane',
      period: 'today',
      icon: 'kyc',
    },
    {
      id: 'todo-3',
      title: 'Ad banner approval',
      sender: 'Mary Jane',
      period: 'yesterday',
      icon: 'banner',
    },
  ]);

  readonly payments = signal<PaymentItem[]>([
    {
      id: 'payment-1',
      name: 'Mary Jane',
      plan: 'Enterprise plan',
      amount: '₦1,434',
      date: '25 August, 2025',
      initials: 'MJ',
      avatarBackground: 'linear-gradient(135deg, #BFE2FF 0%, #77B1FF 100%)',
    },
    {
      id: 'payment-2',
      name: 'Michael Berry',
      plan: 'Pro Plan',
      amount: '₦1,434',
      date: '25 August, 2025',
      initials: 'MB',
      avatarBackground: 'linear-gradient(135deg, #FFD29B 0%, #FFB84C 100%)',
    },
    {
      id: 'payment-3',
      name: 'Frank Ocean',
      plan: 'Pro Plan',
      amount: '₦1,434',
      date: '25 August, 2025',
      initials: 'FO',
      avatarBackground: 'linear-gradient(135deg, #C8D8F7 0%, #8FB1E8 100%)',
    },
  ]);

  readonly activities = signal<ActivityItem[]>([
    {
      id: 'activity-1',
      subject: 'KYC request sent',
      actor: 'Adenbisi Opeyemi',
      period: 'today',
      timeAgo: '5 mins ago',
      icon: 'kyc',
    },
    {
      id: 'activity-2',
      subject: 'New user sign up',
      actor: 'Nduka Obasi',
      period: 'today',
      timeAgo: '1 hour ago',
      icon: 'signup',
    },
    {
      id: 'activity-3',
      subject: 'New listing created',
      actor: 'Ediri Oghenemaro',
      period: 'previous',
      timeAgo: '5 mins ago',
      icon: 'listing',
    },
    {
      id: 'activity-4',
      subject: 'Review left on seller',
      actor: 'William Funmilayo',
      period: 'previous',
      timeAgo: '1 hour ago',
      icon: 'review',
    },
  ]);

  todayTodoItems(): TodoItem[] {
    return this.todoItems().filter((item) => item.period === 'today');
  }

  yesterdayTodoItems(): TodoItem[] {
    return this.todoItems().filter((item) => item.period === 'yesterday');
  }

  todayActivities(): ActivityItem[] {
    return this.activities().filter((item) => item.period === 'today');
  }

  previousActivities(): ActivityItem[] {
    return this.activities().filter((item) => item.period === 'previous');
  }
}
