 /** Navigation links for the header nav and footer link columns. */

export interface NavLink {
  label: string;
  href: string;
}

export const mainNav: NavLink[] = [
  { label: "Home", href: "#" },
  { label: "Rental", href: "#rental" },
  { label: "Trading", href: "#trading" },
  // { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Branches", href: "#branches" },
  { label: "Contact", href: "#contact" },
];

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: "Services",
    links: [
      { label: "General Trading & Rental", href: "#" },
      { label: "Equipment Sourcing", href: "#" },
      { label: "Logistics & Export", href: "#" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "About Us", href: "#about" },
      { label: "Branches", href: "#branches" },
      { label: "Request a Quote", href: "#quote" },
      { label: "Contact", href: "#contact" },
    ],
  },
];
