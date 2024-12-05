import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminSidebarData, StaffSidebarData } from "./SideBarData";
import "./SideBar.css";
import { IconContext } from "react-icons";
// import man from "../../assets/images/man.png";
// import woman from "../../assets/images/woman.png";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Authentication/authContext";
import axiosInstance from "../../../axiosInstance.js";
import ebjv_logo from "../../assets/images/ebjv-logo-fab.png"
import Swal from "sweetalert2";

function Navbar({ role }) {
  const navigate = useNavigate();
  const sidebarData = role === "Admin" ? AdminSidebarData : StaffSidebarData;
  const { logout } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState(null);
  // const [first_name, setFirstName] = useState("");
  // const [last_name, setLastName] = useState("");
  // const [sex, setSex] = useState("");
  // const [email, setEmail] = useState("")

  const [currentTime, setCurrentTime] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const [position, setPosition] = useState({ left: "5px" });
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);

 /* useEffect(() => {
    const handleResize = () => {
      setOpenMenu(false);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []); */

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
    setPosition((prevPosition) => ({
      left: prevPosition.left === "190px" ? "5px" : "190px",
    }));
  };

  useEffect(() => {
    // Fetch current user details
    // const fetchUserDetails = async () => {
    //   try {
    //     const response = await axiosInstance.get("/user");
    //     const { first_name, last_name, email, sex } = response.data;
    //     setFirstName(first_name);
    //     setLastName(last_name);
    //     setEmail(email);
    //     setSex(sex);
    //   } catch (error) {
    //     console.error("Error fetching user details:", error);
    //   }
    // };

    // fetchUserDetails();
    const updateTime = () => {
      const date = new Date();

      const optionsDate = { year: "numeric", month: "short", day: "numeric" };
      const formattedDate = date.toLocaleDateString("en-US", optionsDate);

      const optionsTime = {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
        timeZone: "Australia/Sydney",
      };
      const formattedTime = date.toLocaleTimeString("en-US", optionsTime);

      setCurrentTime(
        <>
          {formattedDate} {formattedTime}
        </>
      );
    };

    const timerId = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(timerId);
  }, []);
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
          // Swal.fire({
          //   title: "Logged Out!",
          //   text: "You have been logged out successfully.",
          //   imageUrl: check,
          //   imageWidth: 100,
          //   imageHeight: 100,
          //   confirmButtonText: "OK",
          //   confirmButtonColor: "#0ABAA6",
          //   customClass: {
          //     confirmButton: "custom-success-confirm-button",
          //     title: "custom-swal-title",
          //   },
          // }).then(() => {
          //   navigate("/login");
          // });
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

  return (
    <>
      <div onClick={toggleMenu} className="toggle-btn">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      <IconContext.Provider value={{ color: "#fff" }}>
        <div className="sidebar-nav">
          {/* <div className="sticky-header">
            <div className="profile" onClick={() => navigate("/my-profile")}>
              <img
                src={sex === "Male" ? man : woman}
                className="profile_avatar"
                alt="Profile Avatar"
              />
              <div>
                <span>
                  {" "}
                  <h5>
                    {" "}
                    {first_name} {last_name}{" "}
                  </h5>
                </span>
                <span>
                  {" "}
                  <p> {email} </p>
                </span>
              </div>
            </div>
          </div> */}

          {/* <hr className="profile-divider" /> */}

          {openMenu ? (
            <div>
              <nav className="nav-menu active">
                {/* <div className="logo">
                  <div>
                    <img
                      width="auto"
                      height="50"
                      viewBox="0 0 200 95"
                      src={cfo_logo}
                      alt=""
                    />
                  </div>
                  <div className="time-display text-center p-2">
                    <p>{currentTime}</p>
                  </div>
                </div> */}

                {/* <div className="curve"></div> */}
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
