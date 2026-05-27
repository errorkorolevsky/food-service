// Realistic mock orders for admin dashboard demo mode

export type OrderStatus = "pending" | "processing" | "in_delivery" | "delivered" | "cancelled"

export type MockOrder = {
  id:              string
  created_at:      string
  company:         string | null
  phone:           string
  address:         string
  comment:         string | null
  payment:         string
  items:           { id: string; title: string; emoji: string; price: number; quantity: number; note?: string }[]
  subtotal:        number
  delivery:        number
  total:           number
  status:          OrderStatus
  delivery_date?:  string | null
  delivery_time?:  string | null
  user_email?:     string | null
  promo_code?:     string | null
  discount?:       number
}

function daysAgo(n: number, hour = 12, min = 0) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    created_at: daysAgo(0, 9, 14),
    company: null,
    phone: "+7 (701) 234-56-78",
    address: "мкр. Нурсат, ул. Байтерек 45, кв. 12",
    comment: "Позвоните за 20 минут",
    payment: "Kaspi Pay",
    items: [
      { id: "salmon-fillet", title: "Лосось филе", emoji: "🐟", price: 5490, quantity: 2 },
      { id: "shrimp-tiger",  title: "Креветки тигровые", emoji: "🦐", price: 4500, quantity: 1 },
    ],
    subtotal: 15480, delivery: 0, total: 15480,
    status: "pending",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    created_at: daysAgo(0, 10, 45),
    company: null,
    phone: "+7 (702) 345-67-89",
    address: "пр. Тауелсіздік 22, кв. 88",
    comment: null,
    payment: "Наличные",
    items: [
      { id: "beef-ribeye",   title: "Говядина рибай",   emoji: "🥩", price: 6800, quantity: 1 },
      { id: "chicken-whole", title: "Курица целая",      emoji: "🍗", price: 1890, quantity: 2 },
      { id: "milk-3l",       title: "Молоко 3,5% 3л",   emoji: "🥛", price: 1190, quantity: 2 },
    ],
    subtotal: 12960, delivery: 790, total: 13750,
    status: "pending",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    created_at: daysAgo(0, 11, 30),
    company: null,
    phone: "+7 (747) 456-78-90",
    address: "мкр. Аль-Фараби, ул. Жибек Жолы 67, кв. 5",
    comment: "Домофон не работает, звонить на телефон",
    payment: "Kaspi Pay",
    items: [
      { id: "eggs-10",       title: "Яйца отборные 10шт", emoji: "🥚", price: 890,  quantity: 2 },
      { id: "butter-pack",   title: "Масло сливочное 82%", emoji: "🧈", price: 1490, quantity: 3 },
      { id: "cheese-gouda",  title: "Сыр Гауда",           emoji: "🧀", price: 2190, quantity: 1 },
    ],
    subtotal: 8840, delivery: 790, total: 9630,
    status: "pending",
  },
  {
    id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    created_at: daysAgo(1, 14, 20),
    company: null,
    phone: "+7 (705) 567-89-01",
    address: "ул. Кунаева 33, кв. 101",
    comment: null,
    payment: "Онлайн-картой",
    items: [
      { id: "salmon-premium", title: "Лосось Premium",    emoji: "🐟", price: 6200, quantity: 1 },
      { id: "unagi",          title: "Угорь Unagi",       emoji: "🐍", price: 5900, quantity: 1 },
      { id: "crab-meat",      title: "Крабовое мясо",     emoji: "🦀", price: 4100, quantity: 1 },
    ],
    subtotal: 16200, delivery: 0, total: 16200,
    status: "pending",
  },
  {
    id: "e5f6a7b8-c9d0-1234-efab-345678901234",
    created_at: daysAgo(1, 16, 10),
    company: null,
    phone: "+7 (708) 678-90-12",
    address: "пр. Назарбаева 12, кв. 34",
    comment: null,
    payment: "Kaspi Pay",
    items: [
      { id: "tomatoes-kg",   title: "Помидоры 1кг",       emoji: "🍅", price: 590,  quantity: 2 },
      { id: "cucumber-kg",   title: "Огурцы 1кг",         emoji: "🥒", price: 490,  quantity: 1 },
      { id: "pepper-red",    title: "Перец красный",       emoji: "🫑", price: 690,  quantity: 1 },
      { id: "olive-oil",     title: "Масло оливковое",     emoji: "🫙", price: 3490, quantity: 1 },
    ],
    subtotal: 5760, delivery: 790, total: 6550,
    status: "processing",
  },
  {
    id: "f6a7b8c9-d0e1-2345-fabc-456789012345",
    created_at: daysAgo(1, 17, 55),
    company: "Кафе «Самал»",
    phone: "+7 (701) 789-01-23",
    address: "ул. Байтерек 90",
    comment: "Оставить на ресепшн",
    payment: "Онлайн-картой",
    items: [
      { id: "shrimp-tiger",  title: "Креветки тигровые",   emoji: "🦐", price: 4500, quantity: 3 },
      { id: "salmon-fillet", title: "Лосось филе",          emoji: "🐟", price: 5490, quantity: 2 },
      { id: "tuna-fillet",   title: "Тунец филе",           emoji: "🐠", price: 7200, quantity: 1 },
    ],
    subtotal: 35680, delivery: 0, total: 35680,
    status: "processing",
  },
  {
    id: "a7b8c9d0-e1f2-3456-abcd-567890123456",
    created_at: daysAgo(2, 10, 30),
    company: null,
    phone: "+7 (702) 890-12-34",
    address: "мкр. Самал 2, д. 18, кв. 67",
    comment: null,
    payment: "Kaspi Pay",
    items: [
      { id: "beef-ribeye",   title: "Говядина рибай",      emoji: "🥩", price: 6800, quantity: 2 },
      { id: "pork-neck",     title: "Свинина шея",         emoji: "🥩", price: 3200, quantity: 1 },
    ],
    subtotal: 16800, delivery: 0, total: 16800,
    status: "processing",
  },
  {
    id: "b8c9d0e1-f2a3-4567-bcde-678901234567",
    created_at: daysAgo(2, 13, 45),
    company: null,
    phone: "+7 (747) 901-23-45",
    address: "ул. Желтоксан 7, кв. 22",
    comment: "Продукты к холодильнику не прикладывать",
    payment: "Наличные",
    items: [
      { id: "yogurt-pack",   title: "Йогурт Данон 4шт",   emoji: "🫙", price: 1290, quantity: 2 },
      { id: "kefir-1l",      title: "Кефир 2,5% 1л",      emoji: "🥛", price: 490,  quantity: 3 },
      { id: "sour-cream",    title: "Сметана 20% 400г",   emoji: "🥛", price: 690,  quantity: 2 },
      { id: "cottage-cheese",title: "Творог 5% 400г",     emoji: "🫙", price: 890,  quantity: 2 },
    ],
    subtotal: 7900, delivery: 790, total: 8690,
    status: "in_delivery",
  },
  {
    id: "c9d0e1f2-a3b4-5678-cdef-789012345678",
    created_at: daysAgo(2, 15, 20),
    company: null,
    phone: "+7 (705) 012-34-56",
    address: "пр. Тауелсіздік 56, кв. 3",
    comment: null,
    payment: "Kaspi Pay",
    items: [
      { id: "bread-white",   title: "Хлеб пшеничный",     emoji: "🍞", price: 390,  quantity: 2 },
      { id: "bread-whole",   title: "Хлеб цельнозерновой",emoji: "🍞", price: 490,  quantity: 1 },
      { id: "pasta-500",     title: "Паста феттучини 500г",emoji: "🍝", price: 790,  quantity: 2 },
      { id: "rice-1kg",      title: "Рис длиннозерновой", emoji: "🌾", price: 690,  quantity: 2 },
      { id: "sugar-1kg",     title: "Сахар 1кг",          emoji: "🍬", price: 390,  quantity: 2 },
    ],
    subtotal: 5110, delivery: 790, total: 5900,
    status: "in_delivery",
  },
  {
    id: "d0e1f2a3-b4c5-6789-defa-890123456789",
    created_at: daysAgo(3, 9, 0),
    company: "Ресторан «Шымкент»",
    phone: "+7 (701) 123-45-67",
    address: "ул. Рыскулова 120",
    comment: "Въезд с торца здания",
    payment: "Онлайн-картой",
    items: [
      { id: "salmon-fillet", title: "Лосось филе",         emoji: "🐟", price: 5490, quantity: 5 },
      { id: "shrimp-vannamei",title:"Креветки ваннамей",   emoji: "🦐", price: 3800, quantity: 3 },
      { id: "tuna-sashimi",  title: "Тунец для сашими",    emoji: "🐠", price: 7800, quantity: 2 },
    ],
    subtotal: 54600, delivery: 0, total: 54600,
    status: "in_delivery",
  },
  {
    id: "e1f2a3b4-c5d6-7890-efab-901234567890",
    created_at: daysAgo(3, 11, 30),
    company: null,
    phone: "+7 (702) 234-56-78",
    address: "мкр. Аль-Фараби, ул. Кунаева 18, кв. 55",
    comment: null,
    payment: "Kaspi Pay",
    items: [
      { id: "beef-ribeye",   title: "Говядина рибай",     emoji: "🥩", price: 6800, quantity: 1 },
      { id: "milk-3l",       title: "Молоко 3,5% 3л",     emoji: "🥛", price: 1190, quantity: 1 },
      { id: "eggs-10",       title: "Яйца отборные 10шт", emoji: "🥚", price: 890,  quantity: 1 },
      { id: "butter-pack",   title: "Масло сливочное",    emoji: "🧈", price: 1490, quantity: 1 },
    ],
    subtotal: 10370, delivery: 0, total: 10370,
    status: "delivered",
  },
  {
    id: "f2a3b4c5-d6e7-8901-fabc-012345678901",
    created_at: daysAgo(4, 12, 0),
    company: null,
    phone: "+7 (747) 345-67-89",
    address: "ул. Байтерек 33, кв. 9",
    comment: null,
    payment: "Наличные",
    items: [
      { id: "apple-1kg",     title: "Яблоки Голден 1кг",  emoji: "🍎", price: 590,  quantity: 3 },
      { id: "banana-1kg",    title: "Бананы 1кг",          emoji: "🍌", price: 690,  quantity: 2 },
      { id: "orange-1kg",    title: "Апельсины 1кг",       emoji: "🍊", price: 790,  quantity: 2 },
      { id: "watermelon",    title: "Арбуз",               emoji: "🍉", price: 1490, quantity: 1 },
    ],
    subtotal: 5320, delivery: 790, total: 6110,
    status: "delivered",
  },
  {
    id: "a3b4c5d6-e7f8-9012-abcd-123456789012",
    created_at: daysAgo(5, 10, 15),
    company: null,
    phone: "+7 (705) 456-78-90",
    address: "пр. Назарбаева 78, кв. 40",
    comment: null,
    payment: "Kaspi Pay",
    items: [
      { id: "salmon-fillet",  title: "Лосось филе",        emoji: "🐟", price: 5490, quantity: 1 },
      { id: "cheese-gouda",   title: "Сыр Гауда",          emoji: "🧀", price: 2190, quantity: 2 },
      { id: "olive-oil",      title: "Масло оливковое",    emoji: "🫙", price: 3490, quantity: 1 },
      { id: "tomatoes-kg",    title: "Помидоры 1кг",       emoji: "🍅", price: 590,  quantity: 2 },
    ],
    subtotal: 14450, delivery: 0, total: 14450,
    status: "delivered",
  },
  {
    id: "b4c5d6e7-f8a9-0123-bcde-234567890123",
    created_at: daysAgo(6, 14, 45),
    company: "Столовая №3",
    phone: "+7 (708) 567-89-01",
    address: "ул. Пахтакор 14",
    comment: null,
    payment: "Онлайн-картой",
    items: [
      { id: "chicken-whole",  title: "Курица целая",       emoji: "🍗", price: 1890, quantity: 10 },
      { id: "beef-ribeye",    title: "Говядина рибай",     emoji: "🥩", price: 6800, quantity: 3 },
      { id: "potato-2kg",     title: "Картофель 2кг",      emoji: "🥔", price: 590,  quantity: 5 },
    ],
    subtotal: 42350, delivery: 0, total: 42350,
    status: "delivered",
  },
  {
    id: "c5d6e7f8-a9b0-1234-cdef-345678901234",
    created_at: daysAgo(7, 9, 30),
    company: null,
    phone: "+7 (701) 678-90-12",
    address: "мкр. Нурсат, ул. Сейфуллина 21, кв. 4",
    comment: "Консьерж откроет дверь",
    payment: "Kaspi Pay",
    items: [
      { id: "yogurt-pack",    title: "Йогурт Данон 4шт",  emoji: "🫙", price: 1290, quantity: 3 },
      { id: "milk-3l",        title: "Молоко 3,5% 3л",    emoji: "🥛", price: 1190, quantity: 2 },
      { id: "kefir-1l",       title: "Кефир 2,5% 1л",     emoji: "🥛", price: 490,  quantity: 4 },
    ],
    subtotal: 7770, delivery: 790, total: 8560,
    status: "delivered",
  },
  {
    id: "d6e7f8a9-b0c1-2345-defa-456789012345",
    created_at: daysAgo(8, 11, 20),
    company: null,
    phone: "+7 (702) 789-01-23",
    address: "ул. Желтоксан 88, кв. 16",
    comment: null,
    payment: "Наличные",
    items: [
      { id: "pasta-500",      title: "Паста феттучини",   emoji: "🍝", price: 790,  quantity: 2 },
      { id: "rice-1kg",       title: "Рис длиннозерновой",emoji: "🌾", price: 690,  quantity: 1 },
      { id: "sugar-1kg",      title: "Сахар 1кг",         emoji: "🍬", price: 390,  quantity: 2 },
      { id: "flour-2kg",      title: "Мука в/с 2кг",      emoji: "🌾", price: 490,  quantity: 1 },
    ],
    subtotal: 3540, delivery: 790, total: 4330,
    status: "delivered",
  },
  {
    id: "e7f8a9b0-c1d2-3456-efab-567890123456",
    created_at: daysAgo(10, 15, 0),
    company: null,
    phone: "+7 (747) 890-12-34",
    address: "пр. Тауелсіздік 102, кв. 28",
    comment: null,
    payment: "Kaspi Pay",
    items: [
      { id: "unagi",          title: "Угорь Unagi",        emoji: "🐍", price: 5900, quantity: 1 },
      { id: "crab-meat",      title: "Крабовое мясо",      emoji: "🦀", price: 4100, quantity: 1 },
      { id: "shrimp-tiger",   title: "Креветки тигровые",  emoji: "🦐", price: 4500, quantity: 2 },
    ],
    subtotal: 19000, delivery: 0, total: 19000,
    status: "delivered",
  },
  {
    id: "f8a9b0c1-d2e3-4567-fabc-678901234567",
    created_at: daysAgo(12, 10, 10),
    company: null,
    phone: "+7 (705) 901-23-45",
    address: "мкр. Аль-Фараби, д. 55А, кв. 7",
    comment: null,
    payment: "Онлайн-картой",
    items: [
      { id: "beef-ribeye",    title: "Говядина рибай",     emoji: "🥩", price: 6800, quantity: 2 },
      { id: "butter-pack",    title: "Масло сливочное",    emoji: "🧈", price: 1490, quantity: 2 },
      { id: "cheese-gouda",   title: "Сыр Гауда",          emoji: "🧀", price: 2190, quantity: 1 },
      { id: "eggs-10",        title: "Яйца отборные 10шт", emoji: "🥚", price: 890,  quantity: 2 },
    ],
    subtotal: 19640, delivery: 0, total: 19640,
    status: "delivered",
  },
  {
    id: "a9b0c1d2-e3f4-5678-abcd-789012345678",
    created_at: daysAgo(14, 13, 30),
    company: null,
    phone: "+7 (708) 012-34-56",
    address: "ул. Кунаева 5, кв. 91",
    comment: null,
    payment: "Kaspi Pay",
    items: [
      { id: "salmon-steak",   title: "Лосось стейк",       emoji: "🐟", price: 4900, quantity: 2 },
      { id: "tomatoes-kg",    title: "Помидоры 1кг",       emoji: "🍅", price: 590,  quantity: 3 },
      { id: "cucumber-kg",    title: "Огурцы 1кг",         emoji: "🥒", price: 490,  quantity: 2 },
    ],
    subtotal: 12550, delivery: 0, total: 12550,
    status: "delivered",
  },
  {
    id: "b0c1d2e3-f4a5-6789-bcde-890123456789",
    created_at: daysAgo(16, 11, 0),
    company: "Гостиница «Ordabasy»",
    phone: "+7 (701) 234-56-78",
    address: "пр. Кунаева 23",
    comment: "Заезд с главного входа, ресепшн",
    payment: "Онлайн-картой",
    items: [
      { id: "salmon-premium", title: "Лосось Premium",     emoji: "🐟", price: 6200, quantity: 4 },
      { id: "tuna-fillet",    title: "Тунец филе",         emoji: "🐠", price: 7200, quantity: 2 },
      { id: "shrimp-tiger",   title: "Креветки тигровые",  emoji: "🦐", price: 4500, quantity: 3 },
      { id: "crab-meat",      title: "Крабовое мясо",      emoji: "🦀", price: 4100, quantity: 2 },
    ],
    subtotal: 52700, delivery: 0, total: 52700,
    status: "delivered",
  },
  {
    id: "c1d2e3f4-a5b6-7890-cdef-901234567890",
    created_at: daysAgo(18, 14, 20),
    company: null,
    phone: "+7 (702) 345-67-89",
    address: "ул. Байтерек 22, кв. 33",
    comment: null,
    payment: "Наличные",
    items: [
      { id: "chicken-whole",  title: "Курица целая",       emoji: "🍗", price: 1890, quantity: 2 },
      { id: "potato-2kg",     title: "Картофель 2кг",      emoji: "🥔", price: 590,  quantity: 2 },
      { id: "onion-1kg",      title: "Лук репчатый 1кг",  emoji: "🧅", price: 290,  quantity: 2 },
      { id: "carrot-1kg",     title: "Морковь 1кг",        emoji: "🥕", price: 390,  quantity: 2 },
    ],
    subtotal: 6720, delivery: 790, total: 7510,
    status: "delivered",
  },
  {
    id: "d2e3f4a5-b6c7-8901-defa-012345678901",
    created_at: daysAgo(20, 9, 45),
    company: null,
    phone: "+7 (747) 456-78-90",
    address: "пр. Назарбаева 45, кв. 2",
    comment: null,
    payment: "Kaspi Pay",
    items: [
      { id: "bread-white",    title: "Хлеб пшеничный",    emoji: "🍞", price: 390,  quantity: 3 },
      { id: "sour-cream",     title: "Сметана 20% 400г",  emoji: "🥛", price: 690,  quantity: 2 },
      { id: "kefir-1l",       title: "Кефир 2,5% 1л",     emoji: "🥛", price: 490,  quantity: 2 },
    ],
    subtotal: 3530, delivery: 790, total: 4320,
    status: "cancelled",
  },
  {
    id: "e3f4a5b6-c7d8-9012-efab-123456789012",
    created_at: daysAgo(22, 16, 0),
    company: null,
    phone: "+7 (705) 567-89-01",
    address: "мкр. Нурсат, ул. Сейфуллина 5, кв. 78",
    comment: "Отмена — не подошёл адрес",
    payment: "Онлайн-картой",
    items: [
      { id: "beef-ribeye",    title: "Говядина рибай",     emoji: "🥩", price: 6800, quantity: 1 },
      { id: "olive-oil",      title: "Масло оливковое",    emoji: "🫙", price: 3490, quantity: 1 },
    ],
    subtotal: 10290, delivery: 0, total: 10290,
    status: "cancelled",
  },
  {
    id: "f4a5b6c7-d8e9-0123-fabc-234567890123",
    created_at: daysAgo(25, 12, 30),
    company: null,
    phone: "+7 (708) 678-90-12",
    address: "ул. Жибек Жолы 14, кв. 19",
    comment: null,
    payment: "Kaspi Pay",
    items: [
      { id: "salmon-fillet",  title: "Лосось филе",        emoji: "🐟", price: 5490, quantity: 1 },
      { id: "cheese-gouda",   title: "Сыр Гауда",          emoji: "🧀", price: 2190, quantity: 1 },
    ],
    subtotal: 7680, delivery: 790, total: 8470,
    status: "cancelled",
  },
  {
    id: "a5b6c7d8-e9f0-1234-abcd-345678901234",
    created_at: daysAgo(28, 10, 0),
    company: null,
    phone: "+7 (701) 789-01-23",
    address: "пр. Тауелсіздік 77, кв. 60",
    comment: null,
    payment: "Наличные",
    items: [
      { id: "apple-1kg",      title: "Яблоки Голден 1кг",  emoji: "🍎", price: 590,  quantity: 4 },
      { id: "banana-1kg",     title: "Бананы 1кг",          emoji: "🍌", price: 690,  quantity: 3 },
      { id: "milk-3l",        title: "Молоко 3,5% 3л",      emoji: "🥛", price: 1190, quantity: 2 },
      { id: "yogurt-pack",    title: "Йогурт Данон 4шт",   emoji: "🫙", price: 1290, quantity: 2 },
    ],
    subtotal: 7710, delivery: 790, total: 8500,
    status: "delivered",
  },
]

