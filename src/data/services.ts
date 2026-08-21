/** The three services shown in the homepage accordion. Add one here and the
 *  section, its photo panel and the floating data-card all pick it up. */

import type { IconName } from "@/components/ui/icons";

export interface Service {
  icon: IconName;
  title: string;
  body: string;
  /** Photo shown while this service is active in the accordion. */
  image: string;
  /** Floating mini data-card over the photo. */
  stat: { title: string; line: string };
}

export const services: Service[] = [
  {
    icon: "refresh",
    title: "General trading & rental",
    body: "Flexible buy-or-rent terms across every equipment category, structured around your project timeline.",
    image: "/images/service-rental.jpg",
    stat: {
      title: "Flexible terms",
      line: "Day, week or month — scale up or down anytime.",
    },
  },
  {
    icon: "search",
    title: "Equipment sourcing",
    body: "Direct access to trusted manufacturers — Perkins, Kalmar, JCB, Cummins, Deutz — sourced to spec.",
    image: "/images/service-sourcing.jpg",
    stat: {
      title: "Sourced to spec",
      line: "Direct from the manufacturers we trust.",
    },
  },
  {
    icon: "globe",
    title: "Logistics & export",
    body: "Regional delivery and export handling across the UAE, Oman, Saudi Arabia, Qatar and Africa.",
    image: "/images/service-logistics.jpg",
    stat: {
      title: "Regional reach",
      line: "UAE · Oman · KSA · Qatar · Africa.",
    },
  },
];
