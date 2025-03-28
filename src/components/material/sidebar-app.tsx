"use client";
import React, { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { DEFAULT_PROFILE, LOGO } from "@/constants/image";
import { useAuth } from "@/hooks/useAuth";
import {
  FaBox,
  FaClipboardList,
  FaCogs,
  FaHeartBroken,
  FaHome,
  FaMoneyBillWave,
  FaShoppingCart,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { IoFastFoodSharp } from "react-icons/io5";
import { SiGoogleanalytics } from "react-icons/si";
import { RiExchangeDollarLine } from "react-icons/ri";
import { GiExpense, GiRawEgg } from "react-icons/gi";
import { MdHistory } from "react-icons/md";
import { $Enums } from "@prisma/client";

const iconClassName = "text-neutral-700 h-5 w-5 flex-shrink-0";

const links: LinkProps[] = [
  {
    label: "Dashboard",
    icon: <FaHome className={iconClassName} />,
    items: [
      {
        label: "Overview",
        href: "/overview",
        icon: <SiGoogleanalytics className={iconClassName} />,
        roles: ["OWNER"],
      },
    ],
  },
  {
    label: "Master Data",
    icon: <FaBox className={iconClassName} />, // Add icon for this section
    items: [
      {
        label: "Product Menu",
        href: "/product",
        icon: <IoFastFoodSharp className={iconClassName} />,
        roles: ["OWNER"],
      },

      {
        label: "Stock",
        href: "/stock",
        icon: <GiRawEgg className={iconClassName} />,
        roles: ["OWNER", "MANAGER_OPERATIONAL"],
      },
      {
        label: "User",
        href: "/user",
        icon: <FaUser className={iconClassName} />,
        roles: ["OWNER"],
      },
      {
        label: "Outcome",
        href: "/outcomes",
        icon: <GiExpense className={iconClassName} />,
        roles: ["OWNER", "MANAGER_OPERATIONAL"],
      },
      {
        label: "Orders",
        href: "/orders",
        icon: <MdHistory className={iconClassName} />,
        roles: ["OWNER", "CASHIER"],
      },
      {
        label: "Cashier",
        href: "/cashier",
        icon: <FaShoppingCart className={iconClassName} />,
        roles: ["OWNER", "CASHIER"],
      },
      {
        label: "Defect",
        href: "/defect",
        icon: <FaHeartBroken className={iconClassName} />,
        roles: ["OWNER", "MANAGER_OPERATIONAL"],
      },
    ],
  },
  {
    label: "CAPEX",
    icon: <FaMoneyBillWave className={iconClassName} />, // Add icon for this section
    items: [
      {
        label: "Transactions",
        href: "/transaction",
        icon: <RiExchangeDollarLine className={iconClassName} />,
        roles: ["OWNER"],
      },
    ],
  },
  {
    label: "Settings",
    icon: <FaCogs className={iconClassName} />,
    items: [
      {
        label: "Account",
        href: "/profile",
        icon: <FaUser className={iconClassName} />,
        roles: ["OWNER", "CASHIER", "MANAGER_OPERATIONAL"],
      },
      {
        label: "Activity Log",
        href: "/activity",
        icon: <FaClipboardList className={iconClassName} />,
        roles: ["OWNER", "CASHIER", "MANAGER_OPERATIONAL"],
      },
      {
        label: "Logout",
        href: "/logout",
        icon: <FaSignOutAlt className={iconClassName} />,
        roles: ["OWNER", "CASHIER", "MANAGER_OPERATIONAL"],
      },
    ],
  },
];

export function SidebarApp({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);
  const { decoded, fetchAuth } = useAuth();

  useEffect(() => {
    if (
      links.filter((item) =>
        item.items.some((link) =>
          link.roles.includes(decoded?.role || ("" as $Enums.Role))
        )
      ).length === 0
    ) {
      fetchAuth();
    }
  }, [decoded?.role]);

  return (
    <div className="rounded-md flex flex-col md:flex-row bg-gray-100 w-full flex-1 mx-auto border border-neutral-200 overflow-hidden h-screen">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links
                .filter((item) =>
                  item.items.some((link) =>
                    link.roles.includes(decoded?.role || ("" as $Enums.Role))
                  )
                )
                .map((link, idx) => (
                  <div key={idx}>
                    <h3 className="text-sm font-semibold text-gray-600 flex items-center">
                      {link.icon}
                      <span className="ml-2 line-clamp-1">{link.label}</span>
                    </h3>
                    {link.items
                      .filter((item) =>
                        item.roles.includes(
                          decoded?.role || ("" as $Enums.Role)
                        )
                      )
                      .map((item, subIdx) => (
                        <div key={subIdx}>
                          {subIdx === 0 && <div className="mt-2" />}
                          <SidebarLink key={subIdx} link={item} />
                          {subIdx ===
                            link.items.filter((item) =>
                              item.roles.includes(
                                decoded?.role || ("" as $Enums.Role)
                              )
                            ).length -
                              1 && <div className="h-px bg-gray-200 my-4" />}
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: decoded?.name || "Profile",
                href: "/profile",
                icon: (
                  <Image
                    src={decoded?.image || DEFAULT_PROFILE}
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      {children}
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image
        src={LOGO}
        width={50}
        height={50}
        alt="Avatar"
        className="h-auto w-6 flex-shrink-0 object-cover"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black whitespace-pre"
      >
        Kuasir
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/admin/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image
        src={LOGO}
        width={50}
        height={50}
        alt="Avatar"
        className="h-5 w-6 flex-shrink-0 object-contain"
      />
    </Link>
  );
};

interface LinkProps {
  label: string;
  items: ItemLinksProps[];
  icon: React.ReactNode;
}

interface ItemLinksProps {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: $Enums.Role[];
}
