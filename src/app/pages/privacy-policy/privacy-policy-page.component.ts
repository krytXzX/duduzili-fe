import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthSessionService } from '../../services/auth-session.service';
import { HomeFooterComponent } from '../../components/layout/home-footer.component';

type PrivacySection = {
  id: string;
  navLabel: string;
  title: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
  nestedBullets?: readonly string[];
  lead?: string;
};

type DecorativeAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
  className: string;
};

@Component({
  selector: 'app-privacy-policy-page',
  imports: [CommonModule, RouterLink, NgOptimizedImage, HomeFooterComponent],
  templateUrl: './privacy-policy-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full overflow-auto bg-[#FCFCFC]',
  },
})
export class PrivacyPolicyPageComponent {
  private readonly authSession = inject(AuthSessionService);

  readonly sections: readonly PrivacySection[] = [
    {
      id: 'preface',
      navLabel: 'Preface',
      title: 'Preface',
      paragraphs: [
        'Duduzili strongly believes in providing total privacy and protection to our customer’s personal data. The information our customers give us are gotten with full consent, are processed under legal basis and are not sold, rented, loaned or otherwise disclosed to third parties. Our policies are created to provide protection of the confidentiality and security of our customer’s personal information. We only require the minimum amount of personal information needed to fulfill our service to our customers. Our privacy standards are in compliance with the National Data Protection Regulation (NDPR) and the General Data Protection Regulation (GDPR).',
      ],
    },
    {
      id: 'policy-overview',
      navLabel: '1. Policy overview',
      title: '1. Policy overview',
      paragraphs: [
        'This Privacy Policy describes the process involved in the acquisition, processing, porting, storage and disposing of your personal data in connection with our websites, portals, mobile applications, tools and services. This Privacy Policy also governs your rights regarding the foregoing. Duduzili takes pride in securing and maintaining the privacy of the data we collect from you.',
      ],
    },
    {
      id: 'scope-and-consent',
      navLabel: '2. Scope and consent',
      title: '2. Scope and consent',
      paragraphs: [
        'This policy is enforced after you consent to it when you sign-up, access our products, services, content, features, technologies or functions offered from our websites, related sites, portals, applications and services. However, Duduzili is not responsible for handling of information gotten by third party customers/sites through the use of our tools, portal, and services and will not be held liable for any breach or misuse of collected information.',
      ],
    },
    {
      id: 'rights',
      navLabel: '3. Rights',
      title: '3. Rights',
      paragraphs: [
        'You have the right of access to your personal data being processed by Duduzili which includes requesting for an update, rectification, erasure, asking for a copy of your personal data, a withdrawal of consent at any time, complaining to a data protection authority, without affecting the lawfulness of processing based on consent given before the withdrawal. You can request for a restriction or deletion of your personal data based on the following:',
      ],
      bullets: [
        'Non-legitimate grounds for processing',
        'Unlawful processing',
        'Erasure is required for compliance with a legal obligation',
        'Inaccuracy of personal data',
        'Change in initial purpose. All requests shall be made in writing to the Data Protection Officer via email at abc@duduzili.com.',
      ],
    },
    {
      id: 'use-of-personal-information',
      navLabel: '4. Use of personal information',
      title: '4. Use of personal information',
      lead: 'The collection and use of personal data by Duduzili is guided by certain principles. These principles state that personal data should:',
      bullets: [
        'be processed fairly, lawfully and in a transparent manner.',
        'be obtained for a specified and lawful purpose and shall not be processed in any manner incompatible with such purposes.',
        'be adequate, relevant and limited to what is necessary to fulfill the purpose of processing.',
        'be accurate and, where necessary, up to date.',
        'not be kept for longer than necessary for the purpose of processing.',
        'be processed in accordance with the data subject’s rights.',
        'be kept safe from unauthorized processing, and accidental loss, damage or destruction using adequate technical and organizational measures.',
      ],
    },
    {
      id: 'personal-data-collected',
      navLabel: '5. Personal data collected and used in Duduzili',
      title: '5. Personal data collected and used in Duduzili',
      paragraphs: [
        'When you create an account or use our services, we may collect information such as your full name, email address, phone number, location information, profile details, messages, transaction-related information, device details, usage patterns, and any other information you choose to share through our platform. We collect only the information reasonably necessary to provide our marketplace services, support trust and safety, improve your experience, and comply with legal obligations.',
        'We may also collect technical and behavioural information automatically when you interact with Duduzili, including browser details, device identifiers, IP address, page interactions, and similar diagnostic information that helps us maintain service quality, detect fraud, and improve security across the platform.',
      ],
      bullets: [
        'Account and profile information you submit directly to us',
        'Communication data exchanged with sellers, buyers, or support teams',
        'Marketplace activity such as listings, favourites, follows, searches, and recently viewed items',
        'Payment, billing, or verification-related information where required',
        'Technical analytics and device information that help us secure and improve the service',
      ],
    },
    {
      id: 'duration-of-storage',
      navLabel: '6. Duration of storage',
      title: '6. Duration of storage',
      paragraphs: [
        'We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, including legal, accounting, regulatory, and dispute-resolution obligations. The exact duration depends on the nature of the data and the reason it was collected. Your information is only retained in accordance with legal and regulatory requirements for the collected data.',
      ],
    },
    {
      id: 'data-storage-and-security',
      navLabel: '7. Data storage and security',
      title: '7. Data storage and security',
      paragraphs: [
        'Duduzili and its partners use security-cleared data processors to store files and data on secure cloud-based servers. Regardless of where your information is processed, we apply the same protections described in this policy. We protect your Personal Data using physical, technical, and administrative security measures to reduce the risks of loss, misuse, unauthorized access, disclosure and alteration.',
        'All data is accessed via secure connections and stored on encrypted servers and encrypted storage services. We also use firewalls, physical access controls, and information access authorization controls. Despite our efforts to establish a secure environment for the website, no information transmitted over the internet can be guaranteed to be completely secure.',
      ],
    },
    {
      id: 'childrens-privacy',
      navLabel: '8. Children’s privacy',
      title: '8. Children’s privacy',
      paragraphs: [
        'We do not use our platforms to knowingly solicit data from children or individuals under the age of sixteen (16). Where a parent or guardian discovers that a child or individual under the age of sixteen (16) has provided us with personal data without their consent, they should contact us at abc@duduzili.com and we shall immediately delete the user’s account from our servers.',
      ],
    },
    {
      id: 'accuracy-of-information',
      navLabel: '9. Accuracy of information',
      title: '9. Accuracy of information',
      bullets: [
        'The Company shall take reasonable steps to ensure personal data is accurate.',
        'Where necessary for the lawful basis on which data is processed, steps shall be put in place to ensure that personal data is kept up to date.',
        'The Company shall ensure that updated personal data reflect across all boards to which it is being used.',
      ],
    },
    {
      id: 'archiving-removal',
      navLabel: '10. Archiving/removal',
      title: '10. Archiving/removal',
      bullets: [
        'To ensure that personal data is kept for no longer than necessary, the Company puts in place a data retention policy for each area in which personal data is processed and reviews this process annually.',
        'This retention policy considers what data should or must be retained, for how long, and why.',
      ],
    },
    {
      id: 'transfer-of-personal',
      navLabel: '11. Transfer of personal',
      title: '11. Transfer of personal',
      lead: 'We do not rent or sell your personally identifiable information to other individuals or organizations. However, we may transfer your personal data to third parties when it is necessary to provide you with our services. Third parties could include:',
      bullets: [
        'Undertakings within Duduzili',
        'Business partners',
        'Professional advisors',
        'Legal or regulatory authority',
        'Application program interface (API) users',
        'Security-cleared data processors or subcontractors assisting us with IT or operational services',
      ],
      paragraphs: [
        'When we transfer your personal data to business partners, they may already hold personal data concerning you collected through other lawful means. We may also transfer your personal data if we are obliged to do so according to legislation or in order to protect our interests in legal disputes.',
        'Duduzili partners with various technology vendors from time to time. This may result in a transfer of personal data to a third country or international organization. To ensure an equal level of security for such transfers, we work only with vendors that are bound by appropriate contractual and data protection safeguards.',
      ],
    },
    {
      id: 'changes-to-this-policy',
      navLabel: '12. Changes to this policy',
      title: '12. Changes to this policy',
      paragraphs: [
        'We may update this Policy from time to time without prior notice to you. You are advised to consult this page periodically for any changes. We will notify you of material updates by posting the revised Policy on this platform. Changes shall be effective immediately after they are updated on this platform.',
      ],
    },
    {
      id: 'contact',
      navLabel: '13. Contact',
      title: '13. Contact',
      paragraphs: [
        'If you want to lodge a complaint over our processing of your personal data or have further requests, please contact the Data Protection Officer directly at abc@duduzili.com. Duduzili maintains an incident response plan used in dealing with incidents relating to unlawful disclosure, loss, alteration, destruction, or unauthorized access to customer personal data collected, transmitted, stored, or processed in any way.',
      ],
    },
  ];

