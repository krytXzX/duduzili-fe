import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/layout/navbar.component';
import { FilterChipsComponent } from '../../components/category/filter-chips.component';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { FooterComponent } from '../../components/layout/footer.component';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FilterChipsComponent,
    ListingCardComponent,
    FooterComponent
  ],
  templateUrl: './category-page.component.html',
  host: { class: 'block h-full overflow-auto' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryPageComponent {
  categoryTitle = signal('Phone & Tablet');
  listingsCount = signal('384,961');

  listings = signal<Listing[]>([
    { id: '1', title: 'Iphone 17 pro max', price: '₦2,500,000', location: 'Lagos', timeAgo: '5 mins ago', isVerified: true, images: ['/assets/images/product_watch_luxury.png', '/assets/images/product_keyboard_rgb.png', '/assets/images/product_sneakers_lifestyle.png'] },
    { id: '2', title: 'Logitech ergonomic mouse', price: '₦35,000', location: 'Lagos', timeAgo: '12 mins ago', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png', '/assets/images/product_watch_luxury.png'] },
    { id: '3', title: 'RGB keyboard', price: '₦35,000', location: 'Lagos', timeAgo: '15 mins ago', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png', '/assets/images/product_sneakers_lifestyle.png'] },
    { id: '4', title: 'Iphone X (64 gb)', price: '₦35,000', location: 'Lagos', timeAgo: '20 mins ago', isVerified: true, images: ['/assets/images/product_watch_luxury.png', '/assets/images/product_keyboard_rgb.png'] },
    { id: '5', title: 'Ergonomic chair', price: '₦35,000', location: 'Lagos', timeAgo: '2 mins ago', isVerified: true, images: ['/assets/images/product_sneakers_lifestyle.png', '/assets/images/product_watch_luxury.png'] },
    { id: '6', title: 'Ergonomic chair', price: '₦35,000', location: 'Lagos', timeAgo: '10 mins ago', isVerified: true, images: ['/assets/images/product_sneakers_lifestyle.png'] },
    { id: '7', title: 'Iphone X (64 gb)', price: '₦35,000', location: 'Lagos', timeAgo: '15 mins ago', isVerified: true, images: ['/assets/images/product_watch_luxury.png'] },
    { id: '8', title: 'Logitech ergonomic mouse', price: '₦35,000', location: 'Lagos', timeAgo: '25 mins ago', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png'] },
    { id: '9', title: 'Iphone 17 pro max', price: '₦2,500,000', location: 'Lagos', timeAgo: '30 mins ago', isVerified: true, images: ['/assets/images/product_watch_luxury.png'] },
    { id: '10', title: 'RGB keyboard', price: '₦35,000', location: 'Lagos', timeAgo: '45 mins ago', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png'] },
    { id: '11', title: 'RGB keyboard', price: '₦35,000', location: 'Lagos', timeAgo: '1 hour ago', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png'] },
    { id: '12', title: 'Logitech ergonomic mouse', price: '₦35,000', location: 'Lagos', timeAgo: '1 hour ago', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png'] },
    { id: '13', title: 'Iphone 17 pro max', price: '₦2,500,000', location: 'Lagos', timeAgo: '2 hours ago', isVerified: true, images: ['/assets/images/product_watch_luxury.png'] },
    { id: '14', title: 'Iphone X (64 gb)', price: '₦35,000', location: 'Lagos', timeAgo: '2 hours ago', isVerified: true, images: ['/assets/images/product_watch_luxury.png'] },
    { id: '15', title: 'Ergonomic chair', price: '₦35,000', location: 'Lagos', timeAgo: '3 hours ago', isVerified: true, images: ['/assets/images/product_sneakers_lifestyle.png'] },
  ]);
}
