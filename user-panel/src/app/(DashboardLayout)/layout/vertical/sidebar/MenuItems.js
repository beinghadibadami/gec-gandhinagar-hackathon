import { uniqueId } from "lodash";

import {
  IconAperture,
  IconBrandPaypal,
  IconMailCheck,
  IconMedicalCrossCircle
} from "@tabler/icons-react";
import { IconHelp } from "@tabler/icons-react";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Home",
  },

  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconAperture,
    href: "/",
    chipColor: "secondary",
  },

  // {
  //   id: uniqueId(),
  //   title: "Email Checker",
  //   icon: IconMailCheck,
  //   href: "/EmailChecker",
  // },

  // {
  //   navlabel: true,
  //   subheader: "Subscription",
  // },

  // {
  //   id: uniqueId(),
  //   title: "Plans & Upgrade",
  //   icon: IconBrandPaypal,
  //   href: "/Plans-and-Upgrade",
  // },


  {
    navlabel: true,
    subheader: "doctorListing",
  },

  {
    id: uniqueId(),
    title: "doctorListing",
    icon: IconMedicalCrossCircle,
    href: "/doctorListing",
  },

  {
    navlabel: true,
    subheader: "videoCall",
  },

  {
    id: uniqueId(),
    title: "videoCall",
    icon: IconMedicalCrossCircle,
    href: "/videoCall",
  },
  // {
  //   navlabel: true,
  //   subheader: "Develper",
  // },
  // {
  //   id: uniqueId(),
  //   title: "My APIs",
  //   icon: IconHelp,
  //   href: "/myApis",
  // },

  {
    navlabel: true,
    subheader: "Contact",
  },
  {

    id: uniqueId(),
    title: "Send a mail",
    icon: IconHelp,
    href: "mailto:info.rentiy12@gmail.com",
  },
  // {

  //   id: uniqueId(),
  //   title: "Make a call",
  //   icon: IconHelp,
  //   href: "tel:+919016600610",
  // },
];

export default Menuitems;
