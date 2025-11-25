export interface NavigationLink {
  key: string;
  path: string;
}

export const quickLinks: NavigationLink[] = [
  { key: 'footer.aboutUs', path: '/about' },
  { key: 'footer.products', path: '/products' },
  { key: 'footer.services', path: '/services' },
  { key: 'footer.contacts', path: '/contacts' },
  { key: 'footer.news', path: '/news' },
  { key: 'footer.promotions', path: '/promotions' },
  { key: 'footer.faq', path: '/faq' }
];
