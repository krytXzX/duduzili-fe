import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

type HeroCard = {
  readonly name: string;
  readonly imageUrl: string;
  readonly alt: string;
  readonly style: string;
};

type Shortcut = {
  readonly title: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly iconStyle: string;
};

type ProductCard = {
  readonly name: string;
  readonly price: string;
  readonly location: string;
  readonly imageUrl: string;
  readonly badge: string;
};

type PromoCard = {
  readonly title: string;
  readonly caption: string;
  readonly style: string;
  readonly accent: string;
};

type StoreCard = {
  readonly name: string;
  readonly subtitle: string;
  readonly imageUrl: string;
  readonly badge: string;
};

@Component({
  selector: 'app-landing-page',
  imports: [NgOptimizedImage],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block min-h-screen bg-[#fbfaf8]',
  },
})
export class LandingPageComponent {
  protected readonly searchQuery = signal('');

  protected readonly heroCards: readonly HeroCard[] = [
    {
      name: 'Wristwatch',
      alt: 'Silver wristwatch',
      imageUrl:
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=320&q=80',
      style: 'left:16px; top:16px; transform:rotate(-6deg);',
    },
    {
      name: 'Sneakers',
      alt: 'Pair of sneakers',
      imageUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=320&q=80',
      style: 'right:18px; top:12px; transform:rotate(6deg);',
    },
    {
      name: 'Trouser',
      alt: 'Folded trousers',
      imageUrl:
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=320&q=80',
      style: 'left:28px; bottom:20px; transform:rotate(-10deg);',
    },
    {
      name: 'Caps',
      alt: 'Fashion cap',
      imageUrl:
        'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=320&q=80',
      style: 'right:10px; bottom:18px; transform:rotate(8deg);',
    },
  ];

  protected readonly shortcuts: readonly Shortcut[] = [
    { title: 'Automobile', subtitle: '', icon: '🚗', iconStyle: 'background:#dff2ff;' },
    { title: 'Property', subtitle: '', icon: '🏠', iconStyle: 'background:#ffeccc;' },
    { title: 'Phones & Tab', subtitle: '', icon: '📱', iconStyle: 'background:#ffd9d9;' },
    { title: 'Electronics', subtitle: '', icon: '🖥️', iconStyle: 'background:#e6e4ff;' },
    { title: 'Jobs', subtitle: '', icon: '🛠️', iconStyle: 'background:#ffe1f0;' },
    { title: 'Fashion', subtitle: '', icon: '👗', iconStyle: 'background:#e8ffe2;' },
    { title: 'Mothercare', subtitle: '', icon: '🍼', iconStyle: 'background:#fff3cf;' },
    { title: 'More', subtitle: '', icon: '• • •', iconStyle: 'background:#f1f1f1;' },
  ];

  protected readonly sponsoredListings: readonly ProductCard[] = [
    {
      name: 'Nike sneakers',
      price: '₦85,000',
      location: 'Ikeja, Lagos',
      imageUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      badge: 'AD',
    },
    {
      name: 'Beauty shoot',
      price: '₦30,000',
      location: 'Lekki, Lagos',
      imageUrl:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      badge: 'AD',
    },
    {
      name: 'Skincare set',
      price: '₦18,500',
      location: 'Abuja',
      imageUrl:
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      badge: 'AD',
    },
    {
      name: 'Car interior',
      price: '₦120,000',
      location: 'Port Harcourt',
      imageUrl:
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      badge: 'AD',
    },
  ];

  protected readonly nearbyListings: readonly ProductCard[] = [
    {
      name: 'iPhone 16 Pro',
      price: '₦1,280,000',
      location: 'Ikeja',
      imageUrl:
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      badge: 'NEW',
    },
    {
      name: 'Blue cap',
      price: '₦12,000',
      location: 'Yaba',
      imageUrl:
        'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=80',
      badge: 'NEW',
    },
    {
      name: 'Mechanical keys',
      price: '₦52,000',
      location: 'Lekki',
      imageUrl:
        'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80',
      badge: 'HOT',
    },
    {
      name: 'Agbada white',
      price: '₦74,000',
      location: 'Ibadan',
      imageUrl:
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
      badge: 'TOP',
    },
    {
      name: 'Skin serum',
      price: '₦15,000',
      location: 'Lekki',
      imageUrl:
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      badge: 'HOT',
    },
    {
      name: 'Suit jacket',
      price: '₦98,000',
      location: 'Victoria Island',
      imageUrl:
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      badge: 'TOP',
    },
    {
      name: 'Electric sedan',
      price: '₦34,500,000',
      location: 'Abuja',
      imageUrl:
        'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80',
      badge: 'VIP',
    },
    {
      name: 'Oud intense',
      price: '₦47,500',
      location: 'Lekki 1',
      imageUrl:
        'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
      badge: 'NEW',
    },
    {
      name: 'Gaming cap',
      price: '₦11,500',
      location: 'Yaba',
      imageUrl:
        'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80',
      badge: 'HOT',
    },
    {
      name: 'Orange phone',
      price: '₦860,000',
      location: 'Ikeja',
      imageUrl:
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      badge: 'NEW',
    },
    {
      name: 'Creative board',
      price: '₦28,000',
      location: 'Surulere',
      imageUrl:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      badge: 'TOP',
    },
    {
      name: 'Minimal earrings',
      price: '₦22,000',
      location: 'Lekki',
      imageUrl:
        'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=80',
      badge: 'NEW',
    },
  ];

  protected readonly promoCards: readonly PromoCard[] = [
    {
      title: '99 deals',
      caption: 'See the weekend offers',
      style: 'background:linear-gradient(135deg,#ff8f34,#ff5532);',
      accent: '#fff2db',
    },
    {
      title: 'shop now',
      caption: 'boost sales with promos',
      style: 'background:linear-gradient(135deg,#2992ff,#4ec3ff);',
      accent: '#e8f6ff',
    },
    {
      title: 'growth tools',
      caption: 'launch your online store',
      style: 'background:linear-gradient(135deg,#fff0e3,#ffd1af);',
      accent: '#8d5b2f',
    },
  ];

  protected readonly featuredStores: readonly StoreCard[] = [
    {
      name: 'Fresh Mart',
      subtitle: 'Groceries and daily needs',
      badge: '4.8',
      imageUrl:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Glow Hub',
      subtitle: 'Skincare essentials',
      badge: '4.9',
      imageUrl:
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Nature platter',
      subtitle: 'Healthy bowls and salads',
      badge: '4.7',
      imageUrl:
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Orange Tech',
      subtitle: 'Phones and accessories',
      badge: '4.6',
      imageUrl:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Bites and bread',
      subtitle: 'Fresh bakery picks',
      badge: '4.8',
      imageUrl:
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Snap rides',
      subtitle: 'Vehicle care and add-ons',
      badge: '4.5',
      imageUrl:
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    },
  ];

  protected readonly filteredNearbyListings = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return this.nearbyListings;
    }

    return this.nearbyListings.filter((listing) =>
      `${listing.name} ${listing.location} ${listing.badge}`.toLowerCase().includes(query),
    );
  });

  protected updateSearchQuery(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.searchQuery.set(value);
  }
}
