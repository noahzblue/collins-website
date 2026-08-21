/** Navigation links for the header nav and footer link columns.
 *
 *  Every item points at a real page. Four of these used to be homepage
 *  anchors, which meant four nav items shared one URL, nothing could ever be
 *  "current", and no single one of them could rank for its own search intent.
 *  The anchors still work — the homepage sections kept their ids — they just
 *  stopped being the destination. */

export interface NavLink {
  label: string;
  href: string;
}

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
