import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthSessionService } from '../../services/auth-session.service';

type AdminMoreItem = {
  label: string;
  route: string;
  icon: string;
  iconBackground: string;
};

@Component({
  selector: 'app-admin-more-page',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <section class="min-h-full bg-[#F4F4F4] px-5 pb-8 pt-2 lg:bg-[#F9FAFB] lg:px-8 lg:pt-8">
      <div class="flex h-[54px] items-center justify-between lg:h-auto lg:mb-8">
        <h1 class="text-[24px] font-semibold leading-8 text-[#1A1B1D] lg:text-[32px] lg:font-bold">More</h1>

        <a
          routerLink="/admin/notifications"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-white lg:hidden"
          aria-label="Notifications"
        >
          <img
            ngSrc="/assets/icons/admin-more/notification-bing.svg"
            width="20"
            height="20"
            alt=""
            class="h-5 w-5"
            aria-hidden="true"
          />
        </a>
      </div>

      <div class="mt-3 flex flex-col gap-6 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-8">
        @for (group of menuGroups(); track $index) {
          <div class="rounded-[24px] bg-white p-5 border border-[#efefef] shadow-sm">
            <div class="flex flex-col gap-4">
              @for (item of group; track item.label) {
                <a
                  [routerLink]="item.route"
                  class="flex min-h-12 items-center justify-between hover:bg-[#fafafa] p-2 rounded-xl transition-all"
                >
                  <span class="flex items-center gap-3">
                    <span
                      class="flex h-10 w-10 items-center justify-center rounded-xl"
                      [style.background-color]="item.iconBackground"
                    >
                      <img
                        [ngSrc]="item.icon"
                        width="24"
                        height="24"
                        alt=""
                        class="h-6 w-6"
                        aria-hidden="true"
                      />
                    </span>
                    <span class="text-[16px] font-semibold leading-5 text-[#1F1F1F]">
                      {{ item.label }}
                    </span>
                  </span>

                  <img
                    ngSrc="/assets/icons/admin-more/arrow-right.svg"
                    width="16"
                    height="16"
                    alt=""
                    class="h-4 w-4"
                    aria-hidden="true"
                  />
                </a>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMorePageComponent {
  private readonly authSession = inject(AuthSessionService);

  protected readonly menuGroups = computed<ReadonlyArray<ReadonlyArray<AdminMoreItem>>>(() => {
    const canManageCategories = this.authSession.canManageCategories();
    const canManageAds = this.authSession.canManageAds();
    const canManageStores = this.authSession.canManageTransactions() || this.authSession.canManageUsers();
    const canManageKyc = this.authSession.canManageKyc();
    const canManageReports = this.authSession.canManageReports();
    const canViewAuditLog = this.authSession.canManageTeam();
    const canManageTeam = this.authSession.canManageTeam();
    const canManageSiteConfiguration = this.authSession.canManageSiteConfiguration();

    const groups: Array<Array<AdminMoreItem>> = [
      [
        ...(canManageAds
          ? [{
              label: 'Ads management',
              route: '/admin/ads',
              icon: '/assets/icons/admin-more/award.svg',
              iconBackground: '#48A465',
            }]
          : []),
        ...(canManageCategories
          ? [{
              label: 'Categories',
              route: '/admin/categories',
              icon: '/assets/icons/admin-more/shop.svg',
              iconBackground: '#8E6CFF',
            }]
          : []),
        ...(canManageStores
          ? [{
              label: 'Stores',
              route: '/admin/stores',
              icon: '/assets/icons/admin-more/shop.svg',
              iconBackground: '#E2B448',
            }]
          : []),
      ],
      [
        ...(canManageKyc
          ? [{
              label: 'KYC requests',
              route: '/admin/kyc-requests',
              icon: '/assets/icons/admin-more/card-tick.svg',
              iconBackground: '#F7458A',
            }]
          : []),
        ...(canManageReports
          ? [{
              label: 'Reports',
              route: '/admin/reports',
              icon: '/assets/icons/admin-more/flag.svg',
              iconBackground: '#25AD31',
            }]
          : []),
        {
          label: 'FAQs',
          route: '/admin/faq',
          icon: '/assets/icons/message-question-icon.svg',
          iconBackground: '#48A465',
        },
      ],
      [
        ...(canViewAuditLog
          ? [{
              label: 'Audit log',
              route: '/admin/audit-log',
              icon: '/assets/icons/admin-more/document.svg',
              iconBackground: '#E2B448',
            }]
          : []),
      ],
      [
        ...(canManageTeam
          ? [{
              label: 'Team management',
              route: '/admin/team-management',
              icon: '/assets/icons/admin-more/security-user.svg',
              iconBackground: '#1969FE',
            }]
          : []),
        ...(canManageSiteConfiguration
          ? [{
              label: 'Locations',
              route: '/admin/locations',
              icon: '/assets/icons/settings/settings-nav-profile.svg',
              iconBackground: '#6453D9',
            }]
          : []),
        {
          label: 'Account settings',
          route: '/admin/settings',
          icon: '/assets/icons/admin-more/setting-2.svg',
          iconBackground: '#FF641E',
        },
      ],
    ];

    return groups.filter(group => group.length > 0);
  });
}
