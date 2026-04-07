export interface InsightArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface InsightArticleFaq {
  question: string;
  answer: string;
}

export interface InsightArticleLink {
  href: string;
  label: string;
  description: string;
}

export interface InsightArticleCta {
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}

export interface InsightArticle {
  slug: string;
  categoryLabel: string;
  intent: string;
  title: string;
  description: string;
  excerpt: string;
  primaryKeyword: string;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  intro: string;
  takeaways: string[];
  sections: InsightArticleSection[];
  faqs: InsightArticleFaq[];
  relatedLinks: InsightArticleLink[];
  cta: InsightArticleCta;
}

const INSIGHTS: InsightArticle[] = [
  {
    slug: 'best-laptops-for-students-zimbabwe',
    categoryLabel: 'Laptop Guide',
    intent: 'Commercial research',
    title: 'Best Laptops for Students in Zimbabwe: What to Buy Before You Overspend',
    description:
      'A practical buying guide for students in Zimbabwe choosing a laptop for assignments, research, Zoom classes, and everyday use.',
    excerpt:
      'Most students do not need the most expensive laptop. They need something that survives campus life, handles Office and browsing smoothly, and does not become useless after one semester.',
    primaryKeyword: 'best laptops for students zimbabwe',
    publishedAt: '2026-04-03',
    updatedAt: '2026-04-03',
    readTimeMinutes: 6,
    intro:
      'The wrong laptop costs money twice: once when you buy it and again when it starts freezing during assignments. For most students, battery life, SSD storage, and a reliable keyboard matter more than chasing flashy specs.',
    takeaways: [
      'Aim for at least 8GB RAM and an SSD if the laptop will be used for schoolwork every day.',
      'Low-budget buyers should prioritize condition, battery health, and warranty support over cosmetic extras.',
      'Students in Harare benefit from buying from a seller that can help quickly if setup or warranty issues appear.',
    ],
    sections: [
      {
        heading: 'What matters most for a student laptop',
        paragraphs: [
          'Students usually need a machine for Word, Excel, Google Docs, PDF research, email, online classes, and light multitasking. That means a stable mid-range laptop often performs better for the price than a gaming-style device with a weak battery.',
          'A slow processor can still be manageable if the laptop has enough RAM and a proper SSD. A fancy processor with a mechanical hard drive usually feels worse in day-to-day use.',
        ],
        bullets: [
          '8GB RAM is the safe minimum for current school and university workflows.',
          '256GB SSD is workable, while 512GB gives more breathing room.',
          'A 14-inch or 15.6-inch screen is the sweet spot for portability and comfort.',
          'Windows laptops remain the easiest fit for most local school, college, and office software.',
        ],
      },
      {
        heading: 'How to spend at each budget level',
        paragraphs: [
          'Entry-level budgets should focus on dependable used or lower-midrange models from brands with easy parts access. Mid-range budgets can target newer HP, Dell, or Lenovo machines that offer better battery life and less risk of early replacement.',
          'If the laptop will also handle design work, programming, or business use after graduation, paying more for a stronger processor and 16GB RAM can make sense. Otherwise, many buyers overpay for power they never use.',
        ],
      },
      {
        heading: 'Questions to ask before paying',
        paragraphs: [
          'Do not stop at the price tag. Ask what generation the processor is, whether the battery still holds well, and whether the machine is new or pre-owned. That gives a much better view of value.',
          'Local support also matters. If the charger fails, Windows needs activation help, or the buyer needs a bag or mouse added, a responsive store can save time and frustration.',
        ],
        bullets: [
          'Is it brand new, ex-UK, or refurbished?',
          'What is the battery condition and warranty period?',
          'Does the quoted price include charger, bag, or setup help?',
          'Can the seller arrange Harare delivery or collection the same day?',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is 4GB RAM enough for a student laptop in 2026?',
        answer:
          'Only for very light use. Once multiple browser tabs, Office apps, and video calls are involved, 4GB becomes restrictive quickly. 8GB is the safer floor.',
      },
      {
        question: 'Should students buy used laptops in Zimbabwe?',
        answer:
          'Used laptops can be excellent value if condition, battery health, and supplier support are checked properly. The danger is buying purely on price without asking the right questions.',
      },
      {
        question: 'Which brands are safest for student buyers?',
        answer:
          'HP, Dell, and Lenovo are usually the easiest to recommend because they are common locally, have broad model coverage, and are practical for both school and future work use.',
      },
    ],
    relatedLinks: [
      {
        href: '/products/category/laptops',
        label: 'Browse Laptops',
        description: 'See current laptop listings and shortlist options before requesting a quote.',
      },
      {
        href: '/brands/hp',
        label: 'Shop HP',
        description: 'Compare popular HP options that suit school and office use.',
      },
      {
        href: '/delivery',
        label: 'Delivery Info',
        description: 'Check Harare delivery and nationwide courier expectations before ordering.',
      },
    ],
    cta: {
      title: 'Need help choosing the right student laptop?',
      body:
        'Send your budget and intended use. Cansan can narrow the shortlist fast and avoid the common overspend traps.',
      primaryHref: '/products/category/laptops',
      primaryLabel: 'Shop laptops',
      secondaryHref: '/contact',
      secondaryLabel: 'Ask for advice',
    },
  },
  {
    slug: 'hp-vs-dell-laptops-zimbabwe',
    categoryLabel: 'Comparison Guide',
    intent: 'Commercial comparison',
    title: 'HP vs Dell Laptops in Zimbabwe: Which Gives Better Value for Work and School?',
    description:
      'A straightforward comparison of HP and Dell laptops for Zimbabwean buyers who want reliable value, not marketing noise.',
    excerpt:
      'HP and Dell both dominate local laptop demand, but they do not always win for the same reasons. One brand may fit a budget buyer better while the other suits office fleets or longer-term use.',
    primaryKeyword: 'hp vs dell laptops zimbabwe',
    publishedAt: '2026-03-30',
    updatedAt: '2026-03-30',
    readTimeMinutes: 5,
    intro:
      'There is no automatic winner between HP and Dell. The real question is which brand gives the buyer fewer headaches at a specific budget, for a specific job, with realistic support expectations in Zimbabwe.',
    takeaways: [
      'HP often has wider entry and mid-range availability locally, which helps price-sensitive buyers.',
      'Dell is frequently strong for business-focused builds, keyboard feel, and office fleet consistency.',
      'Model condition and supplier support matter more than brand loyalty when comparing two similarly specced machines.',
    ],
    sections: [
      {
        heading: 'Where HP usually wins',
        paragraphs: [
          'HP tends to show up more often in student, office, and retail inventories. That wider availability can make it easier to compare prices and find a suitable machine quickly.',
          'For buyers who want a familiar brand with lots of options from basic to premium, HP is often the easier route.',
        ],
      },
      {
        heading: 'Where Dell often feels stronger',
        paragraphs: [
          'Dell has a strong reputation for solid business laptops, especially when buyers care about keyboard quality, office reliability, and fleet standardisation. That makes Dell attractive for SMEs and buyers who expect longer working hours from the device.',
          'In many cases, Dell also feels like the safer choice when businesses want several matching machines instead of one-off retail purchases.',
        ],
      },
      {
        heading: 'How to make the final decision',
        paragraphs: [
          'Compare the exact model, generation, RAM, storage, warranty, and battery condition. A weaker HP should not beat a stronger Dell just because of price, and the reverse is also true.',
          'If the buyer needs multiple units, business-friendly support and quote speed matter almost as much as the hardware itself.',
        ],
        bullets: [
          'Students and home users should compare the best deal, not just the logo.',
          'Businesses should ask about quantity pricing, warranty handling, and repeat availability.',
          'If two machines are close, choose the one with better battery condition and clearer support terms.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is HP cheaper than Dell in Zimbabwe?',
        answer:
          'Often, but not always. HP commonly has more entry-level supply, which can pull prices down, but exact model and condition still decide the final value.',
      },
      {
        question: 'Which brand is better for office use?',
        answer:
          'Dell is often a strong office choice, especially for business-oriented models. HP is also widely used, so the right answer depends on the exact machine and support package.',
      },
      {
        question: 'Should I mix HP and Dell in one business purchase?',
        answer:
          'You can, but standardising on one brand and a tighter spec range often makes support, accessories, and replacement planning simpler.',
      },
    ],
    relatedLinks: [
      {
        href: '/brands/hp',
        label: 'HP Collection',
        description: 'Review live HP options currently listed by the store.',
      },
      {
        href: '/brands/dell',
        label: 'Dell Collection',
        description: 'Compare Dell models that fit work, school, and office use.',
      },
      {
        href: '/bulk-orders',
        label: 'Bulk Laptop Quotes',
        description: 'Request pricing for multiple office or school laptops at once.',
      },
    ],
    cta: {
      title: 'Comparing HP and Dell for a real budget?',
      body:
        'Share your budget and whether the laptops are for school, business, or mixed use. That makes it easier to recommend the better fit.',
      primaryHref: '/brands/hp',
      primaryLabel: 'View HP options',
      secondaryHref: '/brands/dell',
      secondaryLabel: 'View Dell options',
    },
  },
  {
    slug: 'cctv-installation-cost-harare',
    categoryLabel: 'Security Guide',
    intent: 'Service lead generation',
    title: 'CCTV Installation Cost in Harare: What Affects the Final Quote?',
    description:
      'A local guide to CCTV pricing in Harare, including what changes the final installation quote and where buyers waste money.',
    excerpt:
      'Most buyers ask for the camera price first, but the installation quote depends on more than the camera itself. Cable runs, recorder choice, property size, and remote viewing setup can shift the total sharply.',
    primaryKeyword: 'cctv installation cost harare',
    publishedAt: '2026-03-24',
    updatedAt: '2026-03-24',
    readTimeMinutes: 6,
    intro:
      'Security buyers often under-budget because they focus on the camera count and ignore the rest of the job. Installation, storage, viewing requirements, and site layout are usually where the real cost difference shows up.',
    takeaways: [
      'A four-camera system and an eight-camera system are not just separated by camera count. Recorder size, cabling, and labour also move the price.',
      'The cheapest quote can become the most expensive if image quality, cable quality, or placement is poor.',
      'Commercial buyers should ask for a site check or at least a detailed requirements call before paying.',
    ],
    sections: [
      {
        heading: 'What usually shapes the quote',
        paragraphs: [
          'The final CCTV price is driven by camera quality, property size, installation complexity, and whether the buyer wants remote phone viewing. Long cable runs and multi-floor setups push labour and material costs up quickly.',
          'Storage also matters. If the buyer wants footage kept longer, the recorder and drive capacity need to match that expectation.',
        ],
        bullets: [
          'Number of cameras and resolution',
          'Cable distance and wall or ceiling work required',
          'Recorder size and storage retention needs',
          'Whether remote monitoring must be configured on mobile devices',
        ],
      },
      {
        heading: 'Where people waste money',
        paragraphs: [
          'Some buyers overpay for more cameras when better positioning would cover the risk more effectively. Others underpay for poor-quality night vision and end up with footage that is useless when they actually need it.',
          'Another common mistake is ignoring after-install support. A system that cannot be checked, adjusted, or explained properly creates avoidable follow-up costs.',
        ],
      },
      {
        heading: 'How to brief an installer properly',
        paragraphs: [
          'Buyers should state what they need to monitor: entrance gates, tills, offices, stock rooms, or home perimeters. That changes the camera type and placement strategy immediately.',
          'If the site has weak internet or irregular power, mention that early. It affects how remote viewing and power protection should be planned.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can a CCTV quote be given without visiting the site?',
        answer:
          'Sometimes for a rough estimate, yes. For a cleaner final quote, site layout, cable distance, and camera positions usually need to be confirmed first.',
      },
      {
        question: 'Does a bigger DVR or NVR change the cost much?',
        answer:
          'Yes. Recorder size and storage capacity influence both the upfront price and how long footage can be retained before overwrite.',
      },
      {
        question: 'Is remote phone viewing included automatically?',
        answer:
          'Not always. It depends on the package and whether the internet setup on site can support it properly.',
      },
    ],
    relatedLinks: [
      {
        href: '/services',
        label: 'CCTV and Installation Services',
        description: 'See the service-side offer for supply, setup, and support.',
      },
      {
        href: '/products/category/cctv',
        label: 'Browse CCTV Products',
        description: 'Review cameras and security products before asking for a quote.',
      },
      {
        href: '/contact',
        label: 'Request a Quote',
        description: 'Start a site discussion or send your CCTV requirements directly.',
      },
    ],
    cta: {
      title: 'Need a CCTV quote for home or business?',
      body:
        'Send the number of cameras, your location, and what you want covered. That is enough to start building a realistic quote.',
      primaryHref: '/services',
      primaryLabel: 'View services',
      secondaryHref: '/contact',
      secondaryLabel: 'Request a quote',
    },
  },
  {
    slug: 'best-router-home-wifi-zimbabwe',
    categoryLabel: 'Networking Guide',
    intent: 'Commercial research',
    title: 'Best Router for Home Wi-Fi in Zimbabwe: What Actually Matters',
    description:
      'A guide for buyers choosing a router for home Wi-Fi, with a focus on real performance, coverage, and setup support in Zimbabwe.',
    excerpt:
      'The best router is not the one with the loudest box. It is the one that fits the size of the house, the internet package, and the number of connected devices without becoming unstable.',
    primaryKeyword: 'best router for home wifi zimbabwe',
    publishedAt: '2026-03-18',
    updatedAt: '2026-03-18',
    readTimeMinutes: 5,
    intro:
      'Home Wi-Fi problems are often blamed on the internet provider when the router is the real bottleneck. Buyers who choose the right router and place it properly usually get a far better result than those chasing random brand claims.',
    takeaways: [
      'Coverage and stability matter more than marketing labels for most homes.',
      'A good router in the wrong place still performs badly.',
      'Some homes need an access point or mesh setup, not just a stronger single router.',
    ],
    sections: [
      {
        heading: 'How to choose the right router size',
        paragraphs: [
          'A small apartment and a larger double-storey house should not buy the same Wi-Fi setup. The number of walls, floor levels, and users on the network change what hardware actually works.',
          'If many phones, TVs, laptops, and smart devices are connected at once, a cheap entry router often struggles even if the internet package itself is fine.',
        ],
        bullets: [
          'Small spaces can often use a quality single router.',
          'Larger homes may need multiple access points or a mesh setup.',
          'Remote work, streaming, and gaming increase the need for stability.',
        ],
      },
      {
        heading: 'The specs that matter more than hype',
        paragraphs: [
          'Dual-band support, decent coverage, and reliable brand support matter more than exaggerated speed claims. Buyers should also check whether the router is intended for fibre, LTE backup, or general home networking.',
          'For many buyers, the install and setup support is just as important as the hardware because weak placement and poor configuration waste good equipment.',
        ],
      },
      {
        heading: 'When to move beyond a basic router',
        paragraphs: [
          'If certain rooms never get stable coverage, the answer may be additional access points, cabling, or a more structured home network rather than endlessly replacing the router.',
          'That is especially true for homes with work-from-home demands, CCTV, smart TVs, or multiple family members online at the same time.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can one router cover a whole large house?',
        answer:
          'Sometimes, but not reliably in many layouts. Thick walls, multiple floors, and long distances usually require more than one access point.',
      },
      {
        question: 'Does a more expensive router always mean better Wi-Fi?',
        answer:
          'No. Placement, layout, and the type of internet connection matter a lot. A strong router can still underperform in the wrong setup.',
      },
      {
        question: 'Should I buy the router only, or ask for setup as well?',
        answer:
          'If the buyer is not confident with placement and configuration, setup support is worth it. Good setup often makes a bigger difference than buyers expect.',
      },
    ],
    relatedLinks: [
      {
        href: '/products/category/networking',
        label: 'Shop Networking',
        description: 'Review routers, access points, and networking hardware.',
      },
      {
        href: '/services',
        label: 'Wi-Fi Setup Services',
        description: 'See how home and office networking support is handled.',
      },
      {
        href: '/delivery',
        label: 'Delivery Options',
        description: 'Check whether the hardware can be delivered or collected quickly.',
      },
    ],
    cta: {
      title: 'Need better Wi-Fi at home?',
      body:
        'Share the size of the property, internet type, and where the weak spots are. That makes router recommendations far more accurate.',
      primaryHref: '/products/category/networking',
      primaryLabel: 'Browse networking',
      secondaryHref: '/services',
      secondaryLabel: 'Ask about setup',
    },
  },
  {
    slug: 'choosing-ups-load-shedding-zimbabwe',
    categoryLabel: 'Power Backup Guide',
    intent: 'Commercial research',
    title: 'How to Choose a UPS for Load Shedding in Zimbabwe',
    description:
      'A practical guide to choosing a UPS for laptops, routers, desktop PCs, and small office equipment during power cuts.',
    excerpt:
      'Many buyers choose a UPS by price alone and then discover it cannot support the load they actually have. The right size depends on what you are trying to keep alive and for how long.',
    primaryKeyword: 'ups for load shedding zimbabwe',
    publishedAt: '2026-03-12',
    updatedAt: '2026-03-12',
    readTimeMinutes: 6,
    intro:
      'A UPS is not just about staying online during blackouts. It also protects equipment from abrupt shutdowns and gives users enough time to save work safely. That only happens when the UPS capacity fits the load properly.',
    takeaways: [
      'List the equipment first. A router-only UPS is a different purchase from a desktop backup UPS.',
      'Backup time and power load must be discussed together, not separately.',
      'SMEs should ask for a quote based on real usage rather than guessing from product names.',
    ],
    sections: [
      {
        heading: 'Start with the equipment list',
        paragraphs: [
          'A laptop, router, desktop PC, monitor, and printer do not draw the same amount of power. The more devices you expect the UPS to support, the larger and more expensive the solution becomes.',
          'That is why buyers should start with the exact devices and how long they need them to stay on during a power cut.',
        ],
        bullets: [
          'Router-only backup is usually the lightest requirement.',
          'Desktop plus monitor needs more headroom than laptop-only use.',
          'Printers and high-draw devices often should not be included on small UPS units.',
        ],
      },
      {
        heading: 'Why runtime expectations matter',
        paragraphs: [
          'Some buyers only need five to ten minutes to save work and shut down safely. Others want enough uptime to finish a meeting or keep the internet alive. Those are very different sizing decisions.',
          'A cheap UPS can look attractive until the buyer realises the runtime is too short to be useful.',
        ],
      },
      {
        heading: 'What businesses should ask for',
        paragraphs: [
          'For SME buyers, the smarter move is to ask for recommendations based on how many workstations, routers, and other essentials must remain on. That leads to a more accurate and scalable purchase.',
          'If the office also needs network uptime, pairing backup planning with Wi-Fi and power protection advice usually gives a cleaner solution than buying randomly.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can one UPS power a full office?',
        answer:
          'Usually not unless it is a larger dedicated setup. Most buyers use UPS units for critical devices or smaller workstation groups rather than the entire office.',
      },
      {
        question: 'Is a UPS mainly for power backup or protection?',
        answer:
          'Both. It helps keep equipment running briefly and also protects against abrupt shutdowns and some power-related risk.',
      },
      {
        question: 'Should I use the same UPS for a printer and a router?',
        answer:
          'Not by default. Printers can draw far more power than small networking devices, so they should be sized separately.',
      },
    ],
    relatedLinks: [
      {
        href: '/products',
        label: 'Browse Available Products',
        description: 'Check what power, networking, and office equipment is currently listed.',
      },
      {
        href: '/bulk-orders',
        label: 'Business Quote Support',
        description: 'Request a recommendation for office or multi-device backup needs.',
      },
      {
        href: '/services',
        label: 'Setup and Support',
        description: 'Pair backup planning with installation or networking support if needed.',
      },
    ],
    cta: {
      title: 'Need UPS advice for home or business?',
      body:
        'Send the device list and the runtime you want. That is the fastest way to avoid buying a UPS that is too small.',
      primaryHref: '/bulk-orders',
      primaryLabel: 'Request a quote',
      secondaryHref: '/contact',
      secondaryLabel: 'Talk to Cansan',
    },
  },
  {
    slug: 'office-laptop-buying-guide-zimbabwe',
    categoryLabel: 'B2B Buying Guide',
    intent: 'Lead generation',
    title: 'Office Laptop Buying Guide for Zimbabwean SMEs: Specs That Save Money Long Term',
    description:
      'A business-focused laptop guide for Zimbabwean SMEs buying for teams, departments, or growing offices.',
    excerpt:
      'Office buyers lose money when they buy too cheap and replace too soon, or buy too much power for staff who only need browser and Office performance. Standardising correctly matters.',
    primaryKeyword: 'office laptops zimbabwe',
    publishedAt: '2026-03-08',
    updatedAt: '2026-03-08',
    readTimeMinutes: 6,
    intro:
      'Business laptop buying is not the same as personal laptop buying. The goal is not to find one impressive machine. The goal is to choose practical specifications that are easy to support, repeat, and budget for over time.',
    takeaways: [
      'Standardise where possible so accessories, replacements, and support stay simpler.',
      'Most office roles do not need premium specs, but they do need stable everyday performance.',
      'Quantity pricing, delivery planning, and support responsiveness should influence the supplier choice.',
    ],
    sections: [
      {
        heading: 'Choose specs by job role',
        paragraphs: [
          'Admin staff, sales teams, managers, and design-heavy users do not need the same hardware. Grouping laptop requirements by role is one of the fastest ways to reduce wasted spend.',
          'Many SMEs can cover most staff with a dependable 8GB RAM and SSD setup, then reserve stronger machines for heavier users.',
        ],
      },
      {
        heading: 'Why standardisation helps',
        paragraphs: [
          'When a business buys laptops with wildly different chargers, sizes, and performance levels, support becomes harder. Standardising to one or two sensible models makes training, replacement, and procurement easier.',
          'It also improves buying leverage because repeat purchases become more predictable for the supplier.',
        ],
        bullets: [
          'Fewer accessory mismatches',
          'Simpler support and replacement planning',
          'Cleaner budgeting for future staff growth',
        ],
      },
      {
        heading: 'What to ask the supplier',
        paragraphs: [
          'A good supplier should be able to recommend options by role, confirm stock, explain warranty, and provide a realistic delivery timeline. If they cannot do that clearly before payment, they are unlikely to become easier later.',
          'For larger orders, the speed and clarity of the quote process itself often signals how smoothly the business relationship will go.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Should SMEs buy the same laptop model for every employee?',
        answer:
          'Often yes for most roles, with a second stronger option for heavier workloads. Too many different models usually creates unnecessary complexity.',
      },
      {
        question: 'Is buying the cheapest office laptop a good strategy?',
        answer:
          'Usually no. The cheapest unit often becomes expensive when it slows staff down, fails early, or needs replacement too soon.',
      },
      {
        question: 'What matters most for office productivity?',
        answer:
          'Fast boot times, enough RAM, reliable battery behaviour, and a supplier who can support repeat purchases and after-sales questions.',
      },
    ],
    relatedLinks: [
      {
        href: '/bulk-orders',
        label: 'Bulk Orders',
        description: 'Get business pricing and quantity support for office purchases.',
      },
      {
        href: '/products/category/laptops',
        label: 'Laptop Collection',
        description: 'Review current laptop options before asking for a team quote.',
      },
      {
        href: '/brands/lenovo',
        label: 'Lenovo Collection',
        description: 'Browse a brand often considered for office and productivity use.',
      },
    ],
    cta: {
      title: 'Buying laptops for a team?',
      body:
        'Cansan can help group options by job role and budget so you do not overspend on the wrong machines.',
      primaryHref: '/bulk-orders',
      primaryLabel: 'Request bulk pricing',
      secondaryHref: '/products/category/laptops',
      secondaryLabel: 'View laptop options',
    },
  },
];

export function getInsightHref(slug: string) {
  return `/insights/${slug}`;
}

export function getAllInsights() {
  return [...INSIGHTS].sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  );
}

export function getFeaturedInsights(count = 3) {
  return getAllInsights().slice(0, count);
}

export function getInsightBySlug(slug: string) {
  return INSIGHTS.find((article) => article.slug === slug);
}

export function formatInsightDate(date: string) {
  return new Intl.DateTimeFormat('en-ZW', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}
