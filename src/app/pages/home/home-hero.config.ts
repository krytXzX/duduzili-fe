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
    leftTop: '/assets/images/hero-mens-left-top.png',
    leftBottom: '/assets/images/hero-mens-left-bottom.png',
    rightTop: '/assets/images/hero-mens-right-top.png',
    rightBottom: '/assets/images/hero-mens-right-bottom.png',
  },
  {
    leftTop: '/assets/images/hero-phones-left-top.png',
    leftBottom: '/assets/images/hero-phones-left-bottom.png',
    rightTop: '/assets/images/hero-phones-right-top.png',
    rightBottom: '/assets/images/hero-phones-right-bottom.png',
  },
  {
    leftTop: '/assets/images/hero-cars-left-top.png',
    leftBottom: '/assets/images/hero-cars-left-bottom.png',
    rightTop: '/assets/images/hero-cars-right-top.png',
    rightBottom: '/assets/images/hero-cars-right-bottom.png',
  },
  {
    leftTop: '/assets/images/hero-womens-left-top.png',
    leftBottom: '/assets/images/hero-womens-left-bottom.png',
    rightTop: '/assets/images/hero-womens-right-top.png',
    rightBottom: '/assets/images/hero-womens-right-bottom.png',
  },
  {
    leftTop: '/assets/images/hero-properties-left-top.png',
    leftBottom: '/assets/images/hero-properties-left-bottom.png',
    rightTop: '/assets/images/hero-properties-right-top.png',
    rightBottom: '/assets/images/hero-properties-right-bottom.png',
  },
  {
    leftTop: '/assets/images/hero-electronics-left-top.png',
    leftBottom: '/assets/images/hero-electronics-left-bottom.png',
    rightTop: '/assets/images/hero-electronics-right-top.png',
    rightBottom: '/assets/images/hero-electronics-right-bottom.png',
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
