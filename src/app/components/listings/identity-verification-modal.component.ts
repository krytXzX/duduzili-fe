import { ChangeDetectionStrategy, Component, output, signal, computed, inject } from '@angular/core';
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

          <h2 class="text-lg font-black text-[#1A1C21] tracking-tight">
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
                      class="font-black text-sm tracking-tight transition-colors duration-300"
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
                      class="font-black text-sm tracking-tight transition-colors duration-300"
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
                  
                  <h3 class="text-[32px] font-black text-[#1A1C21] tracking-tight mb-2">Verify your identity</h3>
                  <p class="text-[15px] text-gray-400 font-medium leading-relaxed">
                    We need to verify your identity so we can stay secure and complaint. <br>
                    Please be prepared to upload the following:
                  </p>

                  <div class="w-full space-y-8 text-left mt-10 mb-12 px-2">
                     <div>
                        <div class="flex items-center gap-2 mb-2">
                          <span class="text-[#5932EA] font-black text-lg">01.</span>
                          <h4 class="text-lg font-black text-[#1A1C21]">Government ID</h4>
                        </div>
                        <ul class="space-y-1.5 pl-9">
                          <li class="text-[14px] font-medium text-gray-500 flex items-start gap-2">
                            <span class="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                            Clear and readable. Good lighting helps!
                          </li>
                          <li class="text-[14px] font-medium text-gray-500 flex items-start gap-2">
                            <span class="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                            Not too close to expiration date
                          </li>
                          <li class="text-[14px] font-medium text-gray-500 flex items-start gap-2">
                            <span class="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                            Picture required, no screenshots or copies of any kind
                          </li>
                        </ul>
                     </div>

                     <div>
                        <div class="flex items-center gap-2 mb-2">
                          <span class="text-[#5932EA] font-black text-lg">02.</span>
                          <h4 class="text-lg font-black text-[#1A1C21]">Selfie</h4>
                        </div>
                        <ul class="space-y-1.5 pl-9">
                          <li class="text-[14px] font-medium text-gray-500 flex items-start gap-2">
                            <span class="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                            Clear photo taken with your webcam
                          </li>
                          <li class="text-[14px] font-medium text-gray-500 flex items-start gap-2">
                            <span class="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                            No passport photos or other generic pictures
                          </li>
                        </ul>
                     </div>
                  </div>

                  <button 
                    (click)="nextStep()"
                    class="w-full bg-[#5932EA] hover:bg-purple-700 text-white py-4 rounded-2xl font-black text-[15px] transition-all shadow-xl shadow-purple-200 active:scale-95 mb-6"
                  >
                    Start verification
                  </button>
                </div>
              }

              <!-- STEP 2: SELECTION -->
              @if (currentStep() === 'selection') {
                <div class="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 class="text-[28px] font-black text-[#1A1C21] tracking-tight mb-8">Choose an ID type to add</h3>
                  
                  <div class="space-y-2 mb-8">
                    <label class="text-[13px] font-bold text-gray-500 ml-1">Issuing country/region</label>
                    <div class="relative">
                       <select 
                        [(ngModel)]="selectedCountry"
                        class="w-full bg-white border border-gray-100 rounded-xl p-3 pr-12 text-[#1A1C21] font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
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
                        class="flex items-center justify-between p-4 rounded-2xl border-2 transition-all group"
                        [class.border-[#5932EA]]="selectedDocType() === doc.id"
                        [class.bg-[#F7F5FF]]="selectedDocType() === doc.id"
                        [class.border-transparent]="selectedDocType() !== doc.id"
                        [class.bg-gray-50/50]="selectedDocType() !== doc.id"
                        [class.hover:bg-gray-100]="selectedDocType() !== doc.id"
                      >
                        <div class="flex items-center gap-4 text-left">
                           <div 
                             class="w-12 h-10 shrink-0 rounded-lg bg-contain bg-no-repeat bg-center transition-transform group-hover:scale-110"
                             [style.background-image]="'url(/assets/images/id_type_icons_3d.png)'"
                             [style.background-position]="doc.id === 'license' ? 'left' : (doc.id === 'passport' ? 'center' : 'right')"
                             [style.background-size]="'300% 100%'"
                           ></div>
                           <span class="font-black text-[#1A1C21] text-[15px] opacity-90">{{ doc.name }}</span>
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

                  <p class="text-[13px] font-medium text-gray-400 mb-12">
                    Your ID will be handled according to our <a href="#" class="text-[#5932EA] underline font-bold">Privacy Policy</a> and won't be shared with anyone
                  </p>

                  <div class="flex items-center justify-between gap-4">
                     <button 
                      (click)="close.emit()"
                      class="px-8 py-3 rounded-full border border-gray-100 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all active:scale-95"
                     >
                       Cancel
                     </button>
                     <button 
                      (click)="nextStep()"
                      [disabled]="!selectedDocType()"
                      class="px-10 py-3 bg-[#5932EA] hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-sm font-bold transition-all shadow-lg shadow-purple-100 active:scale-95"
                     >
                       Continue
                     </button>
                  </div>
                </div>
              }

              <!-- STEP 3: UPLOAD METHOD -->
              @if (currentStep() === 'upload_method') {
                <div class="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 class="text-[28px] font-black text-[#1A1C21] tracking-tight mb-3">How would you like to add your government ID?</h3>
                  <p class="text-[15px] text-gray-400 font-medium mb-10">You can upload a file or use your webcam</p>

                  <div class="grid grid-cols-1 gap-3 mb-12">
                     <button 
                      (click)="selectedUploadMethod.set('file')"
                      class="flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left"
                      [class.border-[#5932EA]]="selectedUploadMethod() === 'file'"
                      [class.bg-[#F7F5FF]]="selectedUploadMethod() === 'file'"
                      [class.border-transparent]="selectedUploadMethod() !== 'file'"
                      [class.bg-gray-50/50]="selectedUploadMethod() !== 'file'"
                     >
                        <span class="font-black text-[#1A1C21]">Upload an existing photo</span>
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
                        <span class="font-black text-[#1A1C21]">Take a photo with a webcam</span>
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
                      class="px-8 py-3 rounded-full border border-gray-100 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all active:scale-95"
                     >
                       Back
                     </button>
                     <button 
                      (click)="nextStep()"
                      [disabled]="!selectedUploadMethod()"
                      class="px-10 py-3 bg-[#5932EA] hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-sm font-bold transition-all shadow-lg shadow-purple-100 active:scale-95"
                     >
                       Continue
                     </button>
                  </div>
                </div>
              }

              <!-- STEP 4: UPLOAD -->
              @if (currentStep() === 'upload') {
                <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 class="text-[28px] font-black text-[#1A1C21] tracking-tight mb-2">Upload images of your identity card</h3>
                  <p class="text-[15px] text-gray-400 font-medium mb-10 leading-relaxed max-w-md">
                    Make sure your photos are not blurry and the front of your identity card clearly shows your face
                  </p>

                  <div class="grid grid-cols-2 gap-6 mb-12">
                     <!-- Front -->
                     <div class="flex flex-col">
                        <div class="aspect-[1/1.1] bg-white border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center p-8 transition-all group">
                           <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-6 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                              <ng-icon name="heroIdentification" class="text-2xl"></ng-icon>
                           </div>
                           
                           <button class="px-8 py-2.5 bg-white border border-gray-200 rounded-full text-[13px] font-black text-[#1A1C21] shadow-sm hover:bg-gray-50 transition-all active:scale-95 mb-4">
                              Upload front
                           </button>
                           
                           <span class="text-[11px] font-bold text-gray-300">Jpeg, Png only</span>
                        </div>
                     </div>
                     
                     <!-- Back -->
                     <div class="flex flex-col">
                        <div class="aspect-[1/1.1] bg-white border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center p-8 transition-all group">
                           <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-6 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                              <ng-icon name="heroIdentification" class="text-2xl"></ng-icon>
                           </div>
                           
                           <button class="px-8 py-2.5 bg-white border border-gray-200 rounded-full text-[13px] font-black text-[#1A1C21] shadow-sm hover:bg-gray-50 transition-all active:scale-95 mb-4">
                              Upload back
                           </button>
                           
                           <span class="text-[11px] font-bold text-gray-300">Jpeg, Png only</span>
                        </div>
                     </div>
                  </div>

                  <div class="flex items-center justify-between gap-4 pt-4">
                    <button 
                      (click)="goBack()"
                      class="px-8 py-3 rounded-full border border-gray-100 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Back
                    </button>
                    <button 
                      (click)="nextStep()"
                      class="px-10 py-3 bg-[#5932EA] hover:bg-purple-700 text-white rounded-full text-sm font-bold transition-all shadow-lg shadow-purple-100 active:scale-95"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              }

              <!-- STEP 5: CAMERA CAPTURE -->
              @if (currentStep() === 'camera_capture') {
                <div class="flex flex-col items-center py-2 animate-in fade-in zoom-in-95 duration-500 text-center">
                  <h3 class="text-[28px] font-black text-[#1A1C21] tracking-tight mb-3">Take a photo</h3>
                  <p class="text-[15px] text-gray-400 font-medium mb-10 px-4">Position your {{ selectedDocTypeLabel() }} in the center</p>

                  <div class="relative w-full max-w-sm aspect-3/2 bg-gray-100 rounded-3xl overflow-hidden mb-12 border-4 border-white shadow-xl">
                      <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-400">
                         <ng-icon name="heroCamera" class="text-6xl opacity-20"></ng-icon>
                         <span class="text-[11px] font-black uppercase tracking-widest animate-pulse">Camera Feed...</span>
                      </div>
                      <!-- Mock Scanning Overlay -->
                      <div class="absolute inset-8 border border-white/40 rounded-xl pointer-events-none"></div>
                      <div class="absolute inset-0 bg-linear-to-b from-transparent via-purple-500/10 to-transparent h-12 w-full animate-scan pointer-events-none"></div>
                  </div>

                  <div class="flex items-center gap-6">
                    <button 
                      (click)="goBack()"
                      class="px-8 py-4 rounded-full border border-gray-100 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Back
                    </button>
                    <button 
                      (click)="nextStep()"
                      class="w-16 h-16 rounded-full bg-[#5932EA] hover:bg-purple-700 text-white flex items-center justify-center shadow-xl shadow-purple-200 active:scale-95 group transition-all"
                    >
                       <div class="w-8 h-8 rounded-full border-4 border-white"></div>
                    </button>
                    <div class="w-20"></div> <!-- Spacer for balance -->
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
                  
                  <h3 class="text-[32px] font-black text-[#1A1C21] tracking-tight mb-3">Let's capture a selfie.</h3>
                  <p class="text-[15px] text-gray-400 font-medium mb-12 leading-relaxed">
                    Ensure a well-lit environment and <br> remove your hat or glasses.
                  </p>

                  <button 
                    (click)="nextStep()"
                    class="w-full bg-[#5932EA] hover:bg-purple-700 text-white py-4 rounded-2xl font-black text-[15px] transition-all shadow-xl shadow-purple-200 active:scale-95 mb-6"
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
                      [class.border-purple-600]="!isFaceDetected()"
                      [class.border-green-500]="isFaceDetected()"
                      [class.scale-105]="isFaceDetected()"
                     ></div>
                     
                     <!-- Camera Mock -->
                     <div class="absolute inset-4 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-inner">
                        @if (isFaceDetected()) {
                          <img 
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&auto=format&fit=crop" 
                            class="w-full h-full object-cover animate-in fade-in duration-1000"
                          >
                        } @else {
                          <div class="flex flex-col items-center gap-3 text-gray-400">
                             <ng-icon name="heroUser" class="text-8xl opacity-10"></ng-icon>
                             <span class="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Initializing...</span>
                          </div>
                        }
                        
                        <!-- Scanning lines -->
                        <div 
                          class="absolute inset-0 bg-linear-to-b from-transparent via-purple-500/20 to-transparent h-16 w-full animate-scan pointer-events-none"
                          [class.opacity-0]="isFaceDetected()"
                        ></div>
                     </div>

                     <!-- Capture Badge -->
                     @if (isFaceDetected()) {
                        <div class="absolute top-4 right-4 w-12 h-12 bg-green-500 rounded-full border-4 border-white flex items-center justify-center text-white animate-in zoom-in-50 duration-300">
                           <ng-icon name="heroCheckCircle" class="text-2xl"></ng-icon>
                        </div>
                     }
                  </div>

                  <p class="text-[15px] text-gray-400 font-medium mb-12 max-w-xs transition-colors" [class.text-green-600]="isFaceDetected()">
                     {{ isFaceDetected() ? 'Image captured! Proceeding...' : 'Position your face in the oval until it turns green' }}
                  </p>

                  <button 
                    (click)="completeVerification()"
                    [disabled]="!isFaceDetected()"
                    class="w-full bg-[#5932EA] hover:bg-purple-700 disabled:opacity-30 disabled:grayscale text-white py-4 rounded-2xl font-black text-[15px] transition-all shadow-xl shadow-purple-200 active:scale-95"
                  >
                    Submit Selfie
                  </button>
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
                  
                  <h3 class="text-[32px] font-black text-[#1A1C21] tracking-tight mb-3">Identity Verified Successfully!</h3>
                  <p class="text-[15px] text-gray-400 font-medium mb-12 leading-relaxed">
                    Your verification is complete. <br> You can now access all services.
                  </p>

                  <button 
                    (click)="submitted.emit(); close.emit()"
                    class="w-full bg-[#5932EA] hover:bg-purple-700 text-white py-4 rounded-2xl font-black text-[15px] transition-all shadow-xl shadow-purple-200 active:scale-95 mb-6"
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
export class IdentityVerificationModalComponent {
  close = output<void>();
  submitted = output<void>();
  
  currentStep = signal<VerificationStep>('intro');
  selectedCountry = 'Nigeria';
  selectedDocType = signal<string | null>(null);
  selectedUploadMethod = signal<'file' | 'webcam' | null>(null);
  isFaceDetected = signal(false);

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
      }
    } else if (step === 'upload' || step === 'camera_capture') {
      this.currentStep.set('selfie_intro');
    } else if (step === 'selfie_intro') {
      this.currentStep.set('selfie_capture');
      setTimeout(() => this.isFaceDetected.set(true), 2000);
    } else if (step === 'selfie_capture') {
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
      this.currentStep.set('upload_method');
    } else if (step === 'selfie_intro') {
      if (this.selectedUploadMethod() === 'file') {
        this.currentStep.set('upload');
      } else {
        this.currentStep.set('camera_capture');
      }
    } else if (step === 'selfie_capture') {
      this.currentStep.set('selfie_intro');
    }
  }

  completeVerification() {
    this.nextStep();
  }
}
