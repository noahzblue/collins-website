/** Navigation links for the header nav and footer link columns.
 *
 *  Every item points at a real page. Four of these used to be homepage
 *  anchors, which meant four nav items shared one URL, nothing could ever be
 *  "current", and no single one of them could rank for its own search intent.
 *  The anchors still work — the homepage sections kept their ids — they just
 *  stopped being the destination. */

import { industries } from "@/data/industries";
import { services } from "@/data/services";

export interface NavLink {
  label: string;
  href: string;
  /** A dropdown's contents. Only items that have somewhere deeper to go. */
  children?: NavLink[];
}

/** The sub-menus, keyed by the parent's href.
 *
 *  Derived, never listed: a hand-written copy of the six services or the eight
 *  industries is a second thing to keep in step, and the one that drifts is
 *  always the nav. `/equipment` is missing here on purpose — its twelve
 *  categories live in the content collection, which only an `.astro` file can
 *  read, so `layout/Header.astro` supplies that one from `getCollection`.
 */
export const navChildren: Record<string, NavLink[]> = {
  "/services": services.map((service) => ({
    label: service.title,
    href: `/services#${service.slug}`,
  })),
  "/industries": industries.map((industry) => ({
    label: industry.name,
    href: `/industries/${industry.slug}`,
  })),
};

/** Six items: the most the pill header can carry at the `nav` breakpoint.
 *  "Home" comes out — the logo is the home link, and it is the one item the
 *  header can afford to lose. Equipment leads because it is the
 *  highest-intent destination. */
export const mainNav: NavLink[] = [
  { label: "Equipment", href: "/equipment" },
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "The yard", href: "/yard" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

/** Three columns, so the footer is a real sitemap rather than a second nav.
 *  `/projects` joins the Company column when it is unblocked — see
 *  docs/site-expansion/10. */
export const footerColumns: FooterColumn[] = [
  {
    title: "Equipment",
    links: [
      { label: "Generators", href: "/equipment/generators" },
      { label: "Forklifts", href: "/equipment/forklifts" },
      { label: "Mobile cranes", href: "/equipment/mobile-cranes" },
      { label: "Excavators", href: "/equipment/excavators" },
      { label: "All 12 categories", href: "/equipment" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Industries", href: "/industries" },
      { label: "The yard", href: "/yard" },
    ],
  },
];
