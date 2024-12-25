import Home from "@/pages/Home";
import RentVsBuyCalculator from "@/pages/calc/RentVsBuyCalculator";
import FtbAffordCalculator from "@/pages/calc/FtbAffordCalculator";
import FtbWhenCalculator from "@/pages/calc/FtbWhenCalculator";
import CanFireCalculator from "@/pages/calc/CanFireCalculator";
import SalarySacrificeCalculator from "@/pages/calc/SalarySacrificeCalculator";

export interface NavItem {
  label: string;
  href?: string;
  component?: React.ComponentType;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    component: Home,
  },
  {
    label: "First Time Buyer",
    children: [
      {
        label: "Should I buy a home or keep renting?",
        href: "/calc/rent-vs-buy",
        component: RentVsBuyCalculator,
      },
      {
        label: "What kind of house or flat can I afford?",
        href: "/calc/ftb-afford",
        component: FtbAffordCalculator,
      },
      {
        label: "How long should I wait to buy my first home?",
        href: "/calc/ftb-when",
        component: FtbWhenCalculator,
      },
    ],
  },
  {
    label: "Retirement and Pension",
    children: [
      {
        label: "Can I retire early?",
        href: "/calc/can-fire",
        component: CanFireCalculator,
      },
      {
        label: "How much salary sacrifice is best for me?",
        href: "/calc/salary-sacrifice",
        component: SalarySacrificeCalculator,
      },
    ],
  },
];