  readonly desktopDecorativeDocs: readonly DecorativeAsset[] = [
    { src: '/assets/images/privacy-policy/document-desktop.svg', width: 80, height: 80, alt: '', className: 'absolute left-[208px] top-[96px] h-20 w-20 -rotate-[35.55deg] opacity-40' },
    { src: '/assets/images/privacy-policy/document-desktop-alt.svg', width: 80, height: 80, alt: '', className: 'absolute left-[101px] top-[329px] h-20 w-20 rotate-[14.63deg] opacity-40' },
    { src: '/assets/images/privacy-policy/document-desktop.svg', width: 80, height: 80, alt: '', className: 'absolute left-[976px] top-[43px] h-20 w-20 -rotate-[6.37deg] opacity-40' },
    { src: '/assets/images/privacy-policy/document-desktop.svg', width: 80, height: 80, alt: '', className: 'absolute right-[24px] top-0 h-20 w-20 -rotate-[27.67deg] opacity-40' },
    { src: '/assets/images/privacy-policy/document-desktop.svg', width: 80, height: 80, alt: '', className: 'absolute left-[1075px] top-[239px] h-20 w-20 rotate-[17.9deg] opacity-40' },
    { src: '/assets/images/privacy-policy/document-desktop-alt.svg', width: 80, height: 80, alt: '', className: 'absolute right-[69px] top-[283px] h-20 w-20 -rotate-[28.6deg] opacity-40' },
    { src: '/assets/images/privacy-policy/document-desktop-alt.svg', width: 80, height: 80, alt: '', className: 'absolute left-[464px] top-[212px] h-20 w-20 -rotate-[4.21deg] opacity-40' },
    { src: '/assets/images/privacy-policy/document-desktop-alt.svg', width: 80, height: 80, alt: '', className: 'absolute -left-[10px] top-[21px] h-20 w-20 -rotate-[4.21deg] opacity-40' },
  ];

