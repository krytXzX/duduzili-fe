import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/layout/navbar.component';
import { HeroComponent } from '../../components/home/hero.component';
import { CategoriesComponent } from '../../components/home/categories.component';
import { SectionHeaderComponent } from '../../components/common/section-header.component';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { PromotionsComponent } from '../../components/home/promotions.component';
import { Store, StoreCardComponent } from '../../components/stores/store-card.component';
import { FooterComponent } from '../../components/layout/footer.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroComponent,
    CategoriesComponent,
    SectionHeaderComponent,
    ListingCardComponent,
    PromotionsComponent,
    StoreCardComponent,
    FooterComponent
  ],
  templateUrl: './home-page.component.html',
  host: {
    class: 'block h-full overflow-auto',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  sponsoredListings = signal<Listing[]>([
    { id: 's1', title: 'Premium Sneakers (Yellow/Purple)', price: '₦20,000', location: 'Lagos', timeAgo: '5 mins ago', isVerified: true, images: ['/assets/images/product_sneakers_lifestyle.png', '/assets/images/product_watch_luxury.png'] },
    { id: 's2', title: 'High Density Wig', price: '₦45,000', location: 'Abuja', timeAgo: '12 mins ago', isVerified: true, images: ['/assets/images/fashion_menswear_hero.png', '/assets/images/product_keyboard_rgb.png'] },
    { id: 's3', title: 'iPhone 13 Pro Max - 256GB', price: '₦450,000', location: 'Lagos', timeAgo: '15 mins ago', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png', '/assets/images/fashion_menswear_hero.png'] },
    { id: 's4', title: 'Ergonomic Office Chair', price: '₦85,000', location: 'Enugu', timeAgo: '20 mins ago', isVerified: true, images: ['/assets/images/product_watch_luxury.png', '/assets/images/product_sneakers_lifestyle.png'] },
  ]);

  nearYouListings = signal<Listing[]>([
    { id: 'n1', title: 'iPhone 14 Pro Max', price: '₦750,000', location: 'Lagos', timeAgo: '2 mins ago', images: ['/assets/images/product_sneakers_lifestyle.png'] },
    { id: 'n2', title: 'Logitech G Pro Wireless Mouse', price: '₦55,000', location: 'Lagos', timeAgo: '10 mins ago', images: ['/assets/images/product_keyboard_rgb.png'] },
    { id: 'n3', title: 'Mechanical Keyboard RGB', price: '₦35,000', location: 'Lagos', timeAgo: '15 mins ago', images: ['/assets/images/product_keyboard_rgb.png'] },
    { id: 'n4', title: 'White Essential Hoodie', price: '₦12,000', location: 'Lagos', timeAgo: '25 mins ago', images: ['/assets/images/fashion_menswear_hero.png'] },
    { id: 'n5', title: 'MacBook Air M2', price: '₦1,200,000', location: 'Lagos', timeAgo: '30 mins ago', images: ['/assets/images/product_watch_luxury.png'] },
    { id: 'n6', title: 'Formal Blue Tie', price: '₦5,000', location: 'Lagos', timeAgo: '45 mins ago', images: ['/assets/images/fashion_menswear_hero.png'] },
    { id: 'n7', title: 'Supercar Performance Wax', price: '₦15,000', location: 'Lagos', timeAgo: '1 hour ago', images: ['/assets/images/product_watch_luxury.png'] },
    { id: 'n8', title: 'Skin Care Serum', price: '₦8,500', location: 'Lagos', timeAgo: '1 hour ago', images: ['/assets/images/product_keyboard_rgb.png'] },
    { id: 'n9', title: 'Luxury Chronograph Watch', price: '₦120,000', location: 'Lagos', timeAgo: '2 hours ago', images: ['/assets/images/product_watch_luxury.png'] },
    { id: 'n10', title: 'High Density Serum', price: '₦10,000', location: 'Lagos', timeAgo: '2 hours ago', images: ['/assets/images/product_sneakers_lifestyle.png'] },
  ]);

  featuredStores = signal<Store[]>([
    { id: 'st1', name: 'Techy Collections', followers: '2.5k', isVerified: true, logo: '/assets/images/product_keyboard_rgb.png', banner: '/assets/images/product_keyboard_rgb.png' },
    { id: 'st2', name: 'Glow Beauty', followers: '1.8k', isVerified: true, logo: '/assets/images/product_sneakers_lifestyle.png', banner: '/assets/images/product_sneakers_lifestyle.png' },
    { id: 'st3', name: 'Chic Fashion', followers: '4.2k', isVerified: true, logo: '/assets/images/fashion_menswear_hero.png', banner: '/assets/images/fashion_menswear_hero.png' },
    { id: 'st4', name: 'Gadget Hub', followers: '3.1k', isVerified: true, logo: '/assets/images/product_watch_luxury.png', banner: '/assets/images/product_watch_luxury.png' },
    { id: 'st5', name: 'Lifestyle Men', followers: '1.2k', isVerified: true, logo: '/assets/images/fashion_menswear_hero.png', banner: '/assets/images/fashion_menswear_hero.png' },
    { id: 'st6', name: 'Makeup Art', followers: '2.9k', logo: '/assets/images/product_sneakers_lifestyle.png', banner: '/assets/images/product_sneakers_lifestyle.png' },
    { id: 'st7', name: 'Watch Store', followers: '1.5k', logo: '/assets/images/product_watch_luxury.png', banner: '/assets/images/product_watch_luxury.png' },
    { id: 'st8', name: 'Sneakers Palace', followers: '3.8k', logo: '/assets/images/product_sneakers_lifestyle.png', banner: '/assets/images/product_sneakers_lifestyle.png' },
  ]);
}
