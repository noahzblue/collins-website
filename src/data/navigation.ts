/** Navigation links for the header nav and footer link columns.
 *  Anchors are written as "/#id" so they also work from subpages
 *  (e.g. /industries/construction). */

export interface NavLink {
  label: string;
  href: string;
}

export const mainNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Equipment", href: "/equipment" },
  { label: "Services", href: "/#services" },
  { label: "Industries", href: "/#industries" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: "Equipment",
    links: [
      { label: "Generators", href: "/equipment/generators" },
      { label: "Forklifts", href: "/equipment/forklifts" },
      { label: "Mobile Cranes", href: "/equipment/mobile-cranes" },
      { label: "Excavators", href: "/equipment/excavators" },
      { label: "All equipment", href: "/equipment" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Services", href: "/#services" },
      { label: "Industries", href: "/#industries" },
      { label: "About Us", href: "/#about" },
      { label: "Get a Quote", href: "/#contact" },
    ],
  },
];
