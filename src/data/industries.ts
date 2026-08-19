/**
 * Industries served — powers the homepage photo grid and the per-industry
 * pages at /industries/[slug]. Add an entry here and both update.
 */

export interface Industry {
  /** URL segment: /industries/<slug> */
  slug: string;
  name: string;
  /** One-liner under the name on the industry page banner. */
  tagline: string;
  /** Body copy for the industry page. */
  body: string;
  /** Photo tile / page banner. */
  image: string;
  /** Equipment categories most requested by this industry. */
  equipment: string[];
}

export const industries: Industry[] = [
  {
    slug: "construction",
    name: "Construction",
    tagline: "Power, lifting and light for every stage of the build.",
    body: "From enabling works to handover, construction sites run on temporary power and reliable lifting. We keep generators, tower lights, forklifts and heavy machinery ready to dispatch from our Dubai yard — sized to your load schedule, on rental terms that flex as the programme moves.",
    image: "/images/industry-construction.jpg",
    equipment: ["Generators", "Tower Lights", "Heavy Equipment", "Forklifts"],
  },
  {
    slug: "oil-gas",
    name: "Oil & Gas",
    tagline: "Dependable equipment for energy sites, onshore and off.",
    body: "Energy projects demand equipment that performs in heat, dust and continuous duty. We supply generators, air compressors and genuine spare parts specified for demanding environments, with the documentation and turnaround energy contractors expect.",
    image: "/images/industry-oil-gas.jpg",
    equipment: ["Generators", "Air Compressors", "Spare Parts"],
  },
  {
    slug: "marine-ports",
    name: "Marine & Ports",
    tagline: "Container handling and quayside power that keeps cargo moving.",
    body: "Port operations can't wait on equipment. We provide heavy-duty forklifts, container-handling machinery and quayside power with fast replacement and service support, so vessels turn around on schedule.",
    image: "/images/industry-marine-ports.jpg",
    equipment: ["Forklifts", "Heavy Equipment", "Generators"],
  },
  {
    slug: "events-entertainment",
    name: "Events & Entertainment",
    tagline: "Quiet power and lighting for shows, festivals and venues.",
    body: "Outdoor shows need dependable, low-noise power and lighting that installs fast and disappears faster. Our generators and tower lights cover build-up, show nights and de-rig — with standby units on call for the moments that matter.",
    image: "/images/industry-events.jpg",
    equipment: ["Generators", "Tower Lights"],
  },
  {
    slug: "facilities-management",
    name: "Facilities Management",
    tagline: "Standby power and maintenance equipment for critical buildings.",
    body: "Hotels, hospitals, malls and towers rely on standby power and planned maintenance. We supply and service standby generators, compressors and genuine spare parts on contract terms built around uptime.",
    image: "/images/industry-facilities.jpg",
    equipment: ["Generators", "Spare Parts", "Air Compressors"],
  },
  {
    slug: "mining-quarrying",
    name: "Mining & Quarrying",
    tagline: "Heavy-duty machines built for abrasive, high-utilisation work.",
    body: "Quarries and aggregate operations wear equipment hard. We source and supply excavators, dozers, compressors and site power rated for continuous duty, with the parts backup to keep utilisation high.",
    image: "/images/industry-mining.jpg",
    equipment: ["Heavy Equipment", "Air Compressors", "Generators"],
  },
  {
    slug: "infrastructure-government",
    name: "Infrastructure & Government",
    tagline: "Fleet capacity for roads, bridges and public works at scale.",
    body: "Public works run to fixed milestones and strict specifications. We provide fleet-scale rental and supply — machinery, site power and lighting — with the compliance paperwork and delivery reliability that government contracts require.",
    image: "/images/industry-infrastructure.jpg",
    equipment: ["Heavy Equipment", "Generators", "Tower Lights"],
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    tagline: "Backup power and material handling for production lines.",
    body: "A production line standing still is money burning. We keep manufacturers running with standby generators, electric and diesel forklifts, and genuine spare parts — delivered and installed around your shift pattern.",
    image: "/images/industry-manufacturing.jpg",
    equipment: ["Generators", "Forklifts", "Spare Parts"],
  },
];
