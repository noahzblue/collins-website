/** Navigation links for the header nav and footer link columns.
 *  Anchors are written as "/#id" so they also work from subpages
 *  (e.g. /industries/construction). */

export interface NavLink {
  label: string;
  href: string;
}

export const mainNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Equipment", href: "/#equipment" },
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
      { label: "Generators", href: "/#equipment" },
      { label: "Forklifts", href: "/#equipment" },
      { label: "Air Compressors", href: "/#equipment" },
      { label: "Heavy Equipment", href: "/#equipment" },
      { label: "Tower Lights", href: "/#equipment" },
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
