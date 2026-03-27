import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandApple, faBrandGoogle } from '@ng-icons/font-awesome/brands';

@Component({
  selector: 'app-sign-in-page',
  imports: [NgOptimizedImage, ReactiveFormsModule, NgIcon],
  templateUrl: './sign-in-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ faBrandGoogle, faBrandApple })],
  host: {
    class: 'block h-full',
  },
})
export class SignInPageComponent {
  protected readonly logoUrl =
    'https://www.figma.com/api/mcp/asset/6557fcef-daf3-4c70-aa11-3a73e4624cb7';
  protected readonly markUrl =
    'https://www.figma.com/api/mcp/asset/2b38b3ef-6a12-47e5-8784-faff36a1893d';
  protected readonly heroSkyUrl =
    'https://www.figma.com/api/mcp/asset/22a28fa5-cd8d-42e8-84cd-a2df842b19f3';
  protected readonly phoneImageUrl =
    'https://www.figma.com/api/mcp/asset/eb3c0618-bcec-4ddc-88f2-ec6fbf7c63dc';
  protected readonly closetBannerUrl =
    'https://www.figma.com/api/mcp/asset/74615bc0-4dfa-4fe5-8892-3837d3e82514';
  protected readonly sellerAvatarUrl =
    'https://www.figma.com/api/mcp/asset/3f20c1a3-9536-42b6-91bb-a7fca1a52c8b';
  protected readonly heroImageUrl =
    'https://www.figma.com/api/mcp/asset/ae244a3d-5ce8-4a48-8109-cdab5a644af4';
  protected readonly inputChevronUrl =
    'https://www.figma.com/api/mcp/asset/b16d236c-c311-401c-9e76-ac341eb58109';
  protected readonly productLikeUrl =
    'https://www.figma.com/api/mcp/asset/6473f5af-63cc-4710-814a-c4f370a8aeb5';
  protected readonly verifiedBadgeIconUrl =
    'https://www.figma.com/api/mcp/asset/06a059e5-7813-4010-b889-e7ad852a8a84';
  protected readonly arrowLeftUrl =
    'https://www.figma.com/api/mcp/asset/bd8c348a-58b0-4de0-85a5-d5f305953e21';
  protected readonly arrowRightUrl =
    'https://www.figma.com/api/mcp/asset/8b68cbef-e942-4d07-ad1d-a5f917cd0761';
  protected readonly nairaIconUrl =
    'https://www.figma.com/api/mcp/asset/336e3633-c257-4223-aaaa-3ffeccf70c2d';
  protected readonly productLocationIconUrl =
    'https://www.figma.com/api/mcp/asset/74f8b224-46a4-41c3-8344-4e0cf0e05da6';
  protected readonly sellerVerifyIconUrl =
    'https://www.figma.com/api/mcp/asset/49a9a530-b36e-472f-8eb5-2536153bdbe2';
  protected readonly sellerLocationIconUrl =
    'https://www.figma.com/api/mcp/asset/0011da05-3041-4244-9061-d3159584b30f';

  protected readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    // password: new FormControl('', {
    //   nonNullable: true,
    //   validators: [Validators.required],
    // }),
  });

  protected readonly emailControl = this.loginForm.controls.email;
  // protected readonly password = this.loginForm.controls.password;
  protected readonly submitted = signal(false);

  protected continueWithEmail(): void {
    this.submitted.set(true);
    this.loginForm.markAllAsTouched();
  }
}
