import React, { useState, useEffect } from "react";
import { Offcanvas, Button } from "react-bootstrap";
import { FaBars } from "react-icons/fa";
import "./ProjectStyles.css";
import { useNavigate, useLocation } from "react-router-dom";
import { FaFolderTree } from "react-icons/fa6";
import { FaHistory, FaEye, FaCommentAlt, FaClipboardCheck, FaArrowLeft } from "react-icons/fa";
import { TbBrandDatabricks, TbBox } from "react-icons/tb";
import { IoPeopleSharp } from "react-icons/io5";
import { MdSettings } from "react-icons/md";


const SidebarOffcanvas = ({ projectId }) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

   const navigate = useNavigate();
    const location = useLocation();
  
    const [isCollapsed, setIsCollapsed] = useState(() => {
      const storedState = localStorage.getItem("isCollapsed");
      return storedState ? JSON.parse(storedState) : false;
    });
  
    // Function to toggle the collapsed state
    useEffect(() => {
      localStorage.setItem("isCollapsed", JSON.stringify(isCollapsed));
    }, [isCollapsed]);
  
    const collapseSubNav = () => {
      setIsCollapsed((prev) => !prev);
    };
    // Function to determine if a route is active
    const isActive = (path) => location.pathname.startsWith(path);
  
    const handleClick = () => {
      navigate(`/project-folder/${projectId}/data/project-explorer`);
      collapseSubNav();
    };
  
    const handleBack = () => {
      navigate(`/projects`)
      localStorage.removeItem("isCollapsed");
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
            position: "fixed",
            top: "10px",
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
                      <div className="big-nav-wrapper" onClick={handleClick}>
                        <TbBrandDatabricks id="mobile-nav-icons" size={20}/>
                        <span id="mobile-nav-label">Data</span>
                      </div>
                      {!isCollapsed && (
                      <ul className={`subnav ${isCollapsed ? 'collapsed' : ''}`}
                      style={{
                        display: isCollapsed ? 'none' : '',
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
                    
                  <li
                    className={`mobile-nav-item-group ${
                      isActive(`/project-folder/${projectId}/settings/edit-project`) ? "active" : ""
                    }`}
                  >
                    <div id="mobile-nav-item" onClick={() => navigate(`/project-folder/${projectId}/settings/edit-project`)}>
                      <MdSettings id="mobile-nav-icons" size={20}/>
                      <span id="mobile-nav-label">Project Settings</span>
                    </div>
                  </li>
          
                  {/* Settings Group */}
                  {/* <li className="mobile-nav-item-group">
                    <div id="nav-group">
                      <div className="big-nav-wrapper" 
                            onClick={() => navigate(`/project-folder/${projectId}/settings/edit-project`)}>
                        <MdSettings id="mobile-nav-icons" size={20}/>
                        <span id="mobile-nav-label">Settings</span>
                      </div>
                      <ul className="subnav">
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
                            className="subgroup-items"
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
                            className="subgroup-items"
                            onClick={() => navigate(`/project-folder/${projectId}/settings/unit-settings`)}
                          >
                            <TbRulerMeasure id="mobile-nav-icons" />
                            <span id="mobile-nav-label">Units</span>
                          </div>
                        </li> 
                      </ul>
                    </div>
                  </li> */}
                </ul>
              </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default SidebarOffcanvas;
