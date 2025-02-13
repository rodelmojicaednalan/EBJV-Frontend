import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaFolderTree,
  FaChevronRight,
  FaChevronDown,
} from 'react-icons/fa6';
import {
  FaHistory,
  FaEye,
  FaCommentAlt,
  FaClipboardCheck,
  FaArrowLeft,
} from 'react-icons/fa';
import {
  TbBrandDatabricks,
  TbBox,
  TbRulerMeasure,
} from 'react-icons/tb';
import { IoPeopleSharp } from 'react-icons/io5';
import { MdSettings } from 'react-icons/md';
import { BiSolidEdit } from 'react-icons/bi';
import { HiCog } from 'react-icons/hi';

import './ProjectStyles.css';
import { getCookie } from '../../Authentication/getCookie';
const Sidebar = ({ projectId }) => {
  const roleName = getCookie('role_name');
  const [userRole, setUserRole] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  // console.log(roleCheck)

  useEffect(() => {
    setUserRole(roleName);
  }, []);

  // Function to determine if a route is active
  const isActive = (path) => location.pathname.startsWith(path);

  const [isDataCollapsed, setIsDataCollapsed] = useState(() => {
    const storedState = localStorage.getItem('isDataCollapsed');
    return storedState ? JSON.parse(storedState) : false;
  });

  useEffect(() => {
    localStorage.setItem(
      'isDataCollapsed',
      JSON.stringify(isDataCollapsed)
    );
  }, [isDataCollapsed]);

  const collapseDataGroup = () => {
    setIsDataCollapsed((prev) => !prev);
  };

  const handleDataCollapse = () => {
    navigate(`/project-folder/${projectId}/data/project-explorer`);
    collapseDataGroup();
  };

  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(
    () => {
      const storedState = localStorage.getItem('isSettingsCollapsed');
      return storedState ? JSON.parse(storedState) : false;
    }
  );

  useEffect(() => {
    localStorage.setItem(
      'isSettingsCollapsed',
      JSON.stringify(isSettingsCollapsed)
    );
  }, [isSettingsCollapsed]);

  const collapseSettingGroup = () => {
    setIsSettingsCollapsed((prev) => !prev);
  };

  const handleSettingsCollapse = () => {
    navigate(`/project-folder/${projectId}/settings/edit-project`);
    collapseSettingGroup();
  };

  const handleBack = () => {
    navigate(`/projects`);
    localStorage.removeItem('isDataCollapsed');
  };

  return (
    <div className="projectFolder-sidebar">
      <ul className="navmenu">
        <li className={`nav-item-group`}>
          <div id="nav-item" onClick={handleBack}>
            <FaArrowLeft id="nav-icons" size={20} />
            <span id="nav-label">All Projects</span>
          </div>
        </li>
        {/* Data Group */}
        {/* <li className="nav-item-group">
          <div id="nav-group">
            <div
              className="big-nav-wrapper"
              onClick={handleDataCollapse}
            >
              <TbBrandDatabricks id="nav-icons" size={20} />
              <span id="nav-label">Data</span>
              {isDataCollapsed ? (
                <FaChevronRight
                  id="nav-icons-toggle"
                  className="nav-toggle-icon"
                />
              ) : (
                <FaChevronDown
                  id="nav-icons-toggle"
                  className="nav-toggle-icon"
                />
              )}
            </div>
            {!isDataCollapsed && (
              <ul
                className={`subnav ${
                  isDataCollapsed ? 'collapsed' : ''
                }`}
                style={{
                  display: isDataCollapsed ? 'none' : '',
                  transition: 'height 0.3s ease, opacity 0.3s ease',
                }}
              >
                <li
                  className={`nav-item-subgroup ${
                    isActive(
                      `/project-folder/${projectId}/data/project-explorer`
                    )
                      ? 'active'
                      : ''
                  }`}
                >
                  <div
                    className="subgroup-items"
                    onClick={() =>
                      navigate(
                        `/project-folder/${projectId}/data/project-explorer`
                      )
                    }
                  >
                    <FaFolderTree id="nav-icons" size={20} />
                    <span id="nav-label">Explorer</span>
                  </div>
                </li>
                <li
                  className={`nav-item-subgroup ${
                    isActive(
                      `/project-folder/${projectId}/data/project-views`
                    )
                      ? 'active'
                      : ''
                  }`}
                >
                  <div
                    className="subgroup-items"
                    onClick={() =>
                      navigate(
                        `/project-folder/${projectId}/data/project-views`
                      )
                    }
                  >
                    <FaEye id="nav-icons" size={20} />
                    <span id="nav-label">Views</span>
                  </div>
                </li>
                <li
                  className={`nav-item-subgroup ${
                    isActive(
                      `/project-folder/${projectId}/data/project-releases`
                    )
                      ? 'active'
                      : ''
                  }`}
                >
                  <div
                    className="subgroup-items"
                    onClick={() =>
                      navigate(
                        `/project-folder/${projectId}/data/project-releases`
                      )
                    }
                  >
                    <TbBox id="nav-icons" size={20} />
                    <span id="nav-label">Releases</span>
                  </div>
                </li>
              </ul>
            )}
          </div>
        </li> */}
         <li
              className={`nav-item-group ${
                isActive(
                  `/project-folder/${projectId}/data/project-explorer`
                )
                  ? 'active'
                  : ''
              }`}
            >
              <div
                id="nav-item"
                onClick={() =>
                  navigate(
                    `/project-folder/${projectId}/data/project-explorer`
                  )
                }
              >
                <FaFolderTree id="nav-icons" size={20} />
                <span id="nav-label">File Explorer</span>
              </div>
            </li>

        {/* Activity */}
        {(userRole === 'Superadmin' || userRole === "Admin") && (
          <>
            <li
              className={`nav-item-group ${
                isActive(
                  `/project-folder/${projectId}/project-activity`
                )
                  ? 'active'
                  : ''
              }`}
            >
              <div
                id="nav-item"
                onClick={() =>
                  navigate(
                    `/project-folder/${projectId}/project-activity`
                  )
                }
              >
                <FaHistory id="nav-icons" size={20} />
                <span id="nav-label">Activity</span>
              </div>
            </li>

            {/* Topics */}
            {/* <li
              className={`nav-item-group ${
                isActive(
                  `/project-folder/${projectId}/project-topics`
                )
                  ? 'active'
                  : ''
              }`}
            >
              <div
                id="nav-item"
                onClick={() =>
                  navigate(
                    `/project-folder/${projectId}/project-topics`
                  )
                }
              >
                <FaCommentAlt id="nav-icons" size={20} />
                <span id="nav-label">Topics</span>
              </div>
            </li> */}

            {/* ToDo */}
            {/* <li
              className={`nav-item-group ${
                isActive(`/project-folder/${projectId}/project-ToDos`)
                  ? 'active'
                  : ''
              }`}
            >
              <div
                id="nav-item"
                onClick={() =>
                  navigate(
                    `/project-folder/${projectId}/project-ToDos`
                  )
                }
              >
                <FaClipboardCheck id="nav-icons" size={20} />
                <span id="nav-label">ToDo</span>
              </div>
            </li> */}

            {/* Project Contributors */}
            <li
              className={`nav-item-group ${
                isActive(
                  `/project-folder/${projectId}/project-contributors`
                )
                  ? 'active'
                  : ''
              }`}
            >
              <div
                id="nav-item"
                onClick={() =>
                  navigate(
                    `/project-folder/${projectId}/project-contributors`
                  )
                }
              >
                <IoPeopleSharp id="nav-icons" size={20} />
                <span id="nav-label">Project Members</span>
              </div>
            </li>

            <li
          className={`nav-item-group ${
            isActive(`/project-folder/${projectId}/settings/edit-project`) ? "active" : ""
          }`}
        >
          <div id="nav-item" onClick={() => navigate(`/project-folder/${projectId}/settings/edit-project`)}>
            <MdSettings id="nav-icons" size={20}/>
            <span id="nav-label">Project Settings</span>
          </div>
        </li>
{/* 
            {/* Settings Group 
            <li className="nav-item-group">
              <div id="nav-group">
                <div
                  className="big-nav-wrapper"
                  onClick={handleSettingsCollapse}
                >
                  <MdSettings id="nav-icons" size={20} />
                  <span id="nav-label">Settings</span>
                  {isSettingsCollapsed ? (
                    <FaChevronRight
                      id="nav-icons-toggle"
                      className="nav-toggle-icon"
                    />
                  ) : (
                    <FaChevronDown
                      id="nav-icons-toggle"
                      className="nav-toggle-icon"
                    />
                  )}
                </div>
                {!isSettingsCollapsed && (
                  <ul
                    className={`subnav ${
                      isSettingsCollapsed ? 'collapsed' : ''
                    }`}
                    style={{
                      display: isSettingsCollapsed ? 'none' : '',
                      transition:
                        'height 0.3s ease, opacity 0.3s ease',
                    }}
                  >
                     <li
                      className={`nav-item-subgroup ${
                        isActive(
                          `/project-folder/${projectId}/settings/edit-project`
                        )
                          ? 'active'
                          : ''
                      }`}
                    >
                      <div
                        className="subgroup-items"
                        onClick={() =>
                          navigate(
                            `/project-folder/${projectId}/settings/edit-project`
                          )
                        }
                      >
                        <BiSolidEdit id="nav-icons" size={20} />
                        <span id="nav-label">Project Details</span>
                      </div>
                    </li> 
                    <li
                      className={`nav-item-subgroup ${
                        isActive(
                          `/project-folder/${projectId}/settings/topic-settings`
                        )
                          ? 'active'
                          : ''
                      }`}
                    >
                      <div
                        className="subgroup-items"
                        onClick={() =>
                          navigate(
                            `/project-folder/${projectId}/settings/topic-settings`
                          )
                        }
                      >
                        <HiCog id="nav-icons" size={20} />
                        <span id="nav-label">Topic Settings</span>
                      </div>
                    </li> 
                     <li
                      className={`nav-item-subgroup ${
                        isActive(
                          `/project-folder/${projectId}/settings/unit-settings`
                        )
                          ? 'active'
                          : ''
                      }`}
                    >
                      <div
                        className="subgroup-items"
                        onClick={() =>
                          navigate(
                            `/project-folder/${projectId}/settings/unit-settings`
                          )
                        }
                      >
                        <TbRulerMeasure id="nav-icons" size={20} />
                        <span id="nav-label">Units</span>
                      </div>
                    </li> 
                  </ul>
                )}
              </div>
            </li> 
            */}
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
