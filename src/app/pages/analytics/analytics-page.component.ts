import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCalendarDays, heroChevronDown } from '@ng-icons/heroicons/outline';

interface SummaryMetric {
  label: string;
  value: string;
}

interface StoreOption {
  id: string;
  name: string;
  logo: string;
}

interface DistributionItem {
  label: string;
  value: string;
  color: string;
}

@Component({
  selector: 'app-analytics-page',
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ heroCalendarDays, heroChevronDown })],
  template: `
    <div class="flex h-full flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
      <div class="flex flex-col gap-4 border-b border-[#F0F0F2] px-8 py-6 lg:flex-row lg:items-center lg:justify-between">
        <h1 class="text-[20px] font-black tracking-tight text-[#1A1C21]">Analytics</h1>

        <button
          type="button"
          (click)="cycleStoreSelection()"
          class="inline-flex items-center gap-3 self-start rounded-full border border-[#ECEEF3] bg-white px-3 py-2.5 shadow-sm transition hover:bg-[#FAFAFC]"
        >
          <div class="flex -space-x-3">
            @for (store of visibleStores(); track store.id) {
              <img
                [src]="store.logo"
                [alt]="store.name"
                class="h-8 w-8 rounded-full border-2 border-white object-cover"
              >
            }
          </div>
          <span class="text-[14px] font-semibold text-[#50555E]">{{ selectedStoreLabel() }}</span>
          <ng-icon name="heroChevronDown" class="text-sm text-[#A4A8B1]"></ng-icon>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
        <div class="grid gap-4 border-b border-[#F0F1F4] pb-5 md:grid-cols-2 xl:grid-cols-4">
          @for (metric of summaryMetrics; track metric.label) {
            <div class="border-[#F0F1F4] xl:border-r last:border-r-0 xl:pr-5">
              <p class="text-[13px] font-medium text-[#9BA0AA]">{{ metric.label }}</p>
              <p class="mt-1 text-[18px] font-black text-[#24262D]">{{ metric.value }}</p>
            </div>
          }
        </div>

        <section class="mt-6 rounded-[28px] border border-[#ECEEF3] bg-white p-4 shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)] sm:p-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p class="text-[13px] font-semibold text-[#A2A7B0]">Total sold items</p>
              <h2 class="mt-1 text-[24px] font-black tracking-tight text-[#1A1C21]">100,500</h2>
              <span class="mt-3 inline-flex rounded-full bg-[#EBF8EF] px-3 py-1 text-[12px] font-semibold text-[#2FB04A]">
                ↑ 28% vs last month
              </span>
            </div>

            <button
              type="button"
              class="inline-flex items-center gap-2 self-start rounded-full border border-[#E7EAF0] bg-white px-4 py-2.5 text-[14px] font-medium text-[#3F444C]"
            >
              <ng-icon name="heroCalendarDays" class="text-base"></ng-icon>
              Last 7 days
              <ng-icon name="heroChevronDown" class="text-sm text-[#9BA0AA]"></ng-icon>
            </button>
          </div>

          <div class="mt-8">
            <svg viewBox="0 0 900 320" class="h-auto w-full overflow-visible">
              <g fill="#A8AEB8" font-size="12" font-weight="500">
                <text x="8" y="258">0</text>
                <text x="0" y="178">250</text>
                <text x="0" y="98">500</text>
              </g>

              @for (month of months; track month.label) {
                <g>
                  <rect
                    [attr.x]="month.x"
                    [attr.y]="240 - month.height"
                    width="38"
                    [attr.height]="month.height"
                    rx="6"
                    [attr.fill]="month.highlight ? '#7A6AE6' : '#DCD9F7'"
                    [attr.opacity]="month.highlight ? '1' : '0.75'"
                  ></rect>
                  <text
                    [attr.x]="month.x + 9"
                    y="274"
                    fill="#A8AEB8"
                    font-size="12"
                    font-weight="500"
                  >
                    {{ month.label }}
                  </text>
                </g>
              }

              <g transform="translate(286,78)">
                <rect width="136" height="32" rx="10" fill="#090909"></rect>
                <circle cx="14" cy="16" r="3" fill="#7A6AE6"></circle>
                <text x="22" y="20" fill="#FFFFFF" font-size="12">Aug 2025</text>
                <text x="102" y="20" fill="#FFFFFF" font-size="12">128</text>
              </g>
            </svg>
          </div>
        </section>

        <div class="mt-5 grid gap-4 xl:grid-cols-3">
          <section class="rounded-[28px] border border-[#ECEEF3] bg-white p-4 shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)] sm:p-6">
            <p class="text-[13px] font-semibold text-[#A2A7B0]">Most viewed listing</p>

            <div class="mt-6 flex flex-col items-center text-center">
              <div class="overflow-hidden rounded-[18px] border border-[#ECEEF3] bg-white shadow-[0_14px_28px_-22px_rgba(17,24,39,0.35)]">
                <img
                  src="https://images.unsplash.com/photo-1696446701796-da61225697cc?w=220&h=260&fit=crop"
                  alt="Most viewed listing"
                  class="h-[112px] w-[82px] object-cover"
                >
              </div>

              <p class="mt-6 text-[16px] font-medium leading-7 text-[#6C717B]">
                This item has been viewed
              </p>
              <p class="text-[20px] font-black text-[#1A1C21]">34,002 times</p>
            </div>
          </section>

          <section class="rounded-[28px] border border-[#ECEEF3] bg-white p-4 shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)] sm:p-6">
            <p class="text-[13px] font-semibold text-[#A2A7B0]">Average response time</p>

            <div class="flex h-full min-h-[230px] flex-col items-center justify-center text-center">
              <h3 class="text-[32px] font-black tracking-tight text-[#111317]">06 hrs</h3>
              <p class="mt-5 max-w-[240px] text-[14px] font-medium leading-6 text-[#9BA0AA]">
                How quickly you respond to buyer inquiries. Faster responses increase your chances of selling.
              </p>
            </div>
          </section>

          <section class="rounded-[28px] border border-[#ECEEF3] bg-white p-4 shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)] sm:p-6">
            <p class="text-[13px] font-semibold text-[#A2A7B0]">Listings distribution</p>

            <div class="mt-5 overflow-hidden rounded-full bg-[#F2F4F8]">
              <div class="flex h-1.5 w-full">
                <span class="w-[48%] bg-[#34B54A]"></span>
                <span class="w-[31%] bg-[#4C86F5]"></span>
                <span class="w-[21%] bg-[#F3A233]"></span>
              </div>
            </div>

            <div class="mt-6 space-y-5">
              @for (item of distributionItems; track item.label) {
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <span class="h-3 w-3 rounded-full" [style.background]="item.color"></span>
                    <span class="text-[14px] font-medium text-[#7A808A]">{{ item.label }}</span>
                  </div>
                  <span class="text-[14px] font-semibold text-[#454A53]">{{ item.value }}</span>
                </div>
              }
            </div>

            <button type="button" class="mt-7 text-[15px] font-semibold text-[#6B5CF0] underline underline-offset-2">
              View more
            </button>
          </section>
        </div>
      </div>
    </div>
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPageComponent {
  readonly stores: StoreOption[] = [
    {
      id: 'store-1',
      name: 'The Vine Collections',
      logo: 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png',
    },
    {
      id: 'store-2',
      name: 'Eden Organics',
      logo: 'https://cdn-icons-png.flaticon.com/512/1047/1047648.png',
    },
    {
      id: 'store-3',
      name: 'Amazing Fragrances',
      logo: 'https://cdn-icons-png.flaticon.com/512/3126/3126040.png',
    },
    {
      id: 'store-4',
      name: 'The Gift Shop',
      logo: 'https://cdn-icons-png.flaticon.com/512/2813/2813401.png',
    },
  ];

  readonly selectedStoreMode = signal<'all' | 'single'>('all');

  readonly summaryMetrics: SummaryMetric[] = [
    { label: 'Total listings', value: '108' },
    { label: 'Total views', value: '750,000' },
    { label: 'Total saves', value: '562' },
    { label: 'Total messages', value: '24' },
  ];

  readonly months = [
    { label: 'Jan', x: 34, height: 90, highlight: false },
    { label: 'Feb', x: 108, height: 64, highlight: false },
    { label: 'Mar', x: 182, height: 38, highlight: false },
    { label: 'Apr', x: 256, height: 58, highlight: false },
    { label: 'May', x: 330, height: 128, highlight: true },
    { label: 'Jun', x: 404, height: 62, highlight: false },
    { label: 'Jul', x: 478, height: 90, highlight: false },
    { label: 'Aug', x: 552, height: 92, highlight: false },
    { label: 'Sep', x: 626, height: 62, highlight: false },
    { label: 'Oct', x: 700, height: 68, highlight: false },
    { label: 'Nov', x: 774, height: 54, highlight: false },
    { label: 'Dec', x: 848, height: 92, highlight: false },
  ];

  readonly distributionItems: DistributionItem[] = [
    { label: 'Sold', value: '2,000,000', color: '#34B54A' },
    { label: 'Available', value: '1,200,000', color: '#4C86F5' },
    { label: 'Paused', value: '800,000', color: '#F3A233' },
  ];

  readonly visibleStores = computed(() =>
    this.selectedStoreMode() === 'all' ? this.stores.slice(0, 3) : [this.stores[0]],
  );

  readonly selectedStoreLabel = computed(() =>
    this.selectedStoreMode() === 'all' ? 'All stores (4)' : 'The Vine Collections',
  );

  cycleStoreSelection(): void {
    this.selectedStoreMode.update(mode => (mode === 'all' ? 'single' : 'all'));
  }
}
