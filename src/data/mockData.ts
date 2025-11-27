import { Category, Product } from '../types';

export const categories: Category[] = [
  {
    id: 1,
    name: 'Обезболяващи',
    description: 'Лекарства за облекчаване на болка и възпаление',
    icon: 'pill',
  },
  {
    id: 2,
    name: 'Витамини',
    description: 'Хранителни добавки и витамини',
    icon: 'heart',
  },
  {
    id: 3,
    name: 'Простуда и грип',
    description: 'Лекарства за простуда, кашлица и грип',
    icon: 'thermometer',
  },
  {
    id: 4,
    name: 'Стомашно-чревни',
    description: 'Лекарства за храносмилателни проблеми',
    icon: 'stomach',
  },
  {
    id: 5,
    name: 'Кожа и коса',
    description: 'Козметика и дермато-козметични продукти',
    icon: 'droplet',
  },
  {
    id: 6,
    name: 'Детски продукти',
    description: 'Специализирани продукти за деца',
    icon: 'baby',
  },
];

export const products: Product[] = [
  {
    id: 1,
    name: 'Парацетамол 500мг',
    description:
      'Ефективно обезболяващо и жаропонижаващо средство за възрастни и деца над 12 години',
    price: 2.3,
    stockQuantity: 150,
    imageUrl:
      'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 1,
    requiresPrescription: false,
    activeIngredient: 'Парацетамол',
    dosage: '500мг',
    manufacturer: 'Актавис',
    reviewCount: 89,
  },
  {
    id: 2,
    name: 'Ибупрофен 400мг',
    description: 'Противовъзпалително и обезболяващо средство за мускулни и ставни болки',
    price: 3.17,
    stockQuantity: 95,
    imageUrl:
      'https://images.pexels.com/photos/3683081/pexels-photo-3683081.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 1,
    requiresPrescription: false,
    activeIngredient: 'Ибупрофен',
    dosage: '400мг',
    manufacturer: 'Нувита Фарма',
    reviewCount: 67,
  },
  {
    id: 3,
    name: 'Витамин C 1000мг',
    description: 'Високодозов витамин C за укрепване на имунната система',
    price: 6.54,
    stockQuantity: 200,
    imageUrl:
      'https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 2,
    requiresPrescription: false,
    activeIngredient: 'Аскорбинова киселина',
    dosage: '1000мг',
    manufacturer: 'Солгар',
    reviewCount: 134,
    promotion: {
      id: 'promo-vitamin-c',
      title: 'Имунна подкрепа',
      description: 'Вземете 20% отстъпка и подпомогнете имунитета си през студените дни.',
      promoPrice: 5.23,
      discountPercentage: 20,
      validUntil: '2025-03-31',
      badgeColor: 'orange',
    },
  },
  {
    id: 4,
    name: 'Магнезий + Витамин B6',
    description: 'Комбинация за нервната система и мускулната функция',
    price: 7.98,
    stockQuantity: 75,
    imageUrl:
      'https://images.pexels.com/photos/3683083/pexels-photo-3683083.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 2,
    requiresPrescription: false,
    activeIngredient: 'Магнезий оксид, Пиридоксин',
    dosage: '375мг + 2мг',
    manufacturer: 'Натура Вита',
    reviewCount: 98,
    promotion: {
      id: 'promo-magnesium-b6',
      title: 'Релакс пакет',
      description: 'Специална цена за поддържане на нервната система и мускулите.',
      promoPrice: 6.78,
      discountPercentage: 15,
      validUntil: '2025-04-15',
      badgeColor: 'emerald',
    },
  },
  {
    id: 5,
    name: 'Сироп за кашлица',
    description: 'Билков сироп за сухо гърло и кашлица',
    price: 4.55,
    stockQuantity: 120,
    imageUrl:
      'https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 3,
    requiresPrescription: false,
    activeIngredient: 'Екстракт от мед и лимон',
    dosage: '15мл 3 пъти дневно',
    manufacturer: 'Хербал Медика',
    reviewCount: 76,
  },
  {
    id: 6,
    name: 'Назален спрей',
    description: 'За заложен нос при простуда и алергии',
    price: 5.83,
    stockQuantity: 85,
    imageUrl:
      'https://images.pexels.com/photos/3683050/pexels-photo-3683050.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 3,
    requiresPrescription: false,
    activeIngredient: 'Ксилометазолин',
    dosage: '0.1%',
    manufacturer: 'Рино Фарм',
    reviewCount: 52,
  },
  {
    id: 7,
    name: 'Пробиотик комплекс',
    description: 'За здравословна чревна флора и подобрено храносмилане',
    price: 11.5,
    stockQuantity: 60,
    imageUrl:
      'https://images.pexels.com/photos/3683110/pexels-photo-3683110.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 4,
    requiresPrescription: false,
    activeIngredient: 'Лактобацили и бифидобактерии',
    dosage: '1 капсула дневно',
    manufacturer: 'БиоПро',
    reviewCount: 145,
  },
  {
    id: 8,
    name: 'Антиацид таблетки',
    description: 'За киселини и стомашни разстройства',
    price: 3.99,
    stockQuantity: 110,
    imageUrl:
      'https://images.pexels.com/photos/3683048/pexels-photo-3683048.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 4,
    requiresPrescription: false,
    activeIngredient: 'Алуминиев хидроксид',
    dosage: '500мг',
    manufacturer: 'ГастроМед',
    reviewCount: 43,
    promotion: {
      id: 'promo-antacid',
      title: 'Спокойно храносмилане',
      description: '15% отстъпка при симптоми на киселини и стомашен дискомфорт.',
      promoPrice: 3.39,
      discountPercentage: 15,
      validUntil: '2025-02-28',
      badgeColor: 'emerald',
    },
  },
  {
    id: 9,
    name: 'Хидратиращ крем',
    description: 'За суха и чувствителна кожа на лицето и тялото',
    price: 9.66,
    stockQuantity: 90,
    imageUrl:
      'https://images.pexels.com/photos/3683099/pexels-photo-3683099.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 5,
    requiresPrescription: false,
    activeIngredient: 'Хиалуронова киселина',
    dosage: 'Нанасяне 2 пъти дневно',
    manufacturer: 'СкинКеър',
    reviewCount: 112,
  },
  {
    id: 10,
    name: 'Детски сироп парацетамол',
    description: 'Обезболяващо и жаропонижаващо за деца от 3 месеца',
    price: 4.7,
    stockQuantity: 100,
    imageUrl:
      'https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg?auto=compress&cs=tinysrgb&w=400',
    categoryId: 6,
    requiresPrescription: false,
    activeIngredient: 'Парацетамол',
    dosage: '120мг/5мл',
    manufacturer: 'KidsCare',
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
