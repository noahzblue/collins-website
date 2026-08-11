/** Branch locations. `status` drives the active / pending styling. */

export interface Branch {
  status: "active" | "pending";
  /** Tag shown above the city name. */
  tag: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  directionsHref: string;
}

export const branches: Branch[] = [
  {
    status: "active",
    tag: "Active Branch",
    city: "Dubai",
    address: "Ras Al Khor 2, Dubai, UAE",
    phone: "(+971) 052 399 5373",
    hours: "Mon–Fri, 8:00am–6:30pm",
    directionsHref: "#",
  },
  // {
  //   status: "pending",
  //   tag: "Branch 02 · Details Pending",
  //   city: "Sharjah",
  //   address: "Address to be confirmed with client",
  //   phone: "To be confirmed",
  //   hours: "To be confirmed",
  //   directionsHref: "#",
  // },
];
