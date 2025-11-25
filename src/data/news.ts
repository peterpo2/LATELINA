import { NewsArticle } from '../types';
import { generateNewsImage } from '../utils/imageGenerator';

export const newsArticles: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Как да се подготвим за грипния сезон',
    titleEn: 'How to Prepare for Flu Season',
    excerpt:
      'Практични съвети от нашия екип фармацевти за това как да предпазите семейството си по време на грипния сезон.',
    excerptEn:
      'Practical advice from our pharmacists on how to keep your family safe during flu season.',
    content:
      'Грипният сезон е период, който всяка година поставя на изпитание имунната ни система. За да намалите риска от заболяване, ' +
      'започнете с укрепване на имунитета. Балансираната диета, богата на витамин C, D и цинк, е основа на превенцията. Не забравяйте ' +
      'също така за достатъчен сън и физическа активност.\n\nПосещението на фармацевт може да ви помогне да изберете ' +
      'подходящите добавки и лекарства за първа помощ у дома. Нашите специалисти препоръчват да имате под ръка сироп за кашлица, ' +
      'температуропонижаващо средство и назален спрей. Важно е също да поддържате добра хигиена на ръцете и да проветрявате често помещенията.',
    contentEn:
      'Flu season challenges our immune system every year. To reduce the risk of infection, start by strengthening your immunity. ' +
      'A balanced diet rich in vitamins C, D, and zinc lays the foundation for prevention. Remember to get enough sleep and stay active.\n\n' +
      'Visiting your pharmacist can help you choose the right supplements and first-aid medicines for your home. Our experts recommend ' +
      'keeping cough syrup, fever reducers, and a nasal spray available. Maintaining proper hand hygiene and airing rooms regularly are equally important.',
    category: 'Здравни съвети',
    categoryEn: 'Health Tips',
    author: 'Д-р Мария Стоянова',
    imageUrl: generateNewsImage('How to Prepare for Flu Season', 'Health Tips'),
    publishedAt: '2025-11-05',
    readTimeMinutes: 4,
  },
  {
    id: 'news-2',
    title: 'Ползите от витамин D през зимата',
    titleEn: 'Benefits of Vitamin D in Winter',
    excerpt:
      'Зимните месеци ограничават излагането на слънце, затова добавките с витамин D са важни за костите и имунитета.',
    excerptEn:
      'Limited sunlight in winter makes vitamin D supplementation essential for bones and immunity.',
    content:
      'През зимата много хора страдат от недостиг на витамин D поради по-късите дни и по-малкото време на открито. ' +
      'Витамин D подпомага усвояването на калция, което е жизненоважно за здрави кости и зъби. Освен това, той играе ключова роля за ' +
      'имунната система, нервната система и настроението.\n\nЗа да компенсирате недостига, комбинирайте прием на витамин D3 с витамин K2, ' +
      'който спомага за правилното разпределение на калция в организма. Нашите фармацевти могат да препоръчат оптимални дозировки според ' +
      'вашите нужди и възраст.',
    contentEn:
      'During winter, many people experience vitamin D deficiency due to shorter days and less time outdoors. Vitamin D helps the body ' +
      'absorb calcium, which is essential for healthy bones and teeth. It also plays a vital role in the immune system, nervous system, and mood.\n\n' +
      'To compensate for the deficiency, combine vitamin D3 with vitamin K2, which helps distribute calcium to the right places. Our pharmacists can ' +
      'recommend the optimal dosage for your needs and age.',
    category: 'Витамини и добавки',
    categoryEn: 'Vitamins & Supplements',
    author: 'Фармацевт Николай Петров',
    imageUrl: generateNewsImage('Benefits of Vitamin D in Winter', 'Vitamins & Supplements'),
    publishedAt: '2025-12-12',
    readTimeMinutes: 5,
  },
  {
    id: 'news-3',
    title: 'Грижа за чувствителна кожа през студените месеци',
    titleEn: 'Caring for Sensitive Skin in the Cold Months',
    excerpt:
      'Ниските температури и сухият въздух изискват по-интензивна хидратация и защита на кожата от външни фактори.',
    excerptEn:
      'Cold weather and dry air call for more intense hydration and protection of sensitive skin.',
    content:
      'Кожата става по-чувствителна през зимата поради резките температурни разлики между външната среда и отоплените помещения. ' +
      'Изберете кремове с по-плътна текстура, които задържат влагата и възстановяват защитната бариера. Търсете активни съставки като ' +
      'хиалуронова киселина, пантенол и церамида.\n\nНе забравяйте и за слънцезащитата – UV лъчите присъстват целогодишно. ' +
      'Нежното почистване, последвано от серум и подхранващ крем, ще поддържа кожата спокойна и защитена. При силно раздразнение се ' +
      'консултирайте с дерматолог или фармацевт за подходяща терапия.',
    contentEn:
      'Skin becomes more sensitive during winter due to sharp temperature differences between the cold outdoors and heated indoor spaces. ' +
      'Choose richer creams that lock in moisture and restore the protective barrier. Look for active ingredients like hyaluronic acid, panthenol, and ceramides.\n\n' +
      'Do not forget sunscreen—UV rays are present year-round. Gentle cleansing followed by a serum and nourishing cream will keep your skin calm and protected. ' +
      'If irritation persists, consult a dermatologist or pharmacist for tailored therapy.',
    category: 'Козметика и грижа',
    categoryEn: 'Skincare & Beauty',
    author: 'Дерматолог Анелия Иванова',
    imageUrl: generateNewsImage('Caring for Sensitive Skin in the Cold Months', 'Skincare'),
    publishedAt: '2025-01-08',
    readTimeMinutes: 6,
  },
  {
    id: 'news-4',
    title: 'AI в помощ на фармацевтите',
    titleEn: 'AI Supporting Pharmacists',
    excerpt:
      'Изкуственият интелект помага за по-бърза и точна консултация, персонализирани препоръки и подобрено обслужване.',
    excerptEn:
      'Artificial intelligence enables faster consultations, personalized recommendations, and improved service in pharmacies.',
    content:
      'В AIPHARM+ интегрираме AI решения, които подпомагат фармацевтите в ежедневната им работа. Системата анализира симптоми, ' +
      'лекарствени взаимодействия и наличности в реално време, за да предложи най-подходящите продукти. Това съкращава времето за ' +
      'обслужване и намалява риска от грешки.\n\nAI асистентът ни предоставя персонализирани съвети, базирани на нуждите на клиента, ' +
      'и напомня за предстоящи рефил заявки. Така клиентите получават по-високо качество на обслужване, а фармацевтите могат да се концентрират ' +
      'върху професионалните консултации.',
    contentEn:
      'At AIPHARM+ we integrate AI solutions that support pharmacists in their daily work. The system analyses symptoms, drug interactions, ' +
      'and inventory in real time to suggest the most appropriate products, reducing service time and minimizing errors.\n\nOur AI assistant delivers ' +
      'personalized advice based on customer needs and sends refill reminders. Customers benefit from higher service quality while pharmacists focus on professional consultations.',
    category: 'Технологии',
    categoryEn: 'Technology',
    author: 'AI Specialist Георги Лазаров',
    imageUrl: generateNewsImage('AI Supporting Pharmacists', 'Technology'),
    publishedAt: '2025-01-15',
    readTimeMinutes: 3,
  },
  {
    id: 'news-5',
    title: 'Детско здраве: как да укрепим имунитета',
    titleEn: 'Children’s Health: Boosting Immunity',
    excerpt:
      'Комбинация от правилно хранене, движение и подходящи добавки може да помогне на децата да останат здрави през цялата година.',
    excerptEn:
      'Balanced nutrition, activity, and the right supplements help children stay healthy all year long.',
    content:
      'Имунната система на децата се развива активно и има нужда от подкрепа, особено при посещение на училище или детска градина. ' +
      'Осигурете разнообразно меню, богато на плодове, зеленчуци и протеини. Включете пробиотици за поддържане на здравословна чревна флора, ' +
      'както и витамин C и D за допълнителна защита.\n\nСледете ежедневния режим на децата – редовен сън, достатъчно вода и активности на открито. ' +
      'Нашият екип препоръчва сезонни профилактични консултации, за да адаптирате приема на добавки спрямо актуалните нужди.',
    contentEn:
      'Children’s immune systems are still developing and need support, especially when attending school or kindergarten. Provide a varied diet rich in fruits, ' +
      'vegetables, and proteins. Include probiotics to maintain a healthy gut flora as well as vitamins C and D for additional protection.\n\nMonitor daily routines—regular sleep, enough water, and outdoor play are essential. Our team recommends seasonal preventative consultations to adapt supplement intake to current needs.',
    category: 'Детско здраве',
    categoryEn: 'Children’s Health',
    author: 'Педиатър Елена Русева',
    imageUrl: generateNewsImage('Children’s Health: Boosting Immunity', "Children's Health"),
    publishedAt: '2025-01-20',
    readTimeMinutes: 5,
  },
  {
    id: 'news-6',
    title: 'Стомашен комфорт по време на празници',
    titleEn: 'Digestive Comfort During the Holidays',
    excerpt:
      'Изобилието от храна и напитки може да натовари храносмилателната система – вижте как да предотвратите дискомфорта.',
    excerptEn:
      'Holiday feasts can strain digestion—discover how to prevent discomfort.',
    content:
      'Празничните трапези често водят до тежест и киселини. Подгответе се с пробиотик и ензимен препарат, които подпомагат храносмилането. ' +
      'При първи симптоми на киселини използвайте антиацидни таблетки или суспензии. Ограничете мазните и пикантни храни и не лягайте веднага след хранене.\n\n' +
      'Топлият билков чай с мента или лайка успокоява стомаха, а добавянето на фибри в менюто поддържа добрата перисталтика. При продължителен дискомфорт се ' +
      'консултирайте с гастроентеролог за допълнителни изследвания.',
    contentEn:
      'Festive meals often lead to heaviness and heartburn. Prepare with a probiotic and digestive enzyme supplement to aid digestion. ' +
      'At the first signs of acidity, use antacid tablets or suspensions. Limit fatty and spicy foods and avoid lying down right after eating.\n\n' +
      'Warm herbal tea with mint or chamomile soothes the stomach, and adding fibre to your diet keeps digestion regular. If discomfort persists, consult a gastroenterologist for further evaluation.',
    category: 'Храносмилане',
    categoryEn: 'Digestive Health',
    author: 'Диетолог Виктор Стоилов',
    imageUrl: generateNewsImage('Digestive Comfort During the Holidays', 'Digestive Health'),
    publishedAt: '2025-01-25',
    readTimeMinutes: 4,
  },
];
