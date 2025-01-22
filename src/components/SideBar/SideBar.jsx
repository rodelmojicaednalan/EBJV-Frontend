import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AdminSidebarData, StaffSidebarData } from "./SideBarData";
import "./SideBar.css";
import { IconContext } from "react-icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Authentication/authContext";
import axiosInstance from "../../../axiosInstance.js";
import Swal from "sweetalert2";
import { BiMenu, BiMenuAltRight } from "react-icons/bi";

function Navbar({ role }) {
  const navigate = useNavigate();
  const sidebarData = role === "Admin" ? AdminSidebarData : StaffSidebarData;
  const { logout } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [position, setPosition] = useState({ left: "5px" });
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);

  const menuRef  = useRef(null);

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
    setPosition((prevPosition) => ({
      left: prevPosition.left === "190px" ? "5px" : "190px",
    }));
  };

  const handleLogout = async () => {
    // e.preventDefault();
    Swal.fire({
      title: "Log Out!",
      text: "Do you really want to log out?",
      showCancelButton: true,
      icon: "warning",
      confirmButtonColor: "#EC221F",
      cancelButtonColor: "#00000000",
      cancelTextColor: "#000000",
      confirmButtonText: "Yes",
      customClass: {
        container: "custom-container",
        confirmButton: "custom-confirm-button",
        cancelButton: "custom-cancel-button",
        title: "custom-swal-title",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.post(`/logout`);
          logout();
          navigate("/login");
        } catch {}
      }
    });
  };

 
  const handleItemClick = (index, item) => {
    if (item.title === "Logout") {
      handleLogout();
    } else if (item.submenu) {
      setDropdownOpenIndex((prevIndex) => (prevIndex === index ? null : index));
    } else {
      navigate(item.path);
      setActiveIndex(index);
      setOpenMenu(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <>
      <div onClick={toggleMenu} className="toggle-btn">
        {/* <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div> */}
        { !openMenu ? (<BiMenu className="toggle-menu-icon"/> ) : (<BiMenuAltRight className="toggle-menu-icon" />)}
      </div>

     

      <IconContext.Provider value={{ color: "#fff" }}>
        <div className="sidebar-nav" ref={menuRef}>
          {openMenu ? (
            <div>
              <nav className="nav-menu active">

                <ul className="nav-menu-items p-4">
                  {sidebarData.map((item, index) => (
                    <React.Fragment key={index}>
                      <li
                        className={`${item.cName} sidebar-nav-list ${
                          activeIndex === index ? "active" : ""
                        }`}
                        onClick={() => handleItemClick(index, item)}
                      >
                        <Link
                          className="sidebar-nav-link"
                          to={item.title !== "Logout" ? item.path : null}
                        >
                          {item.icon}
                          <span>{item.title}</span>
                        </Link>
                      </li>

                      {item.submenu && dropdownOpenIndex === index && (
                        <ul className="nav-menu-items submenu">
                          {item.submenu.map((subItem, subIndex) => (
                            <li
                              key={subIndex}
                              className="nav-text sidebar-nav-list"
                              onClick={() => handleItemClick(index, subItem)}
                            >
                                <Link
                                  className="sidebar-nav-link"
                                  to={subItem.path}
                                >
                                  {subItem.icon}
                                  <span>{subItem.title}</span>
                                </Link>
                              </li>
                          ))}
                        </ul>
                      )}
                    </React.Fragment>
                  ))}
                </ul>
              </nav>
            </div>
          ) : null}
        </div>
      </IconContext.Provider>
    </>
  );
}

export default Navbar;
