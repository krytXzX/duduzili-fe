import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, output, signal, computed, inject, viewChild } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  heroXMark, 
  heroCheckBadge,
  heroChevronLeft,
  heroChevronRight,
  heroCamera,
  heroUser,
  heroIdentification,
  heroCheckCircle,
  heroArrowUpTray,
  heroChevronDown
} from '@ng-icons/heroicons/outline';

export type VerificationStep = 'intro' | 'selection' | 'upload_method' | 'upload' | 'camera_capture' | 'selfie_intro' | 'selfie_capture' | 'success';

@Component({
  selector: 'app-identity-verification-modal',
  standalone: true,
  imports: [CommonModule, NgIcon, FormsModule, NgOptimizedImage],
  providers: [
    provideIcons({ 
      heroXMark, 
      heroCheckBadge,
      heroChevronLeft,
      heroChevronRight,
      heroCamera,
      heroUser,
      heroIdentification,
      heroCheckCircle,
      heroArrowUpTray,
      heroChevronDown
    })
  ],
  template: `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        class="bg-white w-full max-w-3xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="px-8 py-6 flex items-center gap-4 border-b border-gray-50 shrink-0">
          <button 
            (click)="close.emit()" 
            class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700"
          >
            <ng-icon name="heroXMark" class="text-xl"></ng-icon>
          </button>

          @if (currentStep() !== 'intro' && currentStep() !== 'success') {
            <button 
              (click)="goBack()"
              class="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group"
            >
              <ng-icon name="heroChevronLeft" class="text-lg group-hover:-translate-x-1 transition-transform"></ng-icon>
              <span class="text-sm font-bold">Back</span>
            </button>
          }

          <h2 class="text-[17px] font-semibold text-[#1A1C21] tracking-tight">
            {{ ['intro', 'upload_method'].includes(currentStep()) ? 'Verify your identity' : title() }}
          </h2>
        </div>

        <!-- Content Area -->
        <div class="flex-1 flex overflow-hidden">
          
          <!-- Sidebar (Left) -->
          @if (currentStep() !== 'intro' && currentStep() !== 'success') {
            <div class="w-64 border-r border-gray-50 p-8 hidden md:block shrink-0 bg-white">
               <div class="space-y-6">
                  <!-- Step 1: Government ID -->
                  <div class="flex items-center gap-3">
                     <div 
                      class="h-px w-6 transition-all duration-300"
                      [class.bg-[#5932EA]]="['selection', 'upload_method', 'upload', 'camera_capture'].includes(currentStep())"
                      [class.bg-gray-200]="!['selection', 'upload_method', 'upload', 'camera_capture'].includes(currentStep())"
                     ></div>
                     <span 
                      class="text-sm font-semibold tracking-tight transition-colors duration-300"
                      [class.text-[#1A1C21]]="['selection', 'upload_method', 'upload', 'camera_capture'].includes(currentStep())"
                      [class.text-gray-300]="!['selection', 'upload_method', 'upload', 'camera_capture'].includes(currentStep())"
                     >
                        Government ID
                     </span>
                  </div>

                  <!-- Step 2: Selfie -->
                  <div class="flex items-center gap-3">
                     <div 
                      class="h-px w-3 transition-all duration-300"
                      [class.bg-[#5932EA]]="['selfie_intro', 'selfie_capture'].includes(currentStep())"
                      [class.bg-gray-200]="!['selfie_intro', 'selfie_capture'].includes(currentStep())"
                     ></div>
                     <span 
                      class="text-sm font-semibold tracking-tight transition-colors duration-300"
                      [class.text-[#1A1C21]]="['selfie_intro', 'selfie_capture'].includes(currentStep())"
                      [class.text-gray-300]="!['selfie_intro', 'selfie_capture'].includes(currentStep())"
                     >
                        Selfie
                     </span>
                  </div>
               </div>
            </div>
          }

          <div class="flex-1 overflow-y-auto min-h-[400px]">
            <div class="p-8">
              
              <!-- STEP 1: INTRO -->
              @if (currentStep() === 'intro') {
                <div class="flex flex-col items-center text-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
                  <div class="relative w-48 h-48 mb-6">
                     <img 
                      ngSrc="/assets/images/identity_verification_id_card_illustration.png" 
                      fill 
                      class="object-contain" 
                      alt="ID verification illustration"
                     >
                  </div>
                  
                  <h3 class="text-[24px] font-semibold text-[#1A1C21] tracking-tight mb-2">Verify your identity</h3>
                  <p class="text-[14px] text-gray-400 leading-relaxed">
                    We need to verify your identity so we can stay secure and complaint. <br>
                    Please be prepared to upload the following:
                  </p>

                  <div class="w-full space-y-8 text-left mt-10 mb-12 px-2">
                     <div>
                        <div class="flex items-center gap-2 mb-2">
                          <span class="text-[#5932EA] text-[17px] font-semibold">01.</span>
                          <h4 class="text-[17px] font-semibold text-[#1A1C21]">Government ID</h4>
                        </div>
                        <ul class="space-y-1.5 pl-9">
                          <li class="text-[13px] text-gray-500 flex items-start gap-2">
                            <span class="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                            Clear and readable. Good lighting helps!
                          </li>
                          <li class="text-[13px] text-gray-500 flex items-start gap-2">
                            <span class="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                            Not too close to expiration date
                          </li>
                          <li class="text-[13px] text-gray-500 flex items-start gap-2">
                            <span class="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                            Picture required, no screenshots or copies of any kind
                          </li>
                        </ul>
                     </div>

                     <div>
                        <div class="flex items-center gap-2 mb-2">
                          <span class="text-[#5932EA] text-[17px] font-semibold">02.</span>
                          <h4 class="text-[17px] font-semibold text-[#1A1C21]">Selfie</h4>
                        </div>
                        <ul class="space-y-1.5 pl-9">
                          <li class="text-[13px] text-gray-500 flex items-start gap-2">
                            <span class="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                            Clear photo taken with your webcam
                          </li>
                          <li class="text-[13px] text-gray-500 flex items-start gap-2">
                            <span class="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                            No passport photos or other generic pictures
                          </li>
                        </ul>
                     </div>
                  </div>

                  <button 
                    (click)="nextStep()"
                    class="w-full bg-[#5932EA] hover:bg-purple-700 text-white py-4 rounded-2xl text-[14px] font-semibold transition-all shadow-xl shadow-purple-200 active:scale-95 mb-6"
                  >
                    Start verification
                  </button>
                </div>
              }

              <!-- STEP 2: SELECTION -->
              @if (currentStep() === 'selection') {
                <div class="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 class="text-[21px] font-semibold text-[#1A1C21] tracking-tight mb-8">Choose an ID type to add</h3>
                  
                  <div class="space-y-2 mb-8">
                    <label class="ml-1 text-[12px] font-medium text-gray-500">Issuing country/region</label>
                    <div class="relative">
                       <select 
                        [(ngModel)]="selectedCountry"
                        class="w-full appearance-none rounded-xl border border-gray-100 bg-white p-3 pr-12 text-[#1A1C21] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
                       >
                         <option value="Nigeria">Nigeria</option>
                         <option value="United States">United States</option>
                         <option value="United Kingdom">United Kingdom</option>
                         <option value="Canada">Canada</option>
                       </select>
                       <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ng-icon name="heroChevronDown" class="text-lg"></ng-icon>
                       </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 gap-3 mb-8">
                    @for (doc of documentTypes; track doc.id) {
                      <button 
                        (click)="selectedDocType.set(doc.id)"
                        class="flex items-center justify-between p-4 rounded-2xl border-2 transition-all group hover:bg-gray-100"
                        [class.border-[#5932EA]]="selectedDocType() === doc.id"
                        [class.bg-[#F7F5FF]]="selectedDocType() === doc.id"
                        [class.border-transparent]="selectedDocType() !== doc.id"
                        [class.bg-gray-50/50]="selectedDocType() !== doc.id"
                      >
                        <div class="flex items-center gap-4 text-left">
                           <div 
                             class="w-12 h-10 shrink-0 rounded-lg bg-contain bg-no-repeat bg-center transition-transform group-hover:scale-110"
                             [style.background-image]="'url(/assets/images/id_type_icons_3d.png)'"
                             [style.background-position]="doc.id === 'license' ? 'left' : (doc.id === 'passport' ? 'center' : 'right')"
                             [style.background-size]="'300% 100%'"
                           ></div>
                           <span class="text-[14px] font-medium text-[#1A1C21] opacity-90">{{ doc.name }}</span>
                        </div>
                        <div 
                          class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-white"
                          [class.border-[#5932EA]]="selectedDocType() === doc.id"
                          [class.border-gray-100]="selectedDocType() !== doc.id"
                        >
                           @if (selectedDocType() === doc.id) {
                             <div class="w-3.5 h-3.5 rounded-full bg-[#5932EA] shadow-sm"></div>
                           }
                        </div>
                      </button>
                    }
                  </div>

                  <p class="mb-12 text-[12px] text-gray-400">
                    Your ID will be handled according to our <a href="#" class="text-[#5932EA] underline font-medium">Privacy Policy</a> and won't be shared with anyone
                  </p>

                  <div class="flex items-center justify-between gap-4">
                     <button 
                      (click)="close.emit()"
                      class="rounded-full border border-gray-100 px-8 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-all active:scale-95"
                     >
                       Cancel
                     </button>
                     <button 
                      (click)="nextStep()"
                      [disabled]="!selectedDocType()"
                      class="rounded-full bg-[#5932EA] px-10 py-3 text-sm font-medium text-white transition-all shadow-lg shadow-purple-100 active:scale-95 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                     >
                       Continue
                     </button>
                  </div>
                </div>
              }

              <!-- STEP 3: UPLOAD METHOD -->
              @if (currentStep() === 'upload_method') {
                <div class="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 class="text-[21px] font-semibold text-[#1A1C21] tracking-tight mb-3">How would you like to add your government ID?</h3>
                  <p class="mb-10 text-[13px] text-gray-400">You can upload a file or use your webcam</p>

                  <div class="grid grid-cols-1 gap-3 mb-12">
                     <button 
                      (click)="selectedUploadMethod.set('file')"
                      class="flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left"
                      [class.border-[#5932EA]]="selectedUploadMethod() === 'file'"
                      [class.bg-[#F7F5FF]]="selectedUploadMethod() === 'file'"
                      [class.border-transparent]="selectedUploadMethod() !== 'file'"
                      [class.bg-gray-50/50]="selectedUploadMethod() !== 'file'"
                     >
                        <span class="font-medium text-[#1A1C21]">Upload an existing photo</span>
                        <div 
                          class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-white"
                          [class.border-[#5932EA]]="selectedUploadMethod() === 'file'"
                          [class.border-gray-100]="selectedUploadMethod() !== 'file'"
                        >
                           @if (selectedUploadMethod() === 'file') {
                             <div class="w-3.5 h-3.5 rounded-full bg-[#5932EA] shadow-sm"></div>
                           }
                        </div>
                     </button>

                     <button 
                      (click)="selectedUploadMethod.set('webcam')"
                      class="flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left"
                      [class.border-[#5932EA]]="selectedUploadMethod() === 'webcam'"
                      [class.bg-[#F7F5FF]]="selectedUploadMethod() === 'webcam'"
                      [class.border-transparent]="selectedUploadMethod() !== 'webcam'"
                      [class.bg-gray-50/50]="selectedUploadMethod() !== 'webcam'"
                     >
                        <span class="font-medium text-[#1A1C21]">Take a photo with a webcam</span>
                        <div 
                          class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-white"
                          [class.border-[#5932EA]]="selectedUploadMethod() === 'webcam'"
                          [class.border-gray-100]="selectedUploadMethod() !== 'webcam'"
                        >
                           @if (selectedUploadMethod() === 'webcam') {
                             <div class="w-3.5 h-3.5 rounded-full bg-[#5932EA] shadow-sm"></div>
                           }
                        </div>
                     </button>
                  </div>

                  <div class="flex items-center justify-between gap-4">
                     <button 
                      (click)="goBack()"
                      class="rounded-full border border-gray-100 px-8 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-all active:scale-95"
                     >
                       Back
                     </button>
                     <button 
                      (click)="nextStep()"
                      [disabled]="!selectedUploadMethod()"
                      class="rounded-full bg-[#5932EA] px-10 py-3 text-sm font-medium text-white transition-all shadow-lg shadow-purple-100 active:scale-95 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                     >
                       Continue
                     </button>
                  </div>
                </div>
              }

              <!-- STEP 4: UPLOAD -->
              @if (currentStep() === 'upload') {
                <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 class="text-[21px] font-semibold text-[#1A1C21] tracking-tight mb-2">Upload images of your identity card</h3>
                  <p class="mb-10 max-w-md text-[13px] leading-relaxed text-gray-400">
                    Make sure your photos are not blurry and the front of your identity card clearly shows your face
                  </p>

                  <div class="grid grid-cols-2 gap-6 mb-12">
                     <!-- Front -->
                     <div class="flex flex-col">
                        <input #frontUploadInput type="file" accept="image/*" class="hidden" (change)="onDocumentUpload('front', $event)">
                        <div class="aspect-[1/1.1] bg-white border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center p-8 transition-all group overflow-hidden">
                           @if (capturedDocumentFront()) {
                             <img [src]="capturedDocumentFront()" alt="Uploaded front of ID" class="h-full w-full object-cover rounded-[20px]">
                           } @else {
                             <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-6 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                <ng-icon name="heroIdentification" class="text-2xl"></ng-icon>
                             </div>
                           }
                           
                           <button type="button" (click)="openFilePicker(frontUploadInput, $event)" class="mb-4 rounded-full border border-gray-200 bg-white px-8 py-2.5 text-[12px] font-medium text-[#1A1C21] shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                              {{ capturedDocumentFront() ? 'Replace front' : 'Upload front' }}
                           </button>
                           
                           <span class="text-[11px] font-medium text-gray-300">Jpeg, Png only</span>
                        </div>
                     </div>
                     
                     <!-- Back -->
                     <div class="flex flex-col">
                        <input #backUploadInput type="file" accept="image/*" class="hidden" (change)="onDocumentUpload('back', $event)">
                        <div class="aspect-[1/1.1] bg-white border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center p-8 transition-all group overflow-hidden">
                           @if (capturedDocumentBack()) {
                             <img [src]="capturedDocumentBack()" alt="Uploaded back of ID" class="h-full w-full object-cover rounded-[20px]">
                           } @else {
                             <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-6 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                <ng-icon name="heroIdentification" class="text-2xl"></ng-icon>
                             </div>
                           }
                           
                           <button type="button" (click)="openFilePicker(backUploadInput, $event)" class="mb-4 rounded-full border border-gray-200 bg-white px-8 py-2.5 text-[12px] font-medium text-[#1A1C21] shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                              {{ capturedDocumentBack() ? 'Replace back' : 'Upload back' }}
                           </button>
                           
                           <span class="text-[11px] font-medium text-gray-300">Jpeg, Png only</span>
                        </div>
                     </div>
                  </div>

                  <div class="flex items-center justify-between gap-4 pt-4">
                    <button 
                      (click)="goBack()"
                      class="rounded-full border border-gray-100 px-8 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Back
                    </button>
                    <button 
                      (click)="nextStep()"
                      [disabled]="!hasDocumentImages()"
                      class="rounded-full bg-[#5932EA] px-10 py-3 text-sm font-medium text-white transition-all shadow-lg shadow-purple-100 active:scale-95 hover:bg-purple-700"
                      [class.opacity-50]="!hasDocumentImages()"
                      [class.cursor-not-allowed]="!hasDocumentImages()"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              }

              <!-- STEP 5: CAMERA CAPTURE -->
              @if (currentStep() === 'camera_capture') {
                <div class="flex flex-col items-center py-2 animate-in fade-in zoom-in-95 duration-500 text-center">
                  <h3 class="text-[21px] font-semibold text-[#1A1C21] tracking-tight mb-3">Take a photo</h3>
                  <p class="mb-6 px-4 text-[13px] text-gray-400">Position the {{ activeDocumentCaptureSide() }} of your {{ selectedDocTypeLabel() }} in the center</p>

                  <div class="mb-6 inline-flex rounded-full bg-[#F7F5FF] p-1">
                    <button
                      type="button"
                      (click)="activeDocumentCaptureSide.set('front')"
                      class="rounded-full px-4 py-2 text-xs font-medium transition-colors"
                      [class.bg-white]="activeDocumentCaptureSide() === 'front'"
                      [class.text-[#5932EA]]="activeDocumentCaptureSide() === 'front'"
                      [class.text-gray-500]="activeDocumentCaptureSide() !== 'front'"
                    >
                      Front
                    </button>
                    <button
                      type="button"
                      (click)="activeDocumentCaptureSide.set('back')"
                      class="rounded-full px-4 py-2 text-xs font-medium transition-colors"
                      [class.bg-white]="activeDocumentCaptureSide() === 'back'"
                      [class.text-[#5932EA]]="activeDocumentCaptureSide() === 'back'"
                      [class.text-gray-500]="activeDocumentCaptureSide() !== 'back'"
                    >
                      Back
                    </button>
                  </div>

                  <div class="relative w-full max-w-sm aspect-3/2 bg-gray-100 rounded-3xl overflow-hidden mb-12 border-4 border-white shadow-xl">
                      <video #documentVideo autoplay playsinline muted class="h-full w-full object-cover"></video>
                      @if (!cameraReady()) {
                        <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-100 text-gray-400">
                           <ng-icon name="heroCamera" class="text-6xl opacity-20"></ng-icon>
                           <span class="text-[10px] font-semibold uppercase tracking-widest animate-pulse">Starting camera...</span>
                        </div>
                      }
                      <div class="absolute inset-8 border border-white/40 rounded-xl pointer-events-none"></div>
                      <div class="absolute inset-0 bg-linear-to-b from-transparent via-purple-500/10 to-transparent h-12 w-full animate-scan pointer-events-none"></div>
                  </div>

                  <div class="mb-10 grid w-full max-w-sm grid-cols-2 gap-4">
                    <div class="rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-sm">
                      <p class="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">Front</p>
                      @if (capturedDocumentFront()) {
                        <img [src]="capturedDocumentFront()" alt="Captured front of ID" class="h-24 w-full rounded-xl object-cover">
                      } @else {
                        <div class="flex h-24 items-center justify-center rounded-xl bg-gray-50 text-[12px] text-gray-300">Not captured</div>
                      }
                    </div>
                    <div class="rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-sm">
                      <p class="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">Back</p>
                      @if (capturedDocumentBack()) {
                        <img [src]="capturedDocumentBack()" alt="Captured back of ID" class="h-24 w-full rounded-xl object-cover">
                      } @else {
                        <div class="flex h-24 items-center justify-center rounded-xl bg-gray-50 text-[12px] text-gray-300">Not captured</div>
                      }
                    </div>
                  </div>

                  <div class="flex items-center gap-6">
                    <button 
                      (click)="goBack()"
                      class="rounded-full border border-gray-100 px-8 py-4 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Back
                    </button>
                    <button 
                      (click)="captureDocumentImage()"
                      class="w-16 h-16 rounded-full bg-[#5932EA] hover:bg-purple-700 text-white flex items-center justify-center shadow-xl shadow-purple-200 active:scale-95 group transition-all"
                    >
                       <div class="w-8 h-8 rounded-full border-4 border-white"></div>
                    </button>
                    <button
                      type="button"
                      (click)="nextStep()"
                      [disabled]="!hasDocumentImages()"
                      class="rounded-full border border-gray-100 px-6 py-4 text-sm font-medium text-gray-900 transition-all active:scale-95 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              }

              <!-- STEP 5: SELFIE INTRO -->
              @if (currentStep() === 'selfie_intro') {
                <div class="flex flex-col items-center text-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto">
                  <div class="relative w-48 h-48 mb-8">
                     <img 
                      ngSrc="/assets/images/selfie_intro_illustration.png" 
                      fill 
                      class="object-contain" 
                      alt="Selfie capture illustration"
                     >
                  </div>
                  
                  <h3 class="text-[21px] font-semibold text-[#1A1C21] tracking-tight mb-3">Let's capture a selfie.</h3>
                  <p class="mb-12 text-[13px] leading-relaxed text-gray-400">
                    Ensure a well-lit environment and <br> remove your hat or glasses.
                  </p>

                  <button 
                    (click)="nextStep()"
                    class="mb-6 w-full rounded-2xl bg-[#5932EA] py-4 text-[14px] font-medium text-white transition-all shadow-xl shadow-purple-200 hover:bg-purple-700 active:scale-95"
                  >
                    Next
                  </button>
                </div>
              }

              <!-- STEP 6: SELFIE CAPTURE (Mock) -->
              @if (currentStep() === 'selfie_capture') {
                <div class="flex flex-col items-center py-2 animate-in fade-in zoom-in-95 duration-500 text-center">
                  <div class="relative w-80 h-80 mb-10 group">
                     <!-- Outer Ring -->
                     <div 
                      class="absolute inset-0 rounded-full border-4 transition-all duration-700"
                      [class.border-purple-600]="!capturedSelfie()"
                      [class.border-green-500]="!!capturedSelfie()"
                      [class.scale-105]="!!capturedSelfie()"
                     ></div>
                     
                     <!-- Camera Mock -->
                     <div class="absolute inset-4 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-inner">
                        @if (capturedSelfie()) {
                          <img [src]="capturedSelfie()" alt="Captured selfie" class="w-full h-full object-cover animate-in fade-in duration-1000">
                        } @else {
                          <video #selfieVideo autoplay playsinline muted class="h-full w-full object-cover scale-x-[-1]"></video>
                        }

                        @if (!cameraReady() && !capturedSelfie()) {
                          <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-100 text-gray-400">
                             <ng-icon name="heroUser" class="text-8xl opacity-10"></ng-icon>
                             <span class="text-[10px] font-semibold uppercase tracking-[0.2em] animate-pulse">Initializing...</span>
                          </div>
                        }
                        
                        <!-- Scanning lines -->
                        <div 
                          class="absolute inset-0 bg-linear-to-b from-transparent via-purple-500/20 to-transparent h-16 w-full animate-scan pointer-events-none"
                          [class.opacity-0]="!!capturedSelfie()"
                        ></div>
                     </div>

                     <!-- Capture Badge -->
                     @if (capturedSelfie()) {
                        <div class="absolute top-4 right-4 w-12 h-12 bg-green-500 rounded-full border-4 border-white flex items-center justify-center text-white animate-in zoom-in-50 duration-300">
                           <ng-icon name="heroCheckCircle" class="text-2xl"></ng-icon>
                        </div>
                     }
                  </div>

                  <p class="mb-12 max-w-xs text-[13px] text-gray-400 transition-colors" [class.text-green-600]="!!capturedSelfie()">
                     {{ capturedSelfie() ? 'Selfie captured successfully. You can now submit it.' : 'Position your face in the oval and take your photo when you are ready.' }}
                  </p>

                  <div class="flex w-full max-w-sm items-center justify-center gap-4">
                    <button
                      type="button"
                      (click)="captureSelfie()"
                      class="rounded-full border border-gray-100 px-6 py-3 text-sm font-medium text-gray-900 transition-all active:scale-95 hover:bg-gray-50"
                    >
                      {{ capturedSelfie() ? 'Retake selfie' : 'Capture selfie' }}
                    </button>
                    <button 
                      (click)="completeVerification()"
                      [disabled]="!capturedSelfie()"
                      class="flex-1 rounded-2xl bg-[#5932EA] py-4 text-[14px] font-medium text-white transition-all shadow-xl shadow-purple-200 hover:bg-purple-700 active:scale-95 disabled:grayscale disabled:opacity-30"
                    >
                      Submit Selfie
                    </button>
                  </div>
                </div>
              }

              <!-- STEP 7: SUCCESS -->
              @if (currentStep() === 'success') {
                <div class="flex flex-col items-center text-center py-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-md mx-auto">
                  <div class="relative w-56 h-56 mb-8">
                     <img 
                      ngSrc="/assets/images/verification_success_illustration.png" 
                      fill 
                      class="object-contain" 
                      alt="Verification success illustration"
                     >
                  </div>
                  
                  <h3 class="text-[21px] font-semibold text-[#1A1C21] tracking-tight mb-3">Identity Verified Successfully!</h3>
                  <p class="mb-12 text-[13px] leading-relaxed text-gray-400">
                    Your verification is complete. <br> You can now access all services.
                  </p>

                  <button 
                    (click)="submitted.emit(); close.emit()"
                    class="mb-6 w-full rounded-2xl bg-[#5932EA] py-4 text-[14px] font-medium text-white transition-all shadow-xl shadow-purple-200 hover:bg-purple-700 active:scale-95"
                  >
                    Continue
                  </button>
                </div>
              }

            </div>
          </div>
        </div>

        <!-- Footer / Progress Bar -->
        @if (currentStep() !== 'intro' && currentStep() !== 'success') {
          <div class="px-8 py-4 bg-gray-50/50 flex shrink-0">
             <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-purple-600 transition-all duration-500 ease-out"
                  [style.width.%]="progress()"
                ></div>
             </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
    @keyframes scan {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(300%); }
    }
    .animate-scan {
      animation: scan 3s linear infinite;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentityVerificationModalComponent implements OnDestroy {
  close = output<void>();
  submitted = output<void>();

  private readonly documentVideoRef = viewChild<ElementRef<HTMLVideoElement>>('documentVideo');
  private readonly selfieVideoRef = viewChild<ElementRef<HTMLVideoElement>>('selfieVideo');
  
  currentStep = signal<VerificationStep>('intro');
  selectedCountry = 'Nigeria';
  selectedDocType = signal<string | null>(null);
  selectedUploadMethod = signal<'file' | 'webcam' | null>(null);
  capturedDocumentFront = signal<string | null>(null);
  capturedDocumentBack = signal<string | null>(null);
  capturedSelfie = signal<string | null>(null);
  activeDocumentCaptureSide = signal<'front' | 'back'>('front');
  cameraReady = signal(false);

  private mediaStream: MediaStream | null = null;
  private createdObjectUrls = new Set<string>();

  documentTypes = [
    { id: 'passport', name: 'Passport', icon: '🛂' },
    { id: 'license', name: 'Driver\'s License', icon: '🪪' },
    { id: 'id_card', name: 'Identity Card', icon: '🆔' },
    { id: 'resident', name: 'Residence Permit', icon: '🏠' }
  ];

  title = computed(() => {
    switch (this.currentStep()) {
      case 'intro': return '';
      case 'selection': return 'Verify identity';
      case 'upload_method': return 'Verification';
      case 'upload': return 'Verification';
      case 'camera_capture': return 'Verification';
      case 'selfie_intro': return 'Verification';
      case 'selfie_capture': return 'Face verification';
      case 'success': return '';
      default: return 'Identity Verification';
    }
  });

  progress = computed(() => {
    const steps: VerificationStep[] = ['selection', 'upload_method', 'upload', 'camera_capture', 'selfie_intro', 'selfie_capture'];
    const idx = steps.indexOf(this.currentStep());
    if (idx === -1) return 0;
    return ((idx + 1) / steps.length) * 100;
  });

  selectedDocTypeLabel = computed(() => {
    return this.documentTypes.find(d => d.id === this.selectedDocType())?.name || 'document';
  });

  hasDocumentImages = computed(() => !!this.capturedDocumentFront() && !!this.capturedDocumentBack());

  nextStep() {
    const step = this.currentStep();
    
    if (step === 'intro') {
      this.currentStep.set('selection');
    } else if (step === 'selection') {
      this.currentStep.set('upload_method');
    } else if (step === 'upload_method') {
      if (this.selectedUploadMethod() === 'file') {
        this.currentStep.set('upload');
      } else {
        this.currentStep.set('camera_capture');
        this.scheduleCameraStart();
      }
    } else if (step === 'upload') {
      if (!this.hasDocumentImages()) {
        return;
      }
      this.currentStep.set('selfie_intro');
    } else if (step === 'camera_capture') {
      if (!this.hasDocumentImages()) {
        return;
      }
      this.stopCamera();
      this.currentStep.set('selfie_intro');
    } else if (step === 'selfie_intro') {
      this.currentStep.set('selfie_capture');
      this.scheduleCameraStart();
    } else if (step === 'selfie_capture') {
      if (!this.capturedSelfie()) {
        return;
      }
      this.stopCamera();
      this.currentStep.set('success');
    }
  }

  goBack() {
    const step = this.currentStep();
    
    if (step === 'selection') {
      this.currentStep.set('intro');
    } else if (step === 'upload_method') {
      this.currentStep.set('selection');
    } else if (step === 'upload' || step === 'camera_capture') {
      this.stopCamera();
      this.currentStep.set('upload_method');
    } else if (step === 'selfie_intro') {
      if (this.selectedUploadMethod() === 'file') {
        this.currentStep.set('upload');
      } else {
        this.currentStep.set('camera_capture');
        this.scheduleCameraStart();
      }
    } else if (step === 'selfie_capture') {
      this.stopCamera();
      this.currentStep.set('selfie_intro');
    }
  }

  completeVerification() {
    this.nextStep();
  }

  ngOnDestroy() {
    this.stopCamera();
    this.revokeAllObjectUrls();
  }

  openFilePicker(input: HTMLInputElement, event?: Event) {
    event?.stopPropagation();
    input.click();
  }

  onDocumentUpload(side: 'front' | 'back', event: Event) {
    const file = this.getSelectedFile(event);
    if (!file) {
      return;
    }

    this.setDocumentImage(side, this.createObjectUrl(file));
    this.resetFileInput(event);
  }

  captureDocumentImage() {
    const video = this.documentVideoRef()?.nativeElement;
    const captured = this.captureFrameFromVideo(video);
    if (!captured) {
      return;
    }

    this.setDocumentImage(this.activeDocumentCaptureSide(), captured);
    if (this.activeDocumentCaptureSide() === 'front') {
      this.activeDocumentCaptureSide.set('back');
    }
  }

  captureSelfie() {
    const video = this.selfieVideoRef()?.nativeElement;
    const captured = this.captureFrameFromVideo(video, true);
    if (!captured) {
      return;
    }

    this.setManagedImage(this.capturedSelfie, captured);
  }

  private setDocumentImage(side: 'front' | 'back', imageUrl: string) {
    if (side === 'front') {
      this.setManagedImage(this.capturedDocumentFront, imageUrl);
      return;
    }

    this.setManagedImage(this.capturedDocumentBack, imageUrl);
  }

  private setManagedImage(target: typeof this.capturedDocumentFront, imageUrl: string) {
    const previous = target();
    if (previous) {
      this.revokeObjectUrl(previous);
    }
    target.set(imageUrl);
  }

  private getSelectedFile(event: Event): File | null {
    const input = event.target as HTMLInputElement | null;
    return input?.files?.[0] ?? null;
  }

  private resetFileInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input) {
      input.value = '';
    }
  }

  private createObjectUrl(file: File): string {
    const url = URL.createObjectURL(file);
    this.createdObjectUrls.add(url);
    return url;
  }

  private captureFrameFromVideo(video: HTMLVideoElement | undefined, mirror = false): string | null {
    if (!video || !video.videoWidth || !video.videoHeight) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }

    if (mirror) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }

  private async startCamera() {
    this.stopCamera();
    this.cameraReady.set(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      return;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      const video = this.currentStep() === 'selfie_capture'
        ? this.selfieVideoRef()?.nativeElement
        : this.documentVideoRef()?.nativeElement;

      if (!video) {
        this.stopCamera();
        return;
      }

      video.srcObject = this.mediaStream;
      await video.play();
      this.cameraReady.set(true);
    } catch {
      this.stopCamera();
    }
  }

  private scheduleCameraStart() {
    setTimeout(() => {
      void this.startCamera();
    }, 0);
  }

  private stopCamera() {
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.mediaStream = null;
    }

    const documentVideo = this.documentVideoRef()?.nativeElement;
    const selfieVideo = this.selfieVideoRef()?.nativeElement;
    if (documentVideo) {
      documentVideo.srcObject = null;
    }
    if (selfieVideo) {
      selfieVideo.srcObject = null;
    }
    this.cameraReady.set(false);
  }

  private revokeObjectUrl(url: string) {
    if (!this.createdObjectUrls.has(url)) {
      return;
    }
    URL.revokeObjectURL(url);
    this.createdObjectUrls.delete(url);
  }

  private revokeAllObjectUrls() {
    for (const url of this.createdObjectUrls) {
      URL.revokeObjectURL(url);
    }
    this.createdObjectUrls.clear();
  }
}
