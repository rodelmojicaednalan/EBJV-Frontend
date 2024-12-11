import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaFolderTree } from "react-icons/fa6";
import { FaHistory, FaEye, FaCommentAlt, FaClipboardCheck, FaArrowLeft } from "react-icons/fa";
import { TbBrandDatabricks } from "react-icons/tb";
import { IoIosPaper } from "react-icons/io";
import { IoPeopleSharp } from "react-icons/io5";
import { MdSettings } from "react-icons/md";
import { BiSolidEdit } from "react-icons/bi";
import { HiCog } from "react-icons/hi2";
import { TbRulerMeasure } from "react-icons/tb";

import './ProjectStyles.css'

const Sidebar = ({ projectId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Function to determine if a route is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="projectFolder-sidebar">
      <ul className="navmenu">
      <li
          className={`nav-item-group ${
            isActive(`/project-folder/${projectId}/project-activity`) ? "active" : ""
          }`}
        >
          <div id="nav-item" onClick={() => navigate(`/projects`)}>
            <FaArrowLeft id="nav-icons" size={20}/>
            <span id="nav-label">All Projects</span>
          </div>
        </li>
        {/* Data Group */}
        <li className="nav-item-group">
          <div id="nav-group">
            <div className="big-nav-wrapper" onClick={() => navigate(`/project-folder/${projectId}/data/project-explorer`)}>
              <TbBrandDatabricks id="nav-icons" size={20}/>
              <span id="nav-label">Data</span>
            </div>
            <ul className="subnav">
              <li
                className={`nav-item-subgroup ${
                  isActive(`/project-folder/${projectId}/data/project-explorer`) ? "active" : ""
                }`}
              >
                <div
                  className="subgroup-items"
                  onClick={() => navigate(`/project-folder/${projectId}/data/project-explorer`)}
                >
                  <FaFolderTree id="nav-icons" />
                  <span id="nav-label">Explorer</span>
                </div>
              </li>
              <li
                className={`nav-item-subgroup ${
                  isActive(`/project-folder/${projectId}/data/project-views`) ? "active" : ""
                }`}
              >
                <div
                  className="subgroup-items"
                  onClick={() => navigate(`/project-folder/${projectId}/data/project-views`)}
                >
                  <FaEye id="nav-icons" />
                  <span id="nav-label">Views</span>
                </div>
              </li>
              <li
                className={`nav-item-subgroup ${
                  isActive(`/project-folder/${projectId}/data/project-releases`) ? "active" : ""
                }`}
              >
                <div
                  className="subgroup-items"
                  onClick={() => navigate(`/project-folder/${projectId}/data/project-releases`)}
                >
                  <IoIosPaper id="nav-icons" />
                  <span id="nav-label">Releases</span>
                </div>
              </li>
            </ul>
          </div>
        </li>

        {/* Activity */}
        <li
          className={`nav-item-group ${
            isActive(`/project-folder/${projectId}/project-activity`) ? "active" : ""
          }`}
        >
          <div id="nav-item" onClick={() => navigate(`/project-folder/${projectId}/project-activity`)}>
            <FaHistory id="nav-icons" size={20}/>
            <span id="nav-label">Activity</span>
          </div>
        </li>

        {/* Topics */}
        <li
          className={`nav-item-group ${
            isActive(`/project-folder/${projectId}/project-topics`) ? "active" : ""
          }`}
        >
          <div id="nav-item" onClick={() => navigate(`/project-folder/${projectId}/project-topics`)}>
            <FaCommentAlt id="nav-icons" size={20}/>
            <span id="nav-label">Topics</span>
          </div>
        </li>

        {/* ToDo */}
        <li
          className={`nav-item-group ${
            isActive(`/project-folder/${projectId}/project-ToDos`) ? "active" : ""
          }`}
        >
          <div id="nav-item" onClick={() => navigate(`/project-folder/${projectId}/project-ToDos`)}>
            <FaClipboardCheck id="nav-icons" size={20}/>
            <span id="nav-label">ToDo</span>
          </div>
        </li>

        {/* Project Contributors */}
        <li
          className={`nav-item-group ${
            isActive(`/project-folder/${projectId}/project-contributors`) ? "active" : ""
          }`}
        >
          <div id="nav-item" onClick={() => navigate(`/project-folder/${projectId}/project-contributors`)}>
            <IoPeopleSharp id="nav-icons" size={20}/>
            <span id="nav-label">Project Contributors</span>
          </div>
        </li>

        {/* Settings Group */}
        <li className="nav-item-group">
          <div id="nav-group">
            <div className="big-nav-wrapper" 
                  onClick={() => navigate(`/project-folder/${projectId}/settings/edit-project`)}>
              <MdSettings id="nav-icons" size={20}/>
              <span id="nav-label">Settings</span>
            </div>
            <ul className="subnav">
              <li
                className={`nav-item-subgroup ${
                  isActive(`/project-folder/${projectId}/settings/edit-project`) ? "active" : ""
                }`}
              >
                <div
                  className="subgroup-items"
                  onClick={() => navigate(`/project-folder/${projectId}/settings/edit-project`)}
                >
                  <BiSolidEdit id="nav-icons" />
                  <span id="nav-label">Edit Project</span>
                </div>
              </li>
              <li
                className={`nav-item-subgroup ${
                  isActive(`/project-folder/${projectId}/settings/topic-settings`) ? "active" : ""
                }`}
              >
                <div
                  className="subgroup-items"
                  onClick={() => navigate(`/project-folder/${projectId}/settings/topic-settings`)}
                >
                  <HiCog id="nav-icons" />
                  <span id="nav-label">Topic Settings</span>
                </div>
              </li>
              <li
                className={`nav-item-subgroup ${
                  isActive(`/project-folder/${projectId}/settings/unit-settings`) ? "active" : ""
                }`}
              >
                <div
                  className="subgroup-items"
                  onClick={() => navigate(`/project-folder/${projectId}/settings/unit-settings`)}
                >
                  <TbRulerMeasure id="nav-icons" />
                  <span id="nav-label">Units</span>
                </div>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