// Mock couriers
export type CourierStatus = "active" | "idle" | "offline"

export type MockCourier = {
  id:      string
  name:    string
  phone:   string
  initials: string
  color:   string
  status:  CourierStatus
  zone:    string
  orderId: string | null
  eta:     string | null
}

export const MOCK_COURIERS: MockCourier[] = [
  {
    id: "courier-1",
    name: "Асхат Бекенов",
    phone: "+7 (701) 111-22-33",
    initials: "АБ",
    color: "#005B46",
    status: "active",
    zone: "мкр. Нурсат",
    orderId: "b8c9d0e1-f2a3-4567-bcde-678901234567",
    eta: "~15 мин",
  },
  {
    id: "courier-2",
    name: "Данияр Сейтов",
    phone: "+7 (702) 222-33-44",
    initials: "ДС",
    color: "#6366f1",
    status: "active",
    zone: "пр. Тауелсіздік",
    orderId: "c9d0e1f2-a3b4-5678-cdef-789012345678",
    eta: "~30 мин",
  },
  {
    id: "courier-3",
    name: "Нурлан Жаксыбек",
    phone: "+7 (747) 333-44-55",
    initials: "НЖ",
    color: "#f59e0b",
    status: "active",
    zone: "ул. Рыскулова",
    orderId: "d0e1f2a3-b4c5-6789-defa-890123456789",
    eta: "~45 мин",
  },
  {
    id: "courier-4",
    name: "Серик Айтбаев",
    phone: "+7 (705) 444-55-66",
    initials: "СА",
    color: "#8b5cf6",
    status: "idle",
    zone: "мкр. Аль-Фараби",
    orderId: null,
    eta: null,
  },
  {
    id: "courier-5",
    name: "Бауыржан Омаров",
    phone: "+7 (708) 555-66-77",
    initials: "БО",
    color: "#ec4899",
    status: "offline",
    zone: "пр. Назарбаева",
    orderId: null,
    eta: null,
  },
]
