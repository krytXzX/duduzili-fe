import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AppChartComponent, AppChartOptions } from '../../components/charts/app-chart.component';
import {
  AdminDashboardService,
  AdminHomeActivity,
  AdminHomeDashboardResponse,
  AdminHomePayment,
  AdminHomeTodoItem,
} from '../../services/admin-dashboard.service';

interface PaymentItem extends AdminHomePayment {
  avatarBackground: string;
  formattedAmount: string;
  formattedDate: string;
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
            <span class="text-[#A5A7AE]">Welcome back,</span> {{ displayName() }} 👋🏻
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
              @if (todoItems().length === 0) {
                <p class="py-8 text-[14px] font-medium text-[#8E9199]">No pending admin actions right now.</p>
              } @else {
                <div class="mb-3 flex items-center gap-3">
                  <span class="text-[12px] font-medium uppercase tracking-[0.08em] text-[#9AA0AA]">Today</span>
                  <span class="h-px flex-1 bg-[#E6E8EE]"></span>
                </div>

                @for (item of todayTodoItems(); track item.id) {
                  <button
                    type="button"
                    (click)="goToTodoItem(item)"
                    class="flex w-full items-start gap-4 rounded-[18px] py-4 text-left transition hover:bg-[#F7F8FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453D9]"
                  >
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
                          {{ item.sender_initials }}
                        </span>
                        <span class="text-[13px] font-medium text-[#8E9199]">From {{ item.sender }}</span>
                      </div>
                    </div>
                  </button>
                }

                @if (yesterdayTodoItems().length > 0) {
                  <div class="my-3 flex items-center gap-3">
                    <span class="text-[12px] font-medium text-[#9AA0AA]">Yesterday</span>
                    <span class="h-px flex-1 bg-[#E6E8EE]"></span>
                  </div>

                  @for (item of yesterdayTodoItems(); track item.id) {
                    <button
                      type="button"
                      (click)="goToTodoItem(item)"
                      class="flex w-full items-start gap-4 rounded-[18px] py-4 text-left transition hover:bg-[#F7F8FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453D9] last:pb-0"
                    >
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
                            {{ item.sender_initials }}
                          </span>
                          <span class="text-[13px] font-medium text-[#8E9199]">From {{ item.sender }}</span>
                        </div>
                      </div>
                    </button>
                  }
                }
              }
            </div>
          </section>

          <section class="flex flex-col rounded-[26px] bg-[#FAFAFB] p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-[16px] font-semibold tracking-[-0.03em] text-[#A5A7AE]">Subscription earnings</h3>
                <p class="mt-4 text-[34px] font-semibold tracking-[-0.05em] text-[#1A1C21] sm:text-[44px]">
                  {{ formattedEarningsWhole() }}<span class="text-[#A5A7AE]">{{ formattedEarningsFraction() }}</span>
                </p>
                <span
                  class="mt-3 inline-flex rounded-full px-3 py-1 text-[14px] font-medium"
                  [class]="earningsChangePillClass()"
                >
                  {{ earningsChangeLabel() }}
                </span>
              </div>
              <button
                type="button"
                (click)="goToSubscriptionTransactions()"
                class="text-[15px] font-medium text-[#1A1C21] underline underline-offset-4"
              >
                See details
              </button>
            </div>

            <div class="mt-auto pt-10">
              <app-chart
                [config]="subscriptionEarningsChartOptions()"
                [suppressGeneratedTitle]="true"
                containerClass="min-h-[240px]"
              ></app-chart>
            </div>
          </section>
        </div>

