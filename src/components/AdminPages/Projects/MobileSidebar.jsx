import React, { useState, useEffect } from "react";
import { Offcanvas, Button } from "react-bootstrap";
import { FaBars } from "react-icons/fa";
import "./ProjectStyles.css";
import { useNavigate, useLocation } from "react-router-dom";
import { FaFolderTree, FaChevronRight, FaChevronDown   } from "react-icons/fa6";
import { FaHistory, FaEye, FaCommentAlt, FaClipboardCheck, FaArrowLeft } from "react-icons/fa";
import { TbBrandDatabricks, TbBox, TbRulerMeasure } from "react-icons/tb";
import { IoPeopleSharp } from "react-icons/io5";
import { MdSettings } from "react-icons/md";
import { BiSolidEdit } from "react-icons/bi";
import { HiCog } from "react-icons/hi";

import { getCookie } from '../../Authentication/getCookie';

const SidebarOffcanvas = ({ projectId }) => {
  const roleName = getCookie("role_name")
  const [userRole, setUserRole] = useState('');
  useEffect(() => {
    setUserRole(roleName);

  }, [])

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Function to determine if a route is active
  const isActive = (path) => location.pathname.startsWith(path);

  const [isDataCollapsed, setIsDataCollapsed] = useState(() => {
    const storedState = localStorage.getItem("isDataCollapsed");
    return storedState ? JSON.parse(storedState) : false;
  });

  useEffect(() => {
    localStorage.setItem("isDataCollapsed", JSON.stringify(isDataCollapsed));
  }, [isDataCollapsed]);

  const collapseDataGroup = () => {
    setIsDataCollapsed((prev) => !prev);
  };
  
  const handleDataCollapse = () => {
    navigate(`/project-folder/${projectId}/data/project-explorer`);
    collapseDataGroup();
  };

  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(() => {
    const storedState = localStorage.getItem("isSettingsCollapsed");
    return storedState ? JSON.parse(storedState) : false;
  });

  useEffect(() => {
    localStorage.setItem("isSettingsCollapsed", JSON.stringify(isSettingsCollapsed));
  }, [isSettingsCollapsed]);

  const collapseSettingGroup = () => {
    setIsSettingsCollapsed((prev) => !prev);
  };
  
  const handleSettingsCollapse = () => {
    navigate(`/project-folder/${projectId}/settings/edit-project`);
    collapseSettingGroup();
  };



  const handleBack = () => {
    navigate(`/projects`)
    localStorage.removeItem("isDataCollapsed");
  }
    
  return (
    <>
      {/* Button to toggle Offcanvas */}
      {!show && (
        <Button
          variant="primary"
          className="sidebar-toggle-btn"
          onClick={handleShow}
          style={{
            position: "absolute",
            top: "-20px",
            left: "10px",
            zIndex: show ? 1 : 1050, // Lower z-index or hide when Offcanvas is active
            opacity: show ? 0 : 1, // Hide the button if Offcanvas is active
            transition: "opacity 0.3s ease", // Smooth transition
          }}
        >
          <FaBars className="mobile-nav-icon" />
        </Button>
      )}

      {/* Offcanvas Component */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="start" // Places it on the left
        backdrop={true} // Adds a backdrop
        className="custom-offcanvas p-2"
        style={{ maxWidth: "50%" }} // Adjust width
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* Your Sidebar content */}
          <div className="projectFolder-sidebar-mobile">
                <ul className="mobile-navmenu">
                <li
                    className={`mobile-nav-item-group`}
                  >
                    <div id="mobile-nav-item" onClick={handleBack}>
                      <FaArrowLeft id="mobile-nav-icons" size={20}/>
                      <span id="mobile-nav-label">All Projects</span>
                    </div>
                  </li>
                  {/* Data Group */}
                  <li className="mobile-nav-item-group">
                    <div id="nav-group" >
                      <div className="big-nav-wrapper" onClick={handleDataCollapse}>
                        <TbBrandDatabricks id="mobile-nav-icons" size={20}/>
                        <span id="mobile-nav-label">Data</span>
                        {isDataCollapsed ? (
                        <FaChevronRight id="nav-icons-toggle"/>
                        ) : (
                        <FaChevronDown id="nav-icons-toggle"/>
                        )}
                      </div>
                      {!isDataCollapsed && (
                      <ul className={`subnav ${isDataCollapsed ? 'collapsed' : ''}`}
                      style={{
                        display: isDataCollapsed ? 'none' : '',
                        transition: 'height 0.3s ease, opacity 0.3s ease',
                      }} >
                        <li
                          className={`mobile-nav-item-subgroup ${
                            isActive(`/project-folder/${projectId}/data/project-explorer`) ? "active" : ""
                          }`}
                        >
                          <div
                            className="subgroup-items"
                            onClick={() => navigate(`/project-folder/${projectId}/data/project-explorer`)}
                          >
                            <FaFolderTree id="mobile-nav-icons" />
                            <span id="mobile-nav-label">Explorer</span>
                          </div>
                        </li>
                        <li
                          className={`mobile-nav-item-subgroup ${
                            isActive(`/project-folder/${projectId}/data/project-views`) ? "active" : ""
                          }`}
                        >
                          <div
                            className="subgroup-items"
                            onClick={() => navigate(`/project-folder/${projectId}/data/project-views`)}
                          >
                            <FaEye id="mobile-nav-icons" />
                            <span id="mobile-nav-label">Views</span>
                          </div>
                        </li>
                        <li
                          className={`mobile-nav-item-subgroup ${
                            isActive(`/project-folder/${projectId}/data/project-releases`) ? "active" : ""
                          }`}
                        >
                          <div
                            className="subgroup-items"
                            onClick={() => navigate(`/project-folder/${projectId}/data/project-releases`)}
                          >
                            <TbBox id="mobile-nav-icons" />
                            <span id="mobile-nav-label">Releases</span>
                          </div>
                        </li>
                      </ul>
                      )}
                    </div>
                  </li>
          
                        
                  {/* Activity */}
                  {userRole === 'Admin' && (
                    <>
                  <li
                    className={`mobile-nav-item-group ${
                      isActive(`/project-folder/${projectId}/project-activity`) ? "active" : ""
                    }`}
                  >
                    <div id="mobile-nav-item" onClick={() => navigate(`/project-folder/${projectId}/project-activity`)}>
                      <FaHistory id="mobile-nav-icons" size={20}/>
                      <span id="mobile-nav-label">Activity</span>
                    </div>
                  </li>
          
                  {/* Topics */}
                  <li
                    className={`mobile-nav-item-group ${
                      isActive(`/project-folder/${projectId}/project-topics`) ? "active" : ""
                    }`}
                  >
                    <div id="mobile-nav-item" onClick={() => navigate(`/project-folder/${projectId}/project-topics`)}>
                      <FaCommentAlt id="mobile-nav-icons" size={20}/>
                      <span id="mobile-nav-label">Topics</span>
                    </div>
                  </li>
          
                  {/* ToDo */}
                  <li
                    className={`mobile-nav-item-group ${
                      isActive(`/project-folder/${projectId}/project-ToDos`) ? "active" : ""
                    }`}
                  >
                    <div id="mobile-nav-item" onClick={() => navigate(`/project-folder/${projectId}/project-ToDos`)}>
                      <FaClipboardCheck id="mobile-nav-icons" size={20}/>
                      <span id="mobile-nav-label">ToDo</span>
                    </div>
                  </li>
          
                  {/* Project Contributors */}
                  <li
                    className={`mobile-nav-item-group ${
                      isActive(`/project-folder/${projectId}/project-contributors`) ? "active" : ""
                    }`}
                  >
                    <div id="mobile-nav-item" onClick={() => navigate(`/project-folder/${projectId}/project-contributors`)}>
                      <IoPeopleSharp id="mobile-nav-icons" size={20}/>
                      <span id="mobile-nav-label">Project Contributors</span>
                    </div>
                  </li>
                    
                  {/* <li
                    className={`mobile-nav-item-group ${
                      isActive(`/project-folder/${projectId}/settings/edit-project`) ? "active" : ""
                    }`}
                  >
                    <div id="mobile-nav-item" onClick={() => navigate(`/project-folder/${projectId}/settings/edit-project`)}>
                      <MdSettings id="mobile-nav-icons" size={20}/>
                      <span id="mobile-nav-label">Project Settings</span>
                    </div>
                  </li> */}
          
                  {/* Settings Group */}
                  <li className="mobile-nav-item-group">
                    <div id="nav-group">
                      <div className="big-nav-wrapper" onClick={handleSettingsCollapse}>
                        <MdSettings id="mobile-nav-icons" size={20}/>
                        <span id="mobile-nav-label">Settings</span>
                        {isSettingsCollapsed ? (
                          <FaChevronRight id="nav-icons-toggle"/>
                          ) : (
                          <FaChevronDown id="nav-icons-toggle"/>
                          )}
                        </div>
                        {!isSettingsCollapsed && (
                        <ul className={`subnav ${isSettingsCollapsed ? 'collapsed' : ''}`}
                        style={{
                          display: isSettingsCollapsed ? 'none' : '',
                          transition: 'height 0.3s ease, opacity 0.3s ease',
                        }} >
                          <li
                            className={`mobile-nav-item-subgroup ${
                              isActive(`/project-folder/${projectId}/settings/edit-project`) ? "active" : ""
                            }`}
                          >
                            <div
                              className="subgroup-items"
                              onClick={() => navigate(`/project-folder/${projectId}/settings/edit-project`)}
                            >
                              <BiSolidEdit id="mobile-nav-icons" />
                              <span id="mobile-nav-label">Edit Project</span>
                            </div>
                          </li>
                          <li
                            className={`mobile-nav-item-subgroup ${
                              isActive(`/project-folder/${projectId}/settings/topic-settings`) ? "active" : ""
                            }`}
                          >
                            <div
                              className="mobile-subgroup-items"
                              onClick={() => navigate(`/project-folder/${projectId}/settings/topic-settings`)}
                            >
                              <HiCog id="mobile-nav-icons" />
                              <span id="mobile-nav-label">Topic Settings</span>
                            </div>
                          </li> 
                          <li
                            className={`mobile-nav-item-subgroup ${
                              isActive(`/project-folder/${projectId}/settings/unit-settings`) ? "active" : ""
                            }`}
                          >
                            <div
                              className="mobile-subgroup-items"
                              onClick={() => navigate(`/project-folder/${projectId}/settings/unit-settings`)}
                            >
                              <TbRulerMeasure id="mobile-nav-icons" />
                              <span id="mobile-nav-label">Units</span>
                            </div>
                          </li> 
                        </ul>
                        )}
                    </div>
                  </li>
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
