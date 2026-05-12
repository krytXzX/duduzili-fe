export type HeroCardSet = {
  leftTop: string;
  leftBottom: string;
  rightTop: string;
  rightBottom: string;
};

export type HeroHeadlineItem = {
  id: string;
  label: string;
  icon: string;
  width: number;
};

export const HOME_HERO_CARD_SETS: readonly HeroCardSet[] = [
  {
    leftTop: '/assets/images/home-hero-card-left-top.png',
    leftBottom: '/assets/images/home-hero-card-left-bottom.png',
    rightTop: '/assets/images/home-hero-card-right-top.png',
    rightBottom: '/assets/images/home-hero-card-right-bottom.png',
  },
  {
    leftTop: '/assets/images/listing-nike-sneaker-figma.png',
    leftBottom: '/assets/images/listing-bone-straight-wig-figma.png',
    rightTop: '/assets/images/listing-iphone-17-pro-max-figma.png',
    rightBottom: '/assets/images/listing-logitech-mouse-figma.png',
  },
  {
    leftTop: '/assets/images/listing-rgb-keyboard-figma.png',
    leftBottom: '/assets/images/listing-sweatshirt-figma.png',
    rightTop: '/assets/images/store-vine-cover-mobile.png',
    rightBottom: '/assets/images/store-eden-cover-mobile.png',
  },
  {
    leftTop: '/assets/images/store-snap-cover-mobile.png',
    leftBottom: '/assets/images/store-gomelon-cover-mobile.png',
    rightTop: '/assets/images/home-promo-2.png',
    rightBottom: '/assets/images/home-promo-3.png',
  },
  {
    leftTop: '/assets/images/store-newage-cover-desktop.png',
    leftBottom: '/assets/images/store-amazing-cover-desktop.png',
    rightTop: '/assets/images/store-none-cover-desktop.png',
    rightBottom: '/assets/images/store-swift-cover-desktop.png',
  },
];

export const HOME_HERO_HEADLINE_ITEMS: readonly HeroHeadlineItem[] = [
  {
    id: 'mens-wear',
    label: 'men’s wear',
    icon: '/assets/icons/home-hero-rotator/shoe.svg',
    width: 362,
  },
  {
    id: 'phones',
    label: 'phones',
    icon: '/assets/icons/home-hero-rotator/phone.svg',
    width: 265,
  },
  {
    id: 'cars',
    label: 'cars',
    icon: '/assets/icons/home-hero-rotator/car.svg',
    width: 189,
  },
  {
    id: 'womens-items',
    label: 'women’s items',
    icon: '/assets/icons/home-hero-rotator/heels.svg',
    width: 452,
  },
  {
    id: 'properties',
    label: 'properties',
    icon: '/assets/icons/home-hero-rotator/house.svg',
    width: 339,
  },
  {
    id: 'electronics',
    label: 'electronics',
    icon: '/assets/icons/home-hero-rotator/electronics.svg',
    width: 356,
  },
];
