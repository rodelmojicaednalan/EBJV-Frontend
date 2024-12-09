import React from "react";
import "./SideBar.css";
import { FiChevronDown } from 'react-icons/fi'; // Importing the Chevron Down icon
import { FaUsers } from "react-icons/fa6";
import { FaUsersCog } from "react-icons/fa";
import { RxActivityLog } from "react-icons/rx";
import { GrProjects } from "react-icons/gr";
import { BiLogOut } from "react-icons/bi";
import { MdOutline3dRotation } from "react-icons/md";

export const AdminSidebarData = [
  {
    title: "Accounts",
    path: "/userlist",
    icon: (
    <FaUsers style={{color: "#eb6314", width: "24px", height:"24px"}}/>
    ),
    cName: "nav-text",
  },
  {
    title: "Roles Management",
    path: "/user-management",
    icon: (
      <FaUsersCog style={{color: "#eb6314", width: "24px", height:"24px"}}/>
      ),
    cName: "nav-text",
  },
  {
    title: "Activity Log",
    path: "/staff-logs",
    icon: (
      <RxActivityLog style={{color: "#eb6314", width: "24px", height:"24px"}}/>
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
      <GrProjects style={{color: "#eb6314", width: "24px", height:"24px"}}/>
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
     title: "IFC Test",
     path: "/uploaded-ifc-file",
     icon: (
       <MdOutline3dRotation style={{color: "#eb6314", width: "24px", height:"24px"}}/>
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
      <BiLogOut style={{color: "#eb6314", width: "24px", height:"24px"}}/>
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
      <GrProjects style={{color: "#eb6314", width: "24px", height:"24px"}}/>
      ),
    cName: "nav-text",
  },
  {
    title: "Logout",
    path: "/",
    icon: (
      <BiLogOut style={{color: "#eb6314", width: "24px", height:"24px"}}/>
      ),
    cName: "nav-text",
    onClick: (event, logout) => logout(event),
  },
];
