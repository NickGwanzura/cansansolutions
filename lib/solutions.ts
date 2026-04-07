export interface SolutionFaq {
  question: string;
  answer: string;
}

export interface SolutionChecklistItem {
  title: string;
  description: string;
}

export interface SolutionRelatedLink {
  href: string;
  label: string;
  description: string;
}

export interface SolutionPage {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  shortDescription: string;
  primaryKeyword: string;
  intent: string;
  heroBody: string;
  buyerSummary: string;
  proofPoints: string[];
  checklistTitle: string;
  checklist: SolutionChecklistItem[];
  processTitle: string;
  processSteps: string[];
  fitTitle: string;
  fitBullets: string[];
  faqs: SolutionFaq[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  relatedLinks: SolutionRelatedLink[];
}

const SOLUTIONS: SolutionPage[] = [
  {
    slug: 'office-laptops',
    eyebrow: 'Business Solution',
    title: 'Office Laptops in Harare for Teams, SMEs, and Growing Businesses',
    description:
      'Get office laptop recommendations, business quotes, and repeatable procurement support in Harare for SMEs, teams, schools, and organisations.',
    shortDescription:
      'A commercial landing page for businesses that need office laptops, standardised specs, bulk quotes, and dependable local support.',
    primaryKeyword: 'office laptops harare',
    intent: 'Commercial lead generation',
    heroBody:
      'This page is built for buyers who need laptops for teams, not one-off impulse purchases. Cansan can help narrow the right spec, shortlist repeatable models, and quote around real business use instead of wasting budget on the wrong hardware.',
    buyerSummary:
      'Best fit for SMEs, schools, NGOs, and growing teams that want practical laptop buying support, quantity pricing, and clearer procurement decisions.',
    proofPoints: [
      'Shortlist laptops by job role instead of guessing one spec for everyone.',
      'Request quote-first business pricing without forcing staff through a retail checkout.',
      'Use one supplier for laptops, accessories, monitors, and rollout support.',
    ],
    checklistTitle: 'What this solution usually includes',
    checklist: [
      {
        title: 'Role-based laptop selection',
        description: 'Choose suitable specs for admin staff, managers, sales teams, and heavier users without overspending across the board.',
      },
      {
        title: 'Brand and model standardisation',
        description: 'Make future repeat orders easier by narrowing to one or two sensible business-ready options.',
      },
      {
        title: 'Accessories and rollout planning',
        description: 'Bundle chargers, bags, mice, monitors, docks, or basic peripherals into one quote when needed.',
      },
    ],
    processTitle: 'How the buying process should work',
    processSteps: [
      'Send the team size, intended roles, preferred brands, and budget range.',
      'Review shortlist options that balance performance, repeatability, and support.',
      'Confirm quantities, delivery timing, and any accessories or setup requirements.',
      'Move to a formal quote and place the order once approval is ready.',
    ],
    fitTitle: 'Why this page matters for revenue',
    fitBullets: [
      'It targets buyers who are closer to purchase than general blog readers.',
      'It gives office buyers a clear path from research to quote request.',
      'It supports both single-department purchases and repeat business procurement.',
    ],
    faqs: [
      {
        question: 'Can Cansan quote office laptops for a team instead of one unit?',
        answer:
          'Yes. This page is intended for team, office, school, and organisational buying where multiple laptops or repeatable specs are needed.',
      },
      {
        question: 'Should every employee get the same laptop model?',
        answer:
          'Usually most staff can be grouped into one practical spec, with a second stronger option for heavier users. That keeps buying and support simpler.',
      },
      {
        question: 'Can office laptop quotes also include accessories?',
        answer:
          'Yes. Quotes can include mice, bags, monitors, docks, and other peripherals that support the rollout.',
      },
    ],
    primaryCtaLabel: 'Request a laptop quote',
    primaryCtaHref: '/bulk-orders',
    secondaryCtaLabel: 'Browse laptop options',
    secondaryCtaHref: '/products/category/laptops',
    relatedLinks: [
      {
        href: '/bulk-orders',
        label: 'Bulk Orders',
        description: 'Move from shortlist to quantity pricing and business quote support.',
      },
      {
        href: '/products/category/laptops',
        label: 'Laptop Collection',
        description: 'Review live laptop listings before sending a quote request.',
      },
      {
        href: '/insights/office-laptop-buying-guide-zimbabwe',
        label: 'Office Laptop Guide',
        description: 'Read the supporting content piece built around SME laptop buying decisions.',
      },
    ],
  },
  {
    slug: 'cctv-packages',
    eyebrow: 'Security Solution',
    title: 'CCTV Packages in Harare for Homes, Shops, Offices, and SMEs',
    description:
      'Request CCTV package quotes in Harare for homes, retail spaces, offices, and small businesses, with product and installation support from Cansan.',
    shortDescription:
      'A commercial landing page for CCTV buyers who need package-style quotes, hardware guidance, and a cleaner path to installation enquiries.',
    primaryKeyword: 'cctv packages harare',
    intent: 'Commercial lead generation',
    heroBody:
      'Most CCTV buyers do not want random parts. They want a working package that fits the property, the risk, and the budget. This page gives that conversation a proper landing point instead of sending security buyers into a generic product catalog.',
    buyerSummary:
      'Best fit for home security, shop surveillance, office coverage, and SME buyers who want structured CCTV quotes and installation planning.',
    proofPoints: [
      'Turn product interest into a proper package discussion instead of piecemeal guessing.',
      'Bridge hardware selection with installation requirements and recorder sizing.',
      'Support both residential and business buyers with clearer next steps.',
    ],
    checklistTitle: 'What a CCTV package discussion should cover',
    checklist: [
      {
        title: 'Camera count and placement',
        description: 'Decide what needs to be seen clearly instead of just adding cameras without a plan.',
      },
      {
        title: 'Recorder and storage retention',
        description: 'Choose DVR or NVR capacity based on how long footage should remain available.',
      },
      {
        title: 'Remote viewing and power realities',
        description: 'Factor in phone viewing, internet reliability, and power protection before finalising the quote.',
      },
    ],
    processTitle: 'How to get to a cleaner CCTV quote',
    processSteps: [
      'Send the property type and what areas need to be covered.',
      'Confirm whether the need is for home, retail, office, or mixed-use security.',
      'Review a package recommendation with camera count, recorder fit, and likely installation considerations.',
      'Approve the quote and move into supply or installation scheduling.',
    ],
    fitTitle: 'Why this page matters for sales',
    fitBullets: [
      'It captures higher-intent buyers looking for CCTV packages, not vague CCTV information.',
      'It shortens the path from search query to quote request.',
      'It supports larger-ticket package sales instead of one-camera purchases only.',
    ],
    faqs: [
      {
        question: 'Can Cansan quote a full CCTV package instead of just individual cameras?',
        answer:
          'Yes. The page is designed exactly for buyers who need a full package discussion, including camera count, recorder fit, and next-step guidance.',
      },
      {
        question: 'Do CCTV packages include installation?',
        answer:
          'Packages can lead into installation enquiries where needed. The final quote depends on the property, cabling distance, and setup complexity.',
      },
      {
        question: 'Is CCTV suitable for both homes and businesses?',
        answer:
          'Yes. This page supports home buyers, shops, offices, schools, and SMEs that need a clearer package and quote path.',
      },
    ],
    primaryCtaLabel: 'Request a CCTV quote',
    primaryCtaHref: '/contact',
    secondaryCtaLabel: 'Browse CCTV products',
    secondaryCtaHref: '/products/category/cctv',
    relatedLinks: [
      {
        href: '/services',
        label: 'CCTV and Installation Services',
        description: 'See the service-side offer behind CCTV supply and setup enquiries.',
      },
      {
        href: '/products/category/cctv',
        label: 'CCTV Products',
        description: 'Review live security hardware before asking for a package recommendation.',
      },
      {
        href: '/insights/cctv-installation-cost-harare',
        label: 'CCTV Cost Guide',
        description: 'Read what affects CCTV installation pricing in Harare before requesting a quote.',
      },
    ],
  },
  {
    slug: 'home-wifi-setup',
    eyebrow: 'Networking Solution',
    title: 'Home Wi-Fi Setup in Harare for Better Coverage, Stability, and Speed',
    description:
      'Get home Wi-Fi setup help in Harare, including router recommendations, access points, mesh planning, and practical networking support.',
    shortDescription:
      'A commercial landing page for buyers searching for better home Wi-Fi, router advice, and setup support rather than isolated networking products.',
    primaryKeyword: 'home wifi setup harare',
    intent: 'Commercial lead generation',
    heroBody:
      'Weak Wi-Fi wastes time every day. This page is built for buyers who want a practical home networking fix, whether that means a better router, access points, or a cleaner layout for the space.',
    buyerSummary:
      'Best fit for houses, apartments, work-from-home users, and families dealing with weak coverage, unstable streaming, or poor router placement.',
    proofPoints: [
      'Moves the buyer from “my Wi-Fi is bad” into a concrete hardware and setup discussion.',
      'Supports router-only, access-point, and broader home network recommendations.',
      'Targets a local service-and-product query with clear conversion intent.',
    ],
    checklistTitle: 'What a good home Wi-Fi solution should consider',
    checklist: [
      {
        title: 'Coverage by room, not by marketing claims',
        description: 'The number of walls, floors, and dead zones matters more than box-level hype.',
      },
      {
        title: 'Router versus access point decision',
        description: 'Some homes need a stronger single device, while others need extra nodes or access points.',
      },
      {
        title: 'Setup that matches actual internet use',
        description: 'Streaming, remote work, CCTV, gaming, and school use all change what hardware makes sense.',
      },
    ],
    processTitle: 'How this solution should be used',
    processSteps: [
      'Describe the home, the internet type, and where the weak spots appear.',
      'Confirm whether the issue is coverage, speed, stability, or all three.',
      'Review the recommended router, access point, or mesh direction.',
      'Place the order or move into setup support if help is needed.',
    ],
    fitTitle: 'Why this page earns its place',
    fitBullets: [
      'It targets a clear problem buyers search for when they are ready to fix it.',
      'It connects networking product pages to a more conversion-focused use case.',
      'It creates a stronger commercial bridge between informational Wi-Fi content and paid hardware enquiries.',
    ],
    faqs: [
      {
        question: 'Can Cansan help if my router works but the Wi-Fi still feels weak?',
        answer:
          'Yes. Coverage problems often come from placement, room layout, or needing additional hardware beyond a basic router.',
      },
      {
        question: 'Do I need a mesh system for home Wi-Fi?',
        answer:
          'Not always. Some homes only need a better router or access point, while larger spaces may benefit from mesh or structured coverage.',
      },
      {
        question: 'Can this page be used for work-from-home internet problems?',
        answer:
          'Yes. It is especially useful for remote work setups where stable coverage matters for calls, uploads, streaming, and general productivity.',
      },
    ],
    primaryCtaLabel: 'Get Wi-Fi help',
    primaryCtaHref: '/services',
    secondaryCtaLabel: 'Browse networking gear',
    secondaryCtaHref: '/products/category/networking',
    relatedLinks: [
      {
        href: '/products/category/networking',
        label: 'Networking Collection',
        description: 'Browse routers, access points, and switches that support better home Wi-Fi.',
      },
      {
        href: '/services',
        label: 'Networking Services',
        description: 'Move from hardware selection into installation or setup support when needed.',
      },
      {
        href: '/insights/best-router-home-wifi-zimbabwe',
        label: 'Router Buying Guide',
        description: 'Read the supporting guide on choosing the right router for home Wi-Fi.',
      },
    ],
  },
  {
    slug: 'load-shedding-backup',
    eyebrow: 'Power Backup Solution',
    title: 'Load-Shedding Backup in Harare for Routers, Laptops, Offices, and Critical Devices',
    description:
      'Find load-shedding backup solutions in Harare for routers, laptops, desks, and small offices, with UPS and power planning guidance from Cansan.',
    shortDescription:
      'A commercial landing page for buyers seeking power backup during load shedding, whether for home internet, individual devices, or office continuity.',
    primaryKeyword: 'load shedding backup harare',
    intent: 'Commercial lead generation',
    heroBody:
      'Power cuts do not only interrupt work. They kill calls, break internet access, and expose equipment to abrupt shutdown risk. This page gives buyers a direct route into UPS and backup conversations that match real use, not random product browsing.',
    buyerSummary:
      'Best fit for homes, work-from-home buyers, shops, and SMEs trying to keep routers, laptops, or critical workstations alive during outages.',
    proofPoints: [
      'Targets a high-pain, high-intent local buying problem with commercial relevance.',
      'Supports router backup, workstation protection, and small-office continuity use cases.',
      'Bridges power backup content, product browsing, and quote-based buying.',
    ],
    checklistTitle: 'What the backup discussion should include',
    checklist: [
      {
        title: 'Which devices must stay on',
        description: 'Routers, laptops, desktop PCs, and monitors need different backup sizing and planning.',
      },
      {
        title: 'How long the backup must last',
        description: 'A few minutes to save work is very different from maintaining hours of internet uptime.',
      },
      {
        title: 'Home versus business continuity needs',
        description: 'Office buyers often need quote support across multiple devices instead of a single UPS unit.',
      },
    ],
    processTitle: 'How to use this page effectively',
    processSteps: [
      'List the devices you need to keep running during a power cut.',
      'State how long you need the backup to hold for.',
      'Review the practical UPS or backup direction based on that load.',
      'Move into product selection or a business quote depending on the requirement.',
    ],
    fitTitle: 'Why this page is commercially valuable',
    fitBullets: [
      'It targets buyers with a direct operational pain point and strong purchase intent.',
      'It supports both consumer and SME demand without forcing everyone into the same product page.',
      'It creates a clearer path for router backup, office continuity, and UPS-focused quotes.',
    ],
    faqs: [
      {
        question: 'Can Cansan help me choose backup for just my router and Wi-Fi?',
        answer:
          'Yes. Router backup is a common use case, and it should be sized differently from desktop or whole-office backup needs.',
      },
      {
        question: 'Does this page only cover UPS units?',
        answer:
          'UPS is the main focus, but the broader conversation can include different power backup directions depending on the devices and runtime needed.',
      },
      {
        question: 'Can businesses use this page for office backup planning?',
        answer:
          'Yes. It is built for both home and small-business buyers who need a more structured backup conversation and quote path.',
      },
    ],
    primaryCtaLabel: 'Ask about backup options',
    primaryCtaHref: '/contact',
    secondaryCtaLabel: 'Request a business quote',
    secondaryCtaHref: '/bulk-orders',
    relatedLinks: [
      {
        href: '/bulk-orders',
        label: 'Business Backup Quotes',
        description: 'Use the bulk-order path for multi-device or office continuity requirements.',
      },
      {
        href: '/products',
        label: 'Browse Available Products',
        description: 'See the wider catalog before narrowing to the right backup path.',
      },
      {
        href: '/insights/choosing-ups-load-shedding-zimbabwe',
        label: 'UPS Buying Guide',
        description: 'Read the supporting guide on choosing backup during load shedding in Zimbabwe.',
      },
    ],
  },
];

export function getSolutionHref(slug: string) {
  return `/solutions/${slug}`;
}

export function getAllSolutions() {
  return SOLUTIONS;
}

export function getFeaturedSolutions(count = 4) {
  return SOLUTIONS.slice(0, count);
}

export function getSolutionBySlug(slug: string) {
  return SOLUTIONS.find((solution) => solution.slug === slug);
}