        <div class="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <section class="rounded-[26px] bg-[#FAFAFB] p-5">
            <div class="flex items-center justify-between gap-4">
              <h3 class="text-[16px] font-semibold tracking-[-0.03em] text-[#1A1C21]">Subscription payments</h3>
              <button
                type="button"
                (click)="goToSubscriptionTransactions()"
                class="text-[15px] font-medium text-[#1A1C21] underline underline-offset-4"
              >
                View all
              </button>
            </div>

            <div class="mt-4 border-t border-[#E6E8EE] pt-4">
              @if (payments().length === 0) {
                <p class="py-8 text-[14px] font-medium text-[#8E9199]">No subscription payments yet.</p>
              } @else {
                @for (payment of payments(); track payment.id) {
                  <button
                    type="button"
                    (click)="goToSubscriptionTransactions()"
                    class="flex w-full items-center justify-between gap-4 rounded-[18px] py-4 text-left transition hover:bg-[#F7F8FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453D9]"
                  >
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
                          {{ payment.formattedDate }} · {{ payment.plan }}
                        </p>
                      </div>
                    </div>
                    <p class="text-[16px] font-semibold text-[#1A1C21]">{{ payment.formattedAmount }}</p>
                  </button>
                }
              }
            </div>
          </section>

          <section class="rounded-[26px] bg-[#FAFAFB] p-5">
            <div class="flex items-center justify-between gap-4">
              <h3 class="text-[16px] font-semibold tracking-[-0.03em] text-[#1A1C21]">Recent activities</h3>
            </div>

            <div class="mt-4 border-t border-[#E6E8EE] pt-4">
              @if (activities().length === 0) {
                <p class="py-8 text-[14px] font-medium text-[#8E9199]">No recent admin activities yet.</p>
              } @else {
                <div class="flex items-center gap-3">
                  <span class="text-[12px] font-medium uppercase tracking-[0.08em] text-[#9AA0AA]">Today</span>
                  <span class="h-px flex-1 bg-[#E6E8EE]"></span>
                </div>

                @for (activity of todayActivities(); track activity.id) {
                  <button
                    type="button"
                    (click)="goToActivity(activity)"
                    class="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] py-4 text-left transition hover:bg-[#F7F8FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453D9]"
                  >
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
                    <span class="text-[14px] font-medium text-[#8E9199]">{{ activity.time_ago }}</span>
                  </button>
                }

                @if (previousActivities().length > 0) {
                  <div class="mt-1 flex items-center gap-3">
                    <span class="text-[12px] font-medium uppercase tracking-[0.08em] text-[#9AA0AA]">Previous activity</span>
                    <span class="h-px flex-1 bg-[#E6E8EE]"></span>
                  </div>

                  @for (activity of previousActivities(); track activity.id) {
                    <button
                      type="button"
                      (click)="goToActivity(activity)"
                      class="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] py-4 text-left transition hover:bg-[#F7F8FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453D9]"
                    >
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
                      <span class="text-[14px] font-medium text-[#8E9199]">{{ activity.time_ago }}</span>
                    </button>
                  }
                }
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
  private readonly adminDashboardService = inject(AdminDashboardService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly dashboard = signal<AdminHomeDashboardResponse | null>(null);

  readonly displayName = computed(() => this.dashboard()?.admin_user.display_name ?? 'Admin');
  readonly todoItems = computed(() => this.dashboard()?.todo_items ?? []);
  readonly payments = computed<PaymentItem[]>(() =>
    (this.dashboard()?.payments ?? []).map((payment) => ({
      ...payment,
      avatarBackground: this.avatarBackground(payment.initials),
      formattedAmount: this.formatCurrency(payment.amount),
      formattedDate: this.formatDate(payment.date),
    })),
  );
  readonly activities = computed(() => this.dashboard()?.activities ?? []);
  readonly todayTodoItems = computed(() => this.todoItems().filter((item) => item.period === 'today'));
  readonly yesterdayTodoItems = computed(() =>
    this.todoItems().filter((item) => item.period === 'yesterday'),
  );
  readonly todayActivities = computed(() =>
    this.activities().filter((item) => item.period === 'today'),
  );
  readonly previousActivities = computed(() =>
    this.activities().filter((item) => item.period === 'previous'),
  );
  readonly earnings = computed(() => this.dashboard()?.subscription_earnings ?? null);
  readonly formattedEarnings = computed(() => this.formatCurrency(this.earnings()?.total_earnings ?? 0));
  readonly formattedEarningsWhole = computed(() => this.formattedEarnings().split('.')[0] ?? '₦0');
  readonly formattedEarningsFraction = computed(() => {
    const parts = this.formattedEarnings().split('.');
    return parts.length > 1 ? `.${parts[1]}` : '.00';
  });
  readonly earningsChangeValue = computed(() => this.earnings()?.earnings_change_percent ?? 0);
  readonly earningsChangeLabel = computed(() => {
    const change = this.earningsChangeValue();
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${this.formatPercent(change)} from last month`;
  });
  readonly earningsChangePillClass = computed(() =>
    this.earningsChangeValue() >= 0
      ? 'bg-[#E9F8EC] text-[#2FB04A]'
      : 'bg-[#FFF0F0] text-[#D14343]',
  );
  readonly subscriptionEarningsChartOptions = computed<AppChartOptions>(() => {
    const comparisonChart = this.earnings()?.comparison_chart ?? [];
    const categories = comparisonChart.map((item) => item.month_label.split(' ')[0]);
    const values = comparisonChart.map((item) => item.current_year);
    const highlightedIndex = values.reduce(
      (maxIndex, value, index, array) => (value > array[maxIndex] ? index : maxIndex),
      0,
    );
    const colors = values.map((_, index) => (index === highlightedIndex ? '#6B5CF0' : '#DAD7F7'));

    return {
      series: [
        {
          name: 'Subscription earnings',
          data: values.length > 0 ? values : [0],
        },
      ],
      chart: {
        type: 'bar',
        height: 240,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: false },
        fontFamily: 'inherit',
      },
      plotOptions: {
        bar: {
          distributed: true,
          columnWidth: '72%',
          borderRadius: 6,
        },
      },
      colors: colors.length > 0 ? colors : ['#DAD7F7'],
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: {
        borderColor: '#ECECEC',
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: false } },
        padding: { left: 4, right: 4 },
      },
      xaxis: {
        categories: categories.length > 0 ? categories : ['Now'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: (categories.length > 0 ? categories : ['Now']).map(() => 'rgba(0,0,0,0.5)'),
            fontSize: '10px',
            fontWeight: '500',
          },
        },
      },
      yaxis: {
        min: 0,
        max: Math.max(...values, 1) * 1.15,
        tickAmount: 3,
        labels: {
          formatter: (value: number) => this.formatShortCurrency(value),
          style: {
            colors: ['#A5AAB3'],
            fontSize: '10px',
            fontWeight: '500',
          },
        },
      },
      tooltip: {
        enabled: true,
        theme: 'dark',
        y: {
          formatter: (value: number) => this.formatCurrency(value),
        },
      },
      states: {
        hover: {
          filter: { type: 'darken' },
        },
        active: {
          filter: { type: 'none' },
        },
      },
    };
  });

  constructor() {
    this.adminDashboardService
      .getHomeDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.dashboard.set(response);
      });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  private formatShortCurrency(value: number): string {
    if (value >= 1_000_000) {
      return `₦${(value / 1_000_000).toFixed(1)}m`;
    }
    if (value >= 1_000) {
      return `₦${(value / 1_000).toFixed(0)}k`;
    }
    return `₦${Math.round(value)}`;
  }

  private formatDate(value: string): string {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parsedDate);
  }

  private formatPercent(value: number): string {
    return `${Math.abs(Math.round(value))}%`;
  }

  private avatarBackground(initials: string): string {
    const palette = [
      'linear-gradient(135deg, #BFE2FF 0%, #77B1FF 100%)',
      'linear-gradient(135deg, #FFD29B 0%, #FFB84C 100%)',
      'linear-gradient(135deg, #C8D8F7 0%, #8FB1E8 100%)',
      'linear-gradient(135deg, #D6F5D0 0%, #7ED77B 100%)',
      'linear-gradient(135deg, #F8C6D8 0%, #E98AB1 100%)',
    ];
    const seed = Array.from(initials).reduce((sum, character) => sum + character.charCodeAt(0), 0);
    return palette[seed % palette.length];
  }

  protected goToTodoItem(item: AdminHomeTodoItem): void {
    const target = item.icon === 'banner' ? '/admin/ads/approvals' : '/admin/kyc-requests';
    void this.router.navigateByUrl(target);
  }

  protected goToSubscriptionTransactions(): void {
    void this.router.navigateByUrl('/admin/ads/transactions');
  }

  protected goToActivity(activity: AdminHomeActivity): void {
    void this.router.navigateByUrl(this.resolveActivityRoute(activity));
  }

  private resolveActivityRoute(activity: AdminHomeActivity): string {
    switch (activity.icon) {
      case 'kyc':
        return '/admin/kyc-requests';
      case 'signup':
        return '/admin/users';
      case 'listing':
        return '/admin/listings';
      default:
        return '/admin/audit-log';
    }
  }
}
