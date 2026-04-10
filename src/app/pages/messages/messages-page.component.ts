import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  heroMagnifyingGlass, 
  heroChevronDown, 
  heroFaceSmile, 
  heroPhoto, 
  heroMicrophone,
  heroCheck
} from '@ng-icons/heroicons/outline';

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  replyTo?: string;
  images?: string[];
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  avatar: string;
  online?: boolean;
}

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({ 
      heroMagnifyingGlass, 
      heroChevronDown, 
      heroFaceSmile, 
      heroPhoto, 
      heroMicrophone,
      heroCheck
    })
  ],
  template: `
    <div class="max-w-[1400px] mx-auto animate-in fade-in duration-700">
      
      <!-- Top Header -->
      <header class="flex justify-between items-center mb-8 px-2">
        <h1 class="text-[28px] font-black text-[#1A1C21] tracking-tight">Messages</h1>

        <!-- Store Selector Pill -->
        <div class="relative">
          <div 
             (click)="showStoreDropdown.set(!showStoreDropdown())"
             class="flex items-center gap-3 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-xs cursor-pointer hover:bg-gray-50 transition-all"
          >
             <div class="flex -space-x-2">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop" class="w-6 h-6 rounded-full border-2 border-white object-cover">
                <img src="https://images.unsplash.com/photo-1554151228-14d9def656e4?w=50&h=50&fit=crop" class="w-6 h-6 rounded-full border-2 border-white object-cover">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop" class="w-6 h-6 rounded-full border-2 border-white object-cover border-l-0">
             </div>
             <span class="text-xs font-bold text-gray-700">All stores (4)</span>
             <ng-icon name="heroChevronDown" class="text-gray-400 text-xs border-l border-gray-100 pl-2 ml-1 w-6"></ng-icon>
          </div>

          <!-- Store Selector Dropdown -->
          @if (showStoreDropdown()) {
            <div class="absolute top-full right-0 mt-3 w-80 bg-white rounded-[32px] shadow-2xl border border-gray-50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               <!-- Search Field -->
               <div class="p-6 pb-2">
                  <div class="relative group">
                     <ng-icon name="heroMagnifyingGlass" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></ng-icon>
                     <input 
                        type="text" 
                        placeholder="Search stores"
                        class="w-full bg-gray-50 border-none rounded-full py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-purple-100 transition-all placeholder:text-gray-400"
                     >
                  </div>
               </div>

               <!-- Store List -->
               <div class="px-2 pb-6 space-y-1">
                  <!-- All Stores Option -->
                  <div 
                     (click)="selectedStoreId.set('all'); showStoreDropdown.set(false)"
                     class="flex items-center justify-between p-4 px-5 rounded-[24px] cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                     <div class="flex items-center gap-3">
                        <div class="flex -space-x-1.5">
                           <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop" class="w-5 h-5 rounded-full border border-white">
                           <img src="https://images.unsplash.com/photo-1554151228-14d9def656e4?w=40&h=40&fit=crop" class="w-5 h-5 rounded-full border border-white">
                           <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop" class="w-5 h-5 rounded-full border border-white">
                        </div>
                        <span class="text-[14px] font-bold text-[#1A1C21]">All stores (4)</span>
                     </div>
                     @if (selectedStoreId() === 'all') {
                        <ng-icon name="heroCheck" class="text-purple-600 font-bold"></ng-icon>
                     }
                  </div>

                  <!-- Personal Profile Option -->
                  <div 
                     (click)="selectedStoreId.set('personal'); showStoreDropdown.set(false)"
                     class="flex items-center justify-between p-4 px-5 rounded-[24px] cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                     <div class="flex items-center gap-3">
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop" class="w-8 h-8 rounded-full object-cover">
                        <div class="flex flex-col">
                           <span class="text-[14px] font-bold text-[#1A1C21]">Personal profile</span>
                           <span class="text-[11px] font-medium text-gray-400">Bryan Odjede</span>
                        </div>
                     </div>
                     @if (selectedStoreId() === 'personal') {
                        <ng-icon name="heroCheck" class="text-purple-600 font-bold"></ng-icon>
                     }
                  </div>

                  <!-- Store Items -->
                  <div 
                     (click)="selectedStoreId.set('vine'); showStoreDropdown.set(false)"
                     class="flex items-center gap-3 p-4 px-5 rounded-[24px] cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                     <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop" class="w-10 h-10 rounded-full border-2 border-white object-cover">
                     <div class="flex flex-col">
                        <span class="text-[14px] font-bold text-[#1A1C21]">The Vine Collections</span>
                        <span class="text-[11px] font-medium text-gray-400">Ikeja, Lagos</span>
                     </div>
                  </div>

                  <div 
                     (click)="selectedStoreId.set('eden'); showStoreDropdown.set(false)"
                     class="flex items-center gap-3 p-4 px-5 rounded-[24px] cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                     <img src="https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&fit=crop" class="w-10 h-10 rounded-full border-2 border-white object-cover">
                     <div class="flex flex-col">
                        <span class="text-[14px] font-bold text-[#1A1C21]">Eden Organics</span>
                        <span class="text-[11px] font-medium text-gray-400">Warri, Delta</span>
                     </div>
                  </div>
               </div>
            </div>
            <!-- Backdrop Overlay -->
            <div class="fixed inset-0 z-40" (click)="showStoreDropdown.set(false)"></div>
          }
        </div>
      </header>

      <div class="flex gap-10 h-[calc(100vh-180px)] min-h-[600px]">
        
        <!-- Left Column: Conversations List -->
        <div class="w-80 shrink-0 flex flex-col gap-6">
          <!-- Search Bar -->
          <div class="relative group">
            <ng-icon name="heroMagnifyingGlass" class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-purple-600 transition-colors"></ng-icon>
            <input 
              type="text" 
              placeholder="Search messages"
              class="w-full bg-gray-100/50 border-none rounded-[24px] py-4 pl-14 pr-6 text-[15px] focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-400 font-medium"
            >
          </div>

          <!-- Conversations List -->
          <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
            @for (chat of conversations(); track chat.id) {
              <div 
                (click)="activeChatId.set(chat.id)"
                class="relative group p-4 rounded-[28px] cursor-pointer transition-all flex items-center gap-4 border border-transparent"
                [class.bg-white]="activeChatId() === chat.id"
                [class.shadow-sm]="activeChatId() === chat.id"
                [class.border-gray-50]="activeChatId() === chat.id"
                [class.hover:bg-gray-50]="activeChatId() !== chat.id"
              >
                <!-- Avatar with Badge -->
                <div class="relative w-14 h-14 shrink-0">
                  <img [src]="chat.avatar" class="w-full h-full rounded-2xl object-cover">
                  <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-white shadow-sm">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=30&h=30&fit=crop" class="w-full h-full object-cover">
                  </div>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-baseline mb-1">
                     <h3 class="text-[15px] font-bold text-[#1A1C21] truncate">{{ chat.name }}</h3>
                     <span class="text-[11px] font-bold text-gray-400 group-hover:text-gray-500 transition-colors">{{ chat.time }}</span>
                  </div>
                  <div class="flex justify-between items-center pr-1">
                     <p class="text-[13px] text-gray-400 font-medium truncate pr-2">{{ chat.lastMessage }}</p>
                     @if (chat.unreadCount) {
                        <span class="bg-[#5932EA] text-white text-[10px] font-black rounded-full px-2 py-0.5 shadow-sm">{{ chat.unreadCount }}</span>
                     }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Right Column: Active Chat Area -->
        <div class="flex-1 bg-white border border-gray-50 rounded-[40px] shadow-sm flex flex-col overflow-hidden relative h-full">
          <!-- Chat Header -->
          <div class="p-6 px-10 border-b border-gray-50 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-10">
             <div class="flex items-center gap-4">
                <div class="relative w-12 h-12">
                   <img [src]="activeChat()?.avatar" class="w-full h-full rounded-2xl object-cover">
                   <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white overflow-hidden bg-white shadow-sm">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=30&h=30&fit=crop" class="w-full h-full object-cover">
                   </div>
                </div>
                <div>
                   <h2 class="text-lg font-black text-[#1A1C21] leading-tight">{{ activeChat()?.name }}</h2>
                   <p class="text-[12px] font-semibold text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <span class="w-[6px] h-[6px] rounded-full bg-[#25D366]"></span>
                      Active 25 mins ago
                   </p>
                </div>
             </div>
             <button class="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
                <ng-icon name="heroMagnifyingGlass" class="text-xl"></ng-icon>
             </button>
          </div>

          <!-- Messages Scrollable Area -->
          <div class="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
             
             <!-- Day Separator -->
             <div class="flex justify-center my-4">
                <span class="text-[11px] font-black text-gray-300 uppercase tracking-widest">Today</span>
             </div>

             <!-- Received Message (Regular) -->
             <div class="flex items-start max-w-[70%] animate-in fade-in slide-in-from-left-4 duration-500">
                <div class="bg-[#F3F4F6] text-[#1A1C21] rounded-[24px] rounded-bl-sm p-5 py-4 text-[15px] font-medium leading-relaxed">
                   Good morning, yes i still have the iphone 17 pro max available
                </div>
             </div>

             <!-- Sent Message (Regular) -->
             <div class="flex items-start max-w-[70%] ml-auto animate-in fade-in slide-in-from-right-4 duration-500">
                <div class="bg-[#5932EA] text-white rounded-[24px] rounded-br-sm p-6 py-4 text-[15px] font-medium leading-relaxed shadow-lg shadow-purple-100 relative">
                   Good day👋. Alright great, i want the orang one with 3 cameras delivered this weekend
                </div>
             </div>

             <!-- Received Message (with Reply) -->
             <div class="flex flex-col gap-2 max-w-[75%] animate-in fade-in slide-in-from-left-4 duration-500">
                <span class="text-[11px] font-bold text-gray-400 ml-4 mb-2">Replied to you</span>
                
                <!-- Reply Context -->
                <div class="ml-4 w-[70%] bg-purple-100/30 border-l-4 border-purple-300 rounded-[18px] rounded-bl-none p-4 pr-10 text-[14px] text-purple-600 font-medium mb-[-12px] opacity-80 backdrop-blur-sm">
                   Good day👋. Alright great, i want the orang one with 3 cameras delivered this weekend
                </div>

                <div class="bg-[#F3F4F6] text-[#1A1C21] rounded-[24px] rounded-bl-sm p-5 py-4 text-[15px] font-medium leading-relaxed relative z-10 shadow-sm border border-white">
                   That's no problem at all. We can meet at a place of your choosing
                </div>
             </div>

             <!-- Sent Message (Another) -->
             <div class="flex items-start max-w-[70%] ml-auto animate-in fade-in slide-in-from-right-4 duration-500">
                <div class="bg-[#5932EA] text-white rounded-[24px] rounded-br-sm p-6 py-4 text-[15px] font-medium leading-relaxed shadow-lg shadow-purple-100">
                   Alright. Pls send me some pictures of the phone
                </div>
             </div>

             <!-- Attachment Stack -->
             <div class="flex flex-col items-end gap-3 ml-auto animate-in fade-in slide-in-from-right-4 duration-500">
                <div class="relative flex -space-x-14">
                   <div class="w-36 h-44 rounded-[32px] border-4 border-white shadow-xl overflow-hidden rotate-[-8deg] transform transition-transform hover:rotate-0 duration-300">
                      <img src="https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&fit=crop" class="w-full h-full object-cover">
                   </div>
                   <div class="w-36 h-44 rounded-[32px] border-4 border-white shadow-xl overflow-hidden rotate-[4deg] transform translate-y-4 z-10 transition-transform hover:rotate-0 duration-300">
                      <img src="https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=400&fit=crop" class="w-full h-full object-cover">
                   </div>
                </div>
             </div>

          </div>

          <!-- Bottom Chat Input Bar -->
          <div class="p-4 px-10 bg-white border-t border-gray-50 flex items-center gap-4 shrink-0 shadow-2xl shadow-gray-200">
             <button class="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all">
                <ng-icon name="heroFaceSmile" class="text-2xl"></ng-icon>
             </button>
             <button class="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all">
                <ng-icon name="heroPhoto" class="text-2xl"></ng-icon>
             </button>
             
             <div class="flex-1 relative group">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  class="w-full bg-[#F3F4F6] border-none rounded-full py-4 px-8 text-[15px] text-[#1A1C21] font-medium focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-400"
                >
                <button class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-purple-600 transition-all">
                   <ng-icon name="heroMicrophone" class="text-xl"></ng-icon>
                </button>
             </div>
          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e5e7eb;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #d1d5db;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesPageComponent {
  showStoreDropdown = signal(false);
  selectedStoreId = signal('all');

  activeChatId = signal('2');

  conversations = signal<Conversation[]>([
    {
      id: '1',
      name: 'Bryan Odjede',
      lastMessage: 'I\'m glad you like the perfume',
      time: '15 hrs',
      unreadCount: 148,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
    },
    {
      id: '2',
      name: 'Angela Ugorji',
      lastMessage: 'That\'s no problem at all. We can meet ...',
      time: 'Just now',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      online: true
    },
    {
      id: '3',
      name: 'Ediri Oghenemaro',
      lastMessage: 'Can we meet on Thursday?',
      time: '20/02/2024',
      avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop'
    }
  ]);

  activeChat = () => this.conversations().find(c => c.id === this.activeChatId());
}
