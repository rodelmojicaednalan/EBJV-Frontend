import React, { useState, useEffect } from "react";
import { Offcanvas, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaChevronRight,
  FaChevronDown,
  FaHistory,
  FaArrowLeft,
} from "react-icons/fa";
import {FaFolderTree} from 'react-icons/fa6'
import { IoPeopleSharp } from "react-icons/io5";
import { MdSettings } from "react-icons/md";
import { TbRulerMeasure } from "react-icons/tb";
import { BiSolidEdit } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";
import { getCookie } from "../../Authentication/getCookie";
import "./ProjectStyles.css";

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
const SidebarOffcanvas = ({ projectId }) => {
  const roleName = getCookie("role_name");
  const [userRole, setUserRole] = useState("");
  const [show, setShow] = useState(false);
  const [isDataCollapsed, setIsDataCollapsed] = useState(() => {
    const storedState = localStorage.getItem("isDataCollapsed");
    return storedState ? JSON.parse(storedState) : false;
  });
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(() => {
    const storedState = localStorage.getItem("isSettingsCollapsed");
    return storedState ? JSON.parse(storedState) : false;
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Determine the active page's name dynamically
  const pageTitles = {
    [`/project-folder/${projectId}/data/project-explorer`]: "Explorer",
    [`/project-folder/${projectId}/project-activity`]: "Activity",
    [`/project-folder/${projectId}/project-contributors`]: "Project Members",
    [`/project-folder/${projectId}/settings/edit-project`]: "Edit Project",
    [`/project-folder/${projectId}/settings/unit-settings`]: "Units",
    [`/projects`]: "All Projects",
  };

  const activePage = Object.keys(pageTitles).find((path) =>
    location.pathname.startsWith(path)
  )
    ? pageTitles[location.pathname]
    : "Menu";

  useEffect(() => {
    setUserRole(roleName);
  }, [roleName]);

  useEffect(() => {
    localStorage.setItem("isDataCollapsed", JSON.stringify(isDataCollapsed));
  }, [isDataCollapsed]);

  useEffect(() => {
    localStorage.setItem("isSettingsCollapsed", JSON.stringify(isSettingsCollapsed));
  }, [isSettingsCollapsed]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const collapseDataGroup = () => setIsDataCollapsed((prev) => !prev);
  const collapseSettingGroup = () => setIsSettingsCollapsed((prev) => !prev);

  const handleBack = () => {
    navigate(`/projects`);
    localStorage.removeItem("isDataCollapsed");
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
       Click to see menu
    </Tooltip>
  );


  return (
    <>
      {/* Button to toggle Offcanvas */}

      <Button
        variant="primary"
        className="sidebar-toggle-btn"
        onClick={handleShow}
        onMouseEnter={renderTooltip}
        style={{
          position: "fixed",
          top: '10px',
          right: "15px",
          zIndex: show ? 1 : 2,
          opacity: show ? 0 : 1,
          transition: "opacity 0.3s ease",
          color: '#eb6314',
          fontSize: '1.25rem',
          fontWeight: 500,
        }}
      >
     <span>   <GiHamburgerMenu size={30}/>  </span>
      </Button>
      {/* Offcanvas Component */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="end"
        backdrop={true}
        className="custom-offcanvas p-2"
        style={{ maxWidth: "50%" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="projectFolder-sidebar-mobile">
            <ul className="mobile-navmenu">
              <li className="mobile-nav-item-group">
                <div id="mobile-nav-item" onClick={handleBack}>
                  <FaArrowLeft id="mobile-nav-icons" size={20} />
                  <span id="mobile-nav-label">All Projects</span>
                </div>
              </li>
              <li
                className={`mobile-nav-item-group ${
                  location.pathname === `/project-folder/${projectId}/data/project-explorer`
                    ? "active"
                    : ""
                }`}
              >
                <div
                  id="mobile-nav-item"
                  onClick={() =>
                    navigate(`/project-folder/${projectId}/data/project-explorer`)
                  }
                >
                  <FaFolderTree id="mobile-nav-icons" size={20} />
                  <span id="mobile-nav-label">File Explorer</span>
                </div>
              </li>
              {userRole === "Admin" && (
                <>
                  <li
                    className={`mobile-nav-item-group ${
                      location.pathname === `/project-folder/${projectId}/project-activity`
                        ? "active"
                        : ""
                    }`}
                  >
                    <div
                      id="mobile-nav-item"
                      onClick={() =>
                        navigate(`/project-folder/${projectId}/project-activity`)
                      }
                    >
                      <FaHistory id="mobile-nav-icons" size={20} />
                      <span id="mobile-nav-label">Project Activity</span>
                    </div>
                  </li>
                  <li
                    className={`mobile-nav-item-group ${
                      location.pathname === `/project-folder/${projectId}/project-contributors`
                        ? "active"
                        : ""
                    }`}
                  >
                    <div
                      id="mobile-nav-item"
                      onClick={() =>
                        navigate(
                          `/project-folder/${projectId}/project-contributors`
                        )
                      }
                    >
                      <IoPeopleSharp id="mobile-nav-icons" size={20} />
                      <span id="mobile-nav-label">Project Members</span>
                    </div>
                  </li>

                  <li
                    className={`mobile-nav-item-group ${
                    location.pathname ===
                    `/project-folder/${projectId}/settings/edit-project`
                      ? "active"
                      : ""
                    }`}
                  >
                    <div
                      id="mobile-nav-item"
                      onClick={() =>
                          navigate(`/project-folder/${projectId}/settings/edit-project`)
                          }
                    >
                      <MdSettings id="mobile-nav-icons" />
                      <span id="mobile-nav-label">Project Settings</span>
                    </div>
                  </li>


                  {/* <li className="mobile-nav-item-group">
                    <div id="nav-group">
                      <div className="big-nav-wrapper" onClick={collapseSettingGroup}>
                        <MdSettings id="mobile-nav-icons" size={20} />
                        <span id="mobile-nav-label">Settings</span>
                        {isSettingsCollapsed ? (
                          <FaChevronRight id="nav-icons-toggle" />
                        ) : (
                          <FaChevronDown id="nav-icons-toggle" />
                        )}
                      </div>
                      {!isSettingsCollapsed && (
                        <ul
                          className={`mobile-subnav ${
                            isSettingsCollapsed ? "collapsed" : ""
                          }`}
                        >
                          <li
                            className={`mobile-nav-item-subgroup ${
                              location.pathname ===
                              `/project-folder/${projectId}/settings/edit-project`
                                ? "active"
                                : ""
                            }`}
                          >
                            <div
                              className="mobile-subgroup-items"
                              onClick={() =>
                                navigate(
                                  `/project-folder/${projectId}/settings/edit-project`
                                )
                              }
                            >
                              <BiSolidEdit id="mobile-nav-icons" />
                              <span id="mobile-nav-label">Edit Project</span>
                            </div>
                          </li>
                          <li
                            className={`mobile-nav-item-subgroup ${
                              location.pathname ===
                              `/project-folder/${projectId}/settings/unit-settings`
                                ? "active"
                                : ""
                            }`}
                          >
                            <div
                              className="mobile-subgroup-items"
                              onClick={() =>
                                navigate(
                                  `/project-folder/${projectId}/settings/unit-settings`
                                )
                              }
                            >
                              <TbRulerMeasure id="mobile-nav-icons" />
                              <span id="mobile-nav-label">Units</span>
                            </div>
                          </li>
                        </ul>
                      )}
                    </div>
                  </li> */}
                </>
              )}
            </ul>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default SidebarOffcanvas;
