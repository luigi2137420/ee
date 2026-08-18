import { Category, Expert } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'med',
    name: 'Medycyna',
    icon: 'Stethoscope',
    subcategories: [
      { id: 'ger', name: 'Geriatria', description: 'Opieka nad osobami starszymi' },
      { id: 'hem', name: 'Hematologia', description: 'Choroby krwi' },
      { id: 'kar', name: 'Kardiologia', description: 'Choroby serca' },
      { id: 'neo', name: 'Neonatologia', description: 'Opieka nad noworodkiem' },
      { id: 'onk', name: 'Onkologia', description: 'Choroby nowotworowe' },
      { id: 'pat', name: 'Patomorfologia', description: 'Badanie tkanek i komórek' },
    ],
  },
  {
    id: 'law',
    name: 'Prawo',
    icon: 'Scale',
    subcategories: [
      { id: 'civ', name: 'Prawo Cywilne', description: 'Sprawy majątkowe i osobiste' },
      { id: 'cri', name: 'Prawo Karne', description: 'Obrona w sprawach karnych' },
      { id: 'fam', name: 'Prawo Rodzinne', description: 'Rozwody, alimenty, opieka' },
    ],
  },
  {
    id: 'uni',
    name: 'Uczelnia',
    icon: 'Book',
    subcategories: [
      { id: 'mat', name: 'Matematyka Dyskretna', description: 'Logika i struktury skończone' },
      { id: 'phy', name: 'Fizyka Kwantowa', description: 'Mechanika mikroświata' },
    ],
  },
  {
    id: 'diet',
    name: 'Dietetyka',
    icon: 'Beef',
    subcategories: [
      { id: 'spo', name: 'Dietetyka Sportowa', description: 'Żywienie w sporcie' },
      { id: 'cli', name: 'Dietetyka Kliniczna', description: 'Żywienie w chorobach' },
    ],
  },
  {
    id: 'gym',
    name: 'Siłownia',
    icon: 'Dumbbell',
    subcategories: [
      { id: 'str', name: 'Trening Siłowy', description: 'Budowa masy i siły' },
      { id: 'pow', name: 'Trójbój Siłowy', description: 'SBD' },
    ],
  },
  {
    id: 'sport',
    name: 'Sport',
    icon: 'Trophy',
    subcategories: [
        { id: 'run', name: 'Bieganie', description: 'Technika i plany' },
    ],
  },
  {
    id: 'fish',
    name: 'Wędkarstwo',
    icon: 'Fish',
    subcategories: [
        { id: 'spin', name: 'Spinning', description: 'Ryby drapieżne' },
    ],
  },
];

export const EXPERTS: Expert[] = [
  {
    id: 'e1',
    name: 'Dr Jan Kowalski',
    photo: null,
    experience: '15 lat doświadczenia w kardiologii klinicznej. Specjalista od trudnych przypadków.',
    price: 99,
    subscriptionTiers: ['Premium', 'Gold'],
    maxResponseTime: '24h',
    avgResponseTime: '4h',
    rating: 4.9,
  },
  {
    id: 'e2',
    name: 'Mec. Anna Nowak',
    photo: null,
    experience: 'Specjalistka prawa rodzinnego. Setki wygranych spraw o alimenty i podziały majątku.',
    price: 150,
    subscriptionTiers: ['Lawyer+'],
    maxResponseTime: '12h',
    avgResponseTime: '2h',
    rating: 5.0,
  },
  {
    id: 'e3',
    name: 'Prof. Adam Zieliński',
    photo: null,
    experience: 'Wykładowca akademicki z 20-letnim stażem. Autor podręczników do matematyki dyskretnej.',
    price: 49,
    subscriptionTiers: ['Student Basic', 'Academic'],
    maxResponseTime: '48h',
    avgResponseTime: '24h',
    rating: 4.8,
  },
];