  readonly mobileDecorativeDocs: readonly DecorativeAsset[] = [
    { src: '/assets/images/privacy-policy/document-mobile.svg', width: 20, height: 20, alt: '', className: 'absolute left-[64px] top-[31px] h-[20px] w-[20px] -rotate-[35.55deg] opacity-40' },
    { src: '/assets/images/privacy-policy/document-mobile.svg', width: 20, height: 20, alt: '', className: 'absolute left-[38px] top-[89px] h-[20px] w-[20px] rotate-[14.63deg] opacity-40' },
    { src: '/assets/images/privacy-policy/document-mobile.svg', width: 20, height: 20, alt: '', className: 'absolute left-[254px] top-[18px] h-[20px] w-[20px] -rotate-[6.37deg] opacity-40' },
    { src: '/assets/images/privacy-policy/document-mobile.svg', width: 20, height: 20, alt: '', className: 'absolute right-[18px] top-[5px] h-[20px] w-[20px] -rotate-[27.67deg] opacity-40' },
    { src: '/assets/images/privacy-policy/document-mobile.svg', width: 20, height: 20, alt: '', className: 'absolute left-[279px] top-[66px] h-[20px] w-[20px] rotate-[17.9deg] opacity-40' },
    { src: '/assets/images/privacy-policy/document-mobile.svg', width: 20, height: 20, alt: '', className: 'absolute right-[20px] top-[77px] h-[20px] w-[20px] -rotate-[28.6deg] opacity-40' },
    { src: '/assets/images/privacy-policy/document-mobile.svg', width: 20, height: 20, alt: '', className: 'absolute left-[127px] top-[60px] h-[20px] w-[20px] -rotate-[4.21deg] opacity-40' },
    { src: '/assets/images/privacy-policy/document-mobile.svg', width: 20, height: 20, alt: '', className: 'absolute left-0 top-[12px] h-[20px] w-[20px] -rotate-[4.21deg] opacity-40' },
  ];

  readonly fallbackAvatar = '/assets/images/auth-avatar-fallback.svg';
  readonly userAvatar = computed(() => this.authSession.user()?.avatar?.trim() || this.fallbackAvatar);
}
