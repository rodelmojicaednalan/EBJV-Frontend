import React from "react";
import users_list from "../../assets/images/accounts.png";
import users_management from "../../assets/images/role-management.png";
import staff_logs from "../../assets/images/staff_logs.png";
import tickets_history from "../../assets/images/ticket-history.png";
import projects from "../../assets/images/building.png";
import log_out from "../../assets/images/log-out.png";
import generate_ticket from "../../assets/images/print-ticket.png";
import upload_resources from "../../assets/images/content.png";
import ticketing from "../../assets/images/ticketing.png";
import category from "../../assets/images/categorization.png";
import brand_identity from "../../assets/images/brand-identity.png";
import supply_icon from "../../assets/images/supply-icon.png";
import "./SideBar.css";
import { FiChevronDown } from 'react-icons/fi'; // Importing the Chevron Down icon


export const AdminSidebarData = [
  {
    title: "Accounts",
    path: "/userlist",
    icon: (
      <img
        className="navIcon"
        src={users_list}
        alt="Custom Icon"
        style={{ width: "24px", height: "24px" }}
      />
    ),
    cName: "nav-text",
  },
  {
    title: "Roles Management",
    path: "/user-management",
    icon: (
      <img
        className="navIcon"
        src={users_management}
        alt="Custom Icon"
        style={{ width: "24px", height: "24px" }}
      />
    ),
    cName: "nav-text",
  },
  {
    title: "Activity Log",
    path: "/staff-logs",
    icon: (
      <img
        className="navIcon"
        src={staff_logs}
        alt="Custom Icon"
        style={{ width: "24px", height: "24px" }}
      />
    ),
    cName: "nav-text",
  },
  // {
  //   title: '',
  //   icon: (
  //     <div style={{ display: 'flex', alignItems: 'center' }}>
  //       <img className='navIcon' src={brand_identity} alt="Custom Icon" style={{ width: '24px', height: '24px' }} />
  //       <span style={{ marginLeft: '16px' }}>Products</span>
  //       <FiChevronDown style={{ marginLeft: '20px' }} />
  //     </div>
  //   ),
  //   cName: 'nav-text',
  //   submenu: [
  //     {
  //       title: "Products",
  //       path: "/products",
  //       icon: (
  //         <img
  //           className="navIcon"
  //           src={brand_identity}
  //           alt="Custom Icon"
  //           style={{ width: "24px", height: "24px", }}
  //         />
  //       ),
  //       cName: "nav-text",
  //     },
  //     {
  //       title: "Orders",
  //       path: "/orders",
  //       icon: (
  //         <img
  //           className="navIcon"
  //           src={tickets_history}
  //           alt="Custom Icon"
  //           style={{ width: "24px", height: "24px" }}
  //         />
  //       ),
  //       cName: "nav-text",
  //     },
  //     {
  //       title: "Categories",
  //       path: "/categories",
  //       icon: (
  //         <img
  //           className="navIcon"
  //           src={category}
  //           alt="Custom Icon"
  //           style={{ width: "24px", height: "24px" }}
  //         />
  //       ),
  //       cName: "nav-text",
  //     },
  //   ],
  // },
   {
     title: "Projects",
     path: "/projects",
     icon: (
       <img
         className="navIcon"
         src={projects}
         alt="Custom Icon"
         style={{ width: "24px", height: "24px" }}
       />
     ),
     cName: "nav-text",
   },
  // {
  //   title: "Upload Model",
  //   path: "/supplies",
  //   icon: (
  //     <img
  //       className="navIcon"
  //       src={supply_icon}
  //       alt="Custom Icon"
  //       style={{ width: "24px", height: "24px" }}
  //     />
  //   ),
  //   cName: "nav-text",
  // },
  {
    title: "IFC List",
    path: "/uploaded-ifc-file",
    icon: (
      <img
        className="navIcon"
        src={supply_icon}
        alt="Custom Icon"
        style={{ width: "24px", height: "24px" }}
      />
    ),
    cName: "nav-text",
  },
  // {
  //   title: "Supplies Version 2",
  //   path: "/suppliesv2",
  //   icon: (
  //     <img
  //       className="navIcon"
  //       src={supply_icon}
  //       alt="Custom Icon"
  //       style={{ width: "24px", height: "24px" }}
  //     />
  //   ),
  //   cName: "nav-text",
  // },
  // {
  //   title: "Resources",
  //   path: "/resources-list",
  //   icon: (
  //     <img
  //       className="navIcon"
  //       src={upload_resources}
  //       alt="Custom Icon"
  //       style={{ width: "24px", height: "24px" }}
  //     />
  //   ),
  //   cName: "nav-text",
  // },
  {
    title: "Logout",
    path: "/",
    icon: (
      <img
        className="navIcon"
        src={log_out}
        alt="Custom Icon"
        style={{ width: "24px", height: "24px" }}
      />
    ),
    cName: "nav-text",
    onClick: (event, logout) => logout(event),
  },
];

export const StaffSidebarData = [
  {/*
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: (
      <img
        className="navIcon"
        src={generate_ticket}
        alt="Custom Icon"
        style={{ width: "24px", height: "24px" }}
      />
    ),
    cName: "nav-text",
  },
  
  {
    title: "Activity Log",
    path: "/staff-logs",
    icon: (
      <img
        className="navIcon"
        src={staff_logs}
        alt="Custom Icon"
        style={{ width: "24px", height: "24px" }}
      />
    ),
    cName: "nav-text",
  }, */},
  // {
  //   title: 'Queue List',
  //   path: '/queue-list',
  //   icon: <img src={queue_list} alt="Custom Icon" style={{ width: '24px', height: '24px' }} />,
  //   cName: 'nav-text'
  // },
  {
    title: "Projects",
    path: "/projects",
    icon: (
      <img
        className="navIcon"
        src={projects}
        alt="Custom Icon"
        style={{ width: "24px", height: "24px" }}
      />
    ),
    cName: "nav-text",
  },
  {
    title: "Logout",
    path: "/",
    icon: (
      <img
        className="navIcon"
        src={log_out}
        alt="Custom Icon"
        style={{ width: "24px", height: "24px" }}
      />
    ),
    cName: "nav-text",
    onClick: (event, logout) => logout(event),
  },
];
