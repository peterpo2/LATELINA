import { Category, Product } from '../types';

export const categories: Category[] = [
  {
    id: 1,
    name: 'Мечета от рози',
    description: 'Ръчно изработени мечета от малки розови цветчета',
    icon: 'heart',
  },
  {
    id: 2,
    name: 'Подаръчни кошници',
    description: 'Готови сетове с шоколад, вино и малки изненади',
    icon: 'gift',
  },
  {
    id: 3,
    name: 'Романтични комплекти',
    description: 'Свещи, картички и малки аксесоари за двама',
    icon: 'sparkles',
  },
  {
    id: 4,
    name: 'Сладки изненади',
    description: 'Луксозни шоколади и бисквити в празнични опаковки',
    icon: 'star',
  },
  {
    id: 5,
    name: 'Декорации',
    description: 'Вечни рози в кутия, фоторамки и лампи',
    icon: 'moon',
  },
  {
    id: 6,
    name: 'Специални поводи',
    description: 'Готови идеи за сватба, годеж или годишнина',
    icon: 'crown',
  },
];

export const products: Product[] = [
  {
    id: 1,
    name: 'Класическо мече от рози',
    description: 'Нежно мече от розови листенца с сатенена панделка.',
    price: 32.5,
    stockQuantity: 28,
    imageUrl: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 1,
    requiresPrescription: false,
    activeIngredient: 'Материал: розови листенца',
    manufacturer: 'Latelina Gifts',
    reviewCount: 89,
  },
  {
    id: 2,
    name: 'Романтично сърце',
    description: 'Сърце от розови цветчета, готово за подарък.',
    price: 27.9,
    stockQuantity: 35,
    imageUrl: 'https://images.pexels.com/photos/3683081/pexels-photo-3683081.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 1,
    requiresPrescription: false,
    activeIngredient: 'Размер: 25 см',
    manufacturer: 'Latelina Gifts',
    reviewCount: 67,
  },
  {
    id: 3,
    name: 'Кошница "Нежност"',
    description: 'Подбрани шоколадови бонбони, мини шампанско и картичка.',
    price: 48.0,
    stockQuantity: 15,
    imageUrl: 'https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 2,
    requiresPrescription: false,
    activeIngredient: 'Съдържание: сладки изненади',
    manufacturer: 'Latelina Gifts',
    reviewCount: 134,
    promotion: {
      id: 'promo-basket-soft',
      title: 'Сладки моменти',
      description: 'Специална цена за празничната кошница с лакомства.',
      promoPrice: 42.0,
      discountPercentage: 12,
      validUntil: '2025-03-31',
      badgeColor: 'orange',
    },
  },
  {
    id: 4,
    name: 'Комплект „Свещи и рози“',
    description: 'Две ароматни свещи и мини мече от рози в подаръчна кутия.',
    price: 36.5,
    stockQuantity: 22,
    imageUrl: 'https://images.pexels.com/photos/3683083/pexels-photo-3683083.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 3,
    requiresPrescription: false,
    activeIngredient: 'Аромат: ванилия и божур',
    manufacturer: 'Latelina Gifts',
    reviewCount: 98,
    promotion: {
      id: 'promo-romantic-set',
      title: 'Романтичен жест',
      description: 'Намаление за комплект свещи и мече за споделени вечери.',
      promoPrice: 31.0,
      discountPercentage: 15,
      validUntil: '2025-04-15',
      badgeColor: 'emerald',
    },
  },
  {
    id: 5,
    name: 'Шоколадов дуо сет',
    description: 'Ръчно подбрани трюфели и бисквити с малини.',
    price: 19.5,
    stockQuantity: 40,
    imageUrl: 'https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 4,
    requiresPrescription: false,
    manufacturer: 'Artisan Treats',
    reviewCount: 76,
  },
  {
    id: 6,
    name: 'Мини тарталети „Лате"',
    description: 'Кутия с 12 мини тарталети с кафе крем и малини.',
    price: 23.8,
    stockQuantity: 32,
    imageUrl: 'https://images.pexels.com/photos/3683050/pexels-photo-3683050.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 4,
    requiresPrescription: false,
    manufacturer: 'Latelina Bakery',
    reviewCount: 52,
  },
  {
    id: 7,
    name: 'Вечна роза в стъклен купол',
    description: 'Роза, която запазва красотата си във витринен купол.',
    price: 54.9,
    stockQuantity: 18,
    imageUrl: 'https://images.pexels.com/photos/3683110/pexels-photo-3683110.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 5,
    requiresPrescription: false,
    manufacturer: 'Latelina Atelier',
    reviewCount: 145,
  },
  {
    id: 8,
    name: 'LED лампа „Луна“',
    description: 'Декоративна лампа с меко сияние и дървена основа.',
    price: 29.9,
    stockQuantity: 30,
    imageUrl: 'https://images.pexels.com/photos/3683048/pexels-photo-3683048.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 5,
    requiresPrescription: false,
    promotion: {
      id: 'promo-moonlight',
      title: 'Нощно сияние',
      description: 'Отстъпка за лампата „Луна“ за уютни вечери.',
      promoPrice: 25.4,
      discountPercentage: 15,
      validUntil: '2025-02-28',
      badgeColor: 'emerald',
    },
  },
  {
    id: 9,
    name: 'Комплект за предложение',
    description: 'Луксозна кутия с рози, място за пръстен и картичка.',
    price: 65.0,
    stockQuantity: 12,
    imageUrl: 'https://images.pexels.com/photos/3683099/pexels-photo-3683099.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 6,
    requiresPrescription: false,
    manufacturer: 'Latelina Atelier',
    reviewCount: 112,
  },
  {
    id: 10,
    name: 'Сет „Годишнина"',
    description: 'Комбинация от мече от рози, шампанско и персонална бележка.',
    price: 72.0,
    stockQuantity: 10,
    imageUrl: 'https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 6,
    requiresPrescription: false,
    manufacturer: 'Latelina Gifts',
    reviewCount: 156,
  },
];

export const getProductById = (id: number): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getProductsByCategory = (categoryId: number): Product[] => {
  return products.filter((p) => p.categoryId === categoryId);
};

export const getCategoryById = (id: number): Category | undefined => {
  return categories.find((c) => c.id === id);
};

export const searchProducts = (searchTerm: string): Product[] => {
  const term = searchTerm.toLowerCase();
  return products.filter((p) => {
    const fields = [
      p.name,
      p.description ?? '',
      p.activeIngredient ?? '',
      p.manufacturer ?? '',
      p.promotion?.title ?? '',
      p.promotion?.description ?? '',
    ];

    return fields.some((field) => field.toLowerCase().includes(term));
  });
};
