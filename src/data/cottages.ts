import { Cottage } from '../types';

export const cottagesData: Cottage[] = [
  {
    id: 'bashonti',
    name: 'Bashonti Pool Villa',
    type: 'Luxury Pool Villa',
    rating: 5,
    weekdayPrice: 15000,
    weekendPrice: 15000,
    maxGuests: 4,
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'The premier accommodation at Meghpunji Resort. Bashonti Pool Villa is a completely private sanctuary with its own plunge pool overlooking the breathtaking Mizoram hills. Designed elegantly with wooden and glass accents, it offers an immersive cloudy experience inside and outside the room with luxury bedding, spacious layout, and state-of-the-art details.',
    features: [
      'Private infinity plunge pool',
      'Uninterrupted 180° views of the hills and cloud sea',
      'Accommodates up to 4 guests with extra sofa beds',
      'Wood, glass and bamboo custom design architecture',
      'Spacious modern washroom with high-end premium toiletries',
      'Complimentary multi-item local hill breakfast',
      'Welcome specialty drinks and seasonal fruit basket',
      'Daily morning tea and continuous mineral water service'
    ],
    rules: [
      'Check In: 11:30 AM',
      'Check Out: 09:30 AM',
      'Advance Payment: Pay 50% within 24 hours of reserving to confirm booking.',
      'No smoking inside the wooden rooms.'
    ],
    packages: [
      {
        name: 'Royal Pool Villa Package',
        description: 'Complete luxury stay experience for couples or families looking for maximum privacy.',
        features: [
          'All meals (breakfast, lunch, and specialty dinner bar)',
          'Private guided nature trail',
          'Dedicated butler support',
          'A complimentary local handicraft souvenir'
        ]
      }
    ],
    reviews: [
      {
        author: 'Arif Hossain',
        rating: 5,
        text: 'The Bashonti Pool Villa is pure magic. Private, elevated, the pool looks over the entire valley. My partner and I did not want to leave — and almost didn\'t.',
        avatar: 'A',
        date: 'April 2025'
      }
    ]
  },
  {
    id: 'chandrima',
    name: 'Chandrima Cottage',
    type: 'Eco Mud Cottage',
    rating: 5,
    weekdayPrice: 6000,
    weekendPrice: 6000,
    maxGuests: 2,
    image: 'https://www.meghpunji.com/uploads/0000/7/2025/10/04/chandrima-cottage-feature.jpg',
    gallery: [
      'https://www.meghpunji.com/uploads/0000/7/2025/10/04/chandrima-cottage-feature.jpg',
      'https://www.meghpunji.com/uploads/0000/7/2025/10/04/chandrima-cottage-room-exterior-side-view.jpg',
      'https://www.meghpunji.com/uploads/0000/7/2025/10/04/chandrima-cottage-room-interior-bed.jpg'
    ],
    description: 'Chandrima cottage comprises 1 couple Bed, 1 Bedside Table, 1 stand fan, 1 infinity love shaped balcony. The room is furnished with an almirah and 1 large mirror. Our modern-fittings spacious bathroom is equipped with standard toiletries as well as all the amenities. You will get a full infinity hill view of Mizoram from inside and outside the cottage.',
    features: [
      '1 premium Couple Bed for 2 guests',
      'Infinity love-shaped private balcony',
      'Modern tiled spacious washroom with high-end fittings',
      'Complimentary bKash advance booking options',
      'Complimentary standard breakfast, welcome drinks, and tea',
      'Solar energy backup with IPS and backup generator support',
      'Beautiful night lighting and direct entry to the largest garden area'
    ],
    rules: [
      'Check In: 11:30 AM',
      'Check Out: 09:30 AM',
      'Advance Payment: At least 3,060 tk per cottage per night within 24 hours.',
      'Date Modification: Change date once for free if informed 5 days prior.'
    ],
    packages: [
      {
        name: 'Couple Weekday Sanctuary',
        description: 'Charming eco stay designed for couples with complete privacy.',
        features: [
          'Complimentary Breakfast',
          'Welcome Drinks',
          'Morning Tea',
          'Water (1 time)',
          'Standard Toiletries'
        ]
      }
    ],
    reviews: [
      {
        author: 'N.S.R. Arnob',
        rating: 5,
        text: 'One of the best resorts in Sajek Valley. Its well secured, decorated and most importantly you can spend quality time with your loved ones. We stayed at their chandrima cottage. We tried their complementary breakfast (khichuri and egg) which was good. Recommended👍',
        avatar: 'N',
        date: 'June 2025'
      }
    ]
  },
  {
    id: 'meghla',
    name: 'Meghla Cottage',
    type: 'Eco Mud Cottage',
    rating: 5,
    weekdayPrice: 5500,
    weekendPrice: 6000,
    maxGuests: 2,
    image: 'https://www.meghpunji.com/uploads/0000/7/2025/10/04/meghla-cottage-feature.jpg',
    gallery: [
      'https://www.meghpunji.com/uploads/0000/7/2025/10/04/meghla-cottage-feature.jpg',
      'https://www.meghpunji.com/uploads/0000/7/2025/10/04/meghla-cottage-interior-view.jpg'
    ],
    description: 'Meghla cottage comprises 1 couple Bed, 1 Bedside Table, 1 stand fan, 1 infinity love shaped balcony. Furnished with wood and bamboo aesthetics. The spacious washroom features geyser heating, high commode, and full standard toiletries. Features breathtaking views of the misty Mizoram horizon.',
    features: [
      'Wood and glass eco mud architecture',
      'Stunning valley view balcony',
      'Geyser heating and 24-hour running water',
      'Complimentary breakfast included',
      'Zero light pollution night-sky views'
    ],
    rules: [
      'Check In: 11:30 AM',
      'Check Out: 09:30 AM',
      'Advance Payment: Pay 3,060 tk via bKash 01815-761065 within 24 hours.'
    ],
    packages: [
      {
        name: 'Couple Cloud Package',
        description: 'Cozy retreat inside the clouds with natural temperature control.',
        features: [
          'Complimentary Breakfast',
          'Welcome Drinks',
          'Morning Tea',
          'Standard Toiletries'
        ]
      }
    ],
    reviews: [
      {
        author: 'MD. RAZI SAIFULLAH IBN BELAL',
        rating: 5,
        text: 'The weather was beautiful. It\'s very scenic and the cottages are well maintained. Best view in Sajek. Recommended.',
        avatar: 'M',
        date: 'May 2025'
      }
    ]
  },
  {
    id: 'nilima',
    name: 'Nilima Cottage',
    type: 'Eco Mud Cottage',
    rating: 5,
    weekdayPrice: 6000,
    weekendPrice: 6000,
    maxGuests: 2,
    image: 'https://www.meghpunji.com/uploads/0000/7/2025/10/04/nilima-cottage-feature.jpg',
    gallery: [
      'https://www.meghpunji.com/uploads/0000/7/2025/10/04/nilima-cottage-feature.jpg',
      'https://www.meghpunji.com/uploads/0000/7/2025/10/04/nilima-cottage-interior.jpg',
      'https://www.meghpunji.com/uploads/0000/7/2025/10/04/nilima-cottage-washroom-open-window.jpg'
    ],
    description: 'Nilima cottage offers a premium stay with beautiful wood-panel craftsmanship, full-size windows looking into the clouds, and a spacious balcony. The bathroom features an openable cloud window allowing you to wash with views of the mountain treetops.',
    features: [
      'Unique washroom with valley window view',
      'Plush couple bed and warm lighting options',
      'Continuous running warm water with geyser',
      'Complementary morning tea, breakfast and pure drinking water'
    ],
    rules: [
      'Check In: 11:30 AM',
      'Check Out: 09:30 AM',
      'Payment: BKash advance payment required to finalize dates.'
    ],
    packages: [
      {
        name: 'Blue Sky Sanctuary',
        description: 'Immersive eco-stay with panoramic vistas.',
        features: [
          'Breakfast, welcome juices, and afternoon tea tray'
        ]
      }
    ],
    reviews: [
      {
        author: 'Sadia Rahman',
        rating: 5,
        text: 'I have stayed at many resorts in Bangladesh. None have matched the combination of setting, design, and genuine warmth of service that Meghpunji offers. Simply exceptional.',
        avatar: 'S',
        date: 'March 2025'
      }
    ]
  },
  {
    id: 'purbasha',
    name: 'Purbasha Cottage',
    type: 'Eco Mud Cottage',
    rating: 5,
    weekdayPrice: 5500,
    weekendPrice: 6000,
    maxGuests: 2,
    image: 'https://www.meghpunji.com/uploads/0000/7/2025/10/04/purbasha-feature.jpg',
    gallery: [
      'https://www.meghpunji.com/uploads/0000/7/2025/10/04/purbasha-feature.jpg',
      'https://www.meghpunji.com/uploads/0000/7/2025/10/04/purbasha-interior-otherside-view.jpg'
    ],
    description: 'Purbasha Cottage captures the early morning sunrise spectacularly. Designed as a traditional eco-friendly hut structure but packed with modern luxury fittings and spacious walk-in shower rooms.',
    features: [
      'Perfect sunrise exposure from balcony',
      'Bamboo-lined thermal insulation structure',
      'Completely private entrance pathways',
      'Complimentary welcome drinks'
    ],
    rules: [
      'Check In: 11:30 AM',
      'Check Out: 09:30 AM',
      'Modifications: modifications permitted 5 days prior to date.'
    ],
    packages: [
      {
        name: 'Purbasha Sunrise Deal',
        description: 'Designed for early risers who want to photograph the sun climbing above the cloud ocean.',
        features: [
          'Early-access sunrise deck guides',
          'Premium morning tea tray'
        ]
      }
    ],
    reviews: [
      {
        author: 'Nipu Nurunnabi',
        rating: 5,
        text: 'The staff is very friendly and gentle. The resort is locked so that outside people can’t get in. The view from the cottages are amazing. Recommended!',
        avatar: 'N',
        date: 'May 2025'
      }
    ]
  },
  {
    id: 'rodela',
    name: 'Rodela Cottage',
    type: 'Eco Mud Cottage',
    rating: 5,
    weekdayPrice: 5500,
    weekendPrice: 6000,
    maxGuests: 2,
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Rodela represents warmth and sunshine. Perched at an optimized angle to catch the afternoon golden hour, this cottage is perfect for relaxing on your spacious balcony watching the sky turn pink and amber over Mizoram.',
    features: [
      'Spectacular sunset/golden hour view',
      'Spacious bedside table and double wardrobe almirah',
      'IPS solar energy backup for silent continuous fan/light operation',
      'Toiletries and fresh soft organic cotton towels'
    ],
    rules: [
      'Check In: 11:30 AM',
      'Check Out: 09:30 AM',
      'Cancellation: completely non-refundable advance'
    ],
    packages: [
      {
        name: 'Golden Hour Getaway',
        description: 'Unwind with afternoon tea on the balcony watching the mountain shades merge.',
        features: [
          'High tea local pastries basket',
          'Complimentary check-out extensions if available'
        ]
      }
    ],
    reviews: [
      {
        author: 'Pankaj Sarker',
        rating: 5,
        text: 'Meghpunji members is very nice and gentle. Resort locked so that outside people can’t get in. Resort view from the cottages are amazing. Recommended one day stay try this Resort. A perfect place to spend some time alone.',
        avatar: 'P',
        date: 'May 2025'
      }
    ]
  },
  {
    id: 'tarasha',
    name: 'Tarasha Cottage',
    type: 'Eco Mud Cottage',
    rating: 5,
    weekdayPrice: 6000,
    weekendPrice: 6000,
    maxGuests: 2,
    image: 'https://www.meghpunji.com/uploads/0000/7/2025/09/21/tarasha-meghpunji-resort.jpg',
    gallery: [
      'https://www.meghpunji.com/uploads/0000/7/2025/09/21/tarasha-meghpunji-resort.jpg',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Tarasha cottage features a unique stargazing structure. With glass panes optimized to display the clear, unpolluted night skies of Sajek Valley directly from your couple bed, it offers romance and comfort on another level.',
    features: [
      'Stargazing-friendly architecture',
      'Eco-friendly double-walled mud structures that maintain perfect temperature',
      'Private suspended balcony over the valley',
      'Complimentary authentic tea service'
    ],
    rules: [
      'Check In: 11:30 AM',
      'Check Out: 09:30 AM',
      'Payment: 3,060 tk per night required within 24 hours of booking.'
    ],
    packages: [
      {
        name: 'Stargazer Romance Package',
        description: 'Optimized for nights under the Sajek constellations.',
        features: [
          'Late-night warm tea flask',
          'Sky map of visible stars provided',
          'Premium local fruits platter'
        ]
      }
    ],
    reviews: [
      {
        author: 'Razia Begum',
        rating: 5,
        text: 'The mud cottage stays naturally cool even in the heat, the balcony view is jaw-dropping, and the staff feel like hosts rather than staff. We are already planning our return.',
        avatar: 'R',
        date: 'June 2025'
      }
    ]
  }
];
