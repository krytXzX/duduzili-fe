import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthSessionService } from '../../services/auth-session.service';
import { HomeFooterComponent } from '../../components/layout/home-footer.component';

type LegalSection = {
  id: string;
  title: string;
  body: readonly string[];
  intro?: string;
  note?: string;
};

type DecorativeAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
  className: string;
};

@Component({
  selector: 'app-terms-of-service-page',
  imports: [CommonModule, RouterLink, NgOptimizedImage, HomeFooterComponent],
  templateUrl: './terms-of-service-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full overflow-auto bg-[#FCFCFC]',
  },
})
export class TermsOfServicePageComponent {
  private readonly authSession = inject(AuthSessionService);

  readonly sections: readonly LegalSection[] = [
    {
      id: 'background',
      title: 'Background',
      body: [
        'Cookies are simple text files that are stored on your computer or mobile device by a website’s server. Each cookie is unique to your web browser. It will contain some anonymous information such as a unique identifier, website’s domain name, and some digits and numbers.',
      ],
    },
    {
      id: 'cookies',
      title: 'What type of cookies do we use?',
      body: [
        'Necessary cookies allow us to offer you the best possible experience when accessing and navigating through our website and using its features. For example, these cookies let us recognize that you have created an account and have logged into that account.',
        'Functionality cookies let us operate the site in accordance with the choices you make. For example, we will recognize your username and remember how you customized the site during future visits.',
        'These are used to gather data on how users use our website and the pages visited most often. They monitor only the performance of our website as the user interacts with it. All data collected by these cookies are anonymous and are solely used to improve the functionality of our website.',
      ],
      intro: 'Necessary Cookies',
      note: 'Functionality Cookies||Performance Cookies',
    },
    {
      id: 'delete-cookies',
      title: 'How to delete cookies',
      body: [
        'If you want to restrict or block the cookies that are set by our website, you can do so through your browser setting.',
        'Contact us If you have any questions about this policy or our use of cookies, please contact us at abc@duduzili.com.',
      ],
    },
  ];

  readonly desktopDecorativeDocs: readonly DecorativeAsset[] = [
    {
      src: '/assets/images/terms-of-service/document-desktop.svg',
      width: 80,
      height: 80,
      alt: '',
      className: 'absolute left-[208px] top-[96px] h-20 w-20 -rotate-[35.55deg] opacity-40',
    },
    {
      src: '/assets/images/terms-of-service/document-desktop-alt.svg',
      width: 80,
      height: 80,
      alt: '',
      className: 'absolute left-[101px] top-[329px] h-20 w-20 rotate-[14.63deg] opacity-40',
    },
    {
      src: '/assets/images/terms-of-service/document-desktop.svg',
      width: 80,
      height: 80,
      alt: '',
      className: 'absolute left-[976px] top-[43px] h-20 w-20 -rotate-[6.37deg] opacity-40',
    },
    {
      src: '/assets/images/terms-of-service/document-desktop.svg',
      width: 80,
      height: 80,
      alt: '',
      className: 'absolute right-[24px] top-0 h-20 w-20 -rotate-[27.67deg] opacity-40',
    },
    {
      src: '/assets/images/terms-of-service/document-desktop.svg',
      width: 80,
      height: 80,
      alt: '',
      className: 'absolute left-[1075px] top-[239px] h-20 w-20 rotate-[17.9deg] opacity-40',
    },
    {
      src: '/assets/images/terms-of-service/document-desktop-alt.svg',
      width: 80,
      height: 80,
      alt: '',
      className: 'absolute right-[69px] top-[283px] h-20 w-20 -rotate-[28.6deg] opacity-40',
    },
    {
      src: '/assets/images/terms-of-service/document-desktop-alt.svg',
      width: 80,
      height: 80,
      alt: '',
      className: 'absolute left-[464px] top-[212px] h-20 w-20 -rotate-[4.21deg] opacity-40',
    },
    {
      src: '/assets/images/terms-of-service/document-desktop-alt.svg',
      width: 80,
      height: 80,
      alt: '',
      className: 'absolute -left-[10px] top-[21px] h-20 w-20 -rotate-[4.21deg] opacity-40',
    },
  ];

  readonly mobileDecorativeDocs: readonly DecorativeAsset[] = [
    {
      src: '/assets/images/terms-of-service/document-mobile.svg',
      width: 20,
      height: 20,
      alt: '',
      className: 'absolute left-[64px] top-[31px] h-[20px] w-[20px] -rotate-[35.55deg] opacity-40',
    },
    {
      src: '/assets/images/terms-of-service/document-mobile.svg',
      width: 20,
      height: 20,
      alt: '',
      className: 'absolute left-[38px] top-[89px] h-[20px] w-[20px] rotate-[14.63deg] opacity-40',
    },
    {
      src: '/assets/images/terms-of-service/document-mobile.svg',
      width: 20,
      height: 20,
      alt: '',
      className: 'absolute left-[254px] top-[18px] h-[20px] w-[20px] -rotate-[6.37deg] opacity-40',
    },
    {
      src: '/assets/images/terms-of-service/document-mobile.svg',
      width: 20,
      height: 20,
      alt: '',
      className: 'absolute right-[18px] top-[5px] h-[20px] w-[20px] -rotate-[27.67deg] opacity-40',
    },
    {
      src: '/assets/images/terms-of-service/document-mobile.svg',
      width: 20,
      height: 20,
      alt: '',
      className: 'absolute left-[279px] top-[66px] h-[20px] w-[20px] rotate-[17.9deg] opacity-40',
    },
    {
      src: '/assets/images/terms-of-service/document-mobile.svg',
      width: 20,
      height: 20,
      alt: '',
      className: 'absolute right-[20px] top-[77px] h-[20px] w-[20px] -rotate-[28.6deg] opacity-40',
    },
    {
      src: '/assets/images/terms-of-service/document-mobile.svg',
      width: 20,
      height: 20,
      alt: '',
      className: 'absolute left-[127px] top-[60px] h-[20px] w-[20px] -rotate-[4.21deg] opacity-40',
    },
    {
      src: '/assets/images/terms-of-service/document-mobile.svg',
      width: 20,
      height: 20,
      alt: '',
      className: 'absolute left-0 top-[12px] h-[20px] w-[20px] -rotate-[4.21deg] opacity-40',
    },
  ];

  readonly fallbackAvatar = '/assets/images/auth-avatar-fallback.svg';
  readonly userAvatar = computed(() => this.authSession.user()?.avatar?.trim() || this.fallbackAvatar);
}
