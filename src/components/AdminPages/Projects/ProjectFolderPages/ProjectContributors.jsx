import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import {useParams } from "react-router-dom";

import StickyHeader from "../../../SideBar/StickyHeader";
import '../ProjectStyles.css'

import { IoSearchSharp } from "react-icons/io5";
import { BiDotsVertical } from "react-icons/bi";
import { FaCaretDown } from "react-icons/fa";

import ProjectSidebar from '../ProjectFolderSidebar';
function ProjectContributors() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")

  const [contributors , setContributors] = useState([])
  const [contributorCount, setContributorCount] = useState(0);

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [showSearchBox, setShowSearchBox] = useState(false);
  const searchBoxRef = useRef(null);

  const handleSearchClick = () => {
    setShowSearchBox(true);
  };

  const handleBlur = (event) => {
    // Check if the click is outside of the search box
    if (!searchBoxRef.current.contains(event.target)) {
      setShowSearchBox(false);
    }
  };

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuOptionClick = (option) => {
    setMenuOpen(false);
    Swal.fire(`Function to: ${option}`);
  };

  useEffect(() => {
    if (showSearchBox) {
      document.addEventListener("mousedown", handleBlur);
    } else {
      document.removeEventListener("mousedown", handleBlur);
    }

    return () => {
      document.removeEventListener("mousedown", handleBlur);
    };
  }, [showSearchBox]);

  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project-contributors/${projectId}`);
        const { project_name, owner, contributors, groups } = response.data;

        setProjectName(project_name);
        setOwnerName(owner)

        const formattedContributors = contributors.map((contributor) => ({
          contName: contributor.name,
          contEmployer: contributor.employer,
          contRole: contributor.role,
          contStatus: contributor.status,
          lastAccessed: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(contributor.last_login)),  // Format updatedAt
        }));

        const formattedGroups = groups.map((group) => ({
          groupId: group.id,
          groupName: group.group_name,
          members: group.members || [],
        }));

        setContributors(formattedContributors)
        setContributorCount(contributors.length);
        setGroups(formattedGroups)
        console.log(groups)
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };
    
    fetchProjectDetails();
  }, [projectId]);

  const contTableColumn = [
    {
      name: "Name",

      selector: (row) => row.contName,
      sortable: true,
    },
    {
      name: "Employer",

      selector: (row) => row.contEmployer,
      sortable: true,
    },
    {
      name: "Role",

      selector: (row) => row.contRole,
      sortable: true,
    },
    {
      name: "Status",

      selector: (row) => row.contStatus,
      sortable: true,
    },
    {
      name: "Last Accessed",

      selector: (row) => row.lastAccessed,
      sortable: true,
    },
  ];

  const handleAddNewGroup = () => {
    Swal.fire({
      title: 'Create Group',
      html: `
        <div style="text-align: left;">
          <label for="project-group" style="display: block;">Group Name: </label>
          <input type="text" id="project-group" class="swal2-input" placeholder="Enter title" style="margin-bottom: 10px; width: 100%; ">
        </div>
      `,
      confirmButtonText: 'Create',
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success contrib-btn-success",
        cancelButton: "btn btn-danger contrib-btn-danger"
      },
      preConfirm: () => {
        const groupName = document.getElementById('project-group').value.trim();
  
        if (!groupName) {
          Swal.showValidationMessage('Please fill in all fields.');
          return null;
        }

        return { groupName };
      },
    }).then(async(result) => {
      if (result.isConfirmed) {
        const { groupName} = result.value;
       
        try {
          await axiosInstance.post(`/create-group/${projectId}`, {groupName});
        Swal.fire('Success!', `${groupName} has been added.`, 'success');
        } catch (error){
          Swal.fire('Error!', 'Failed to create group. Try again.', 'error');
        console.error(error);
        }
      }
    });
  };

  const handleDeleteGroup = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      showCancelButton: true,
      icon: 'warning',
      confirmButtonColor: '#EC221F',
      cancelButtonColor: '#00000000',
      cancelTextColor: '#000000',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        container: 'custom-container',
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button',
        title: 'custom-swal-title',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/delete-group/${projectId}/${id}`);
          Swal.fire({
            title: 'Success!',
            text: `Group has been deleted.`,
            imageUrl: check,
            imageWidth: 100,
            imageHeight: 100,
            confirmButtonText: 'OK',
            confirmButtonColor: '#0ABAA6',
            customClass: {
              confirmButton: 'custom-success-confirm-button',
              title: 'custom-swal-title',
            },
          });
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'There was an error deleting the group.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#EC221F',
            customClass: {
              confirmButton: 'custom-error-confirm-button',
              title: 'custom-swal-title',
            },
          });
        }
      }
    });
  };

  const handleInviteToProject = () => {
    Swal.fire({
      title: 'Invite Contributors',
      html: `
        <div style="text-align: left;">
          <label for="project-invite" style="display: block;">People: </label>
          <input type="text" id="project-invite" class="swal2-input" placeholder="Add people by email address..." style="margin-bottom: 10px; width: 100%; ">
  
          <div id="group-container">
            <button id="add-to-group-btn" type="button" class="btn btn-primary" style="margin-bottom: 10px;">Add to Group</button>
          </div>
  
          <div id="role-section" style="margin-top: 10px;">
            <label style="display: block; font-weight: bold;">Select Role:</label>
            <div>
              <input type="radio" id="role-admin" name="role" value="Admin">
              <label for="role-admin">Admin</label>
            </div>
            <div>
              <input type="radio" id="role-user" name="role" value="User" checked>
              <label for="role-user">User/Client</label>
            </div>
          </div>
        </div>
      `,
      confirmButtonText: 'Invite',
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success contrib-btn-success",
        cancelButton: "btn btn-danger contrib-btn-danger"
      },
      didOpen: () => {
        const addGroupBtn = document.getElementById('add-to-group-btn');
        const groupContainer = document.getElementById('group-container');
  
        // Replace button with a text input when clicked
        addGroupBtn.addEventListener('click', () => {
          groupContainer.innerHTML = `
            <label for="contrib-group-name" style="display: block;">Group Name: </label>
            <input type="text" id="contrib-group-name" class="swal2-input" placeholder="Enter group name..." style="margin-bottom: 10px; width: 100%;">
          `;
        });
      },
      preConfirm: () => {
        const projectInvite = document.getElementById('project-invite').value;
        const groupNameInput = document.getElementById('group-name');
        const selectedRole = document.querySelector('input[name="role"]:checked').value;
        const groupName = groupNameInput ? groupNameInput.value : null;
  
        if (!projectInvite) {
          Swal.showValidationMessage('Please fill in the People field.');
          return null;
        }
        if (groupName) {
          setGroups((prevGroups) =>
            prevGroups.map((group) =>
              group.name === groupName ? { ...group, members: [...group.members, projectInvite] } : group
            )
          );
        }
        return { projectInvite, groupName, selectedRole };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { projectInvite, groupName, selectedRole } = result.value;
  
        console.log('New contributor details:', { projectInvite, groupName, selectedRole });
        Swal.fire('Success!', 'New contributors have been added.', 'success');
      }
    });
  };
  
  const sampleFilters = [
    {
      type: "Role",
      options: ["Admin", "User",],
    },
    {
      type: "Status",
      options: ["Active", "Activation Pending", "Removed"],
    },
  ];

  const handleDropdownToggle = (filterType) => {
    // Toggle the dropdown visibility for the clicked filter
    setActiveDropdown((prev) => (prev === filterType ? null : filterType));
  };
  const renderDropdown = (filter) => {
    return (
      <div className="filter-dropdown" id="contrib-filter-dropdown">
        {filter.options.map((option, index) => (
          <div
            key={index}
            className="dropdown-item"
            onClick={() => console.log(`${filter.type} selected: ${option}`)}
          >
            {option}
          </div>
        ))}
      </div>
    );
  };

  const fetchContributorsByGroup = async (groupId) => {
    try {
      const response = await axiosInstance.get(`/group-contributors/${projectId}/${groupId}`);
      const contributors = response.data.map((contributor) => ({
        contName: contributor.name,
        contEmployer: contributor.employer,
        contRole: contributor.role,
        contStatus: contributor.status,
        lastAccessed: new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(contributor.last_login)),
      }));
      setContributors(contributors);
    } catch (error) {
      console.error("Error fetching contributors for group:", error);
    }
  };

  const handleGroupClick = (groupName) => {
    const group = groups.find((g) => g.groupName === groupName);
    if (group) {
      setSelectedGroup(groupName);
      fetchContributorsByGroup(group.groupId);
    }
  };
  
  const handleAllContributorsClick = () => {
    setSelectedGroup(null);
    fetchProjectDetails(); // Fetch all contributors again
  };
  
    return (
      <div className="container">
      <StickyHeader />
      <h3 className="title-page" id="projectFolder-title">
        {ownerName}&apos;s {projectName} 
      </h3>
      <div className="container-content" id="project-folder-container">
      <div className="projectFolder-sidebar-container">
      <ProjectSidebar projectId={projectId}/>
      </div>

      <div className="projectFolder-display">
                <div className="main"> 
                    <div className="container-fluid moduleFluid px-0">
                    <div className="table-header d-flex justify-content-between align-items-center mb-3">
                        <div className="page-title ml-2">
                          <h2>Project Contributors</h2>
                        </div>
                        <div className="button-group d-flex">
                            <button id="addbtn" className="btn btn-primary add-btn" title="Add" onClick={handleInviteToProject}>
                              Invite to Project
                            </button>
                          </div>
                      </div>
                      <div className="contributor-wrapper">
                        <div className="panel-left d-none d-md-flex">
                          <div className="tempPanel">
                            <div className="listPanel">
                              <div className="listHeader">
                                <h3>Groups</h3>
                                <button className="btn-default small" onClick={handleAddNewGroup}>
                                  New Group
                                </button>
                              </div>
                              <div className="listWrapper">
                                <div className="sub-section py-2">
                                  <ul className="list">
                                  <li
                                    className={`list-item item-btn px-2 selectable ${!selectedGroup ? 'active' : ''}`}
                                    onClick={handleAllContributorsClick}
                                  >
                                      <div className="label-group">
                                        <div className="value">All contributors</div>
                                        <label>{contributorCount} {contributorCount === 1 ? 'User' : 'Users'}</label>
                                      </div>
                                    </li>
                                  </ul>
                                </div>
                                <h6  id="customgroup" className="text-muted px-2"> Custom Groups </h6>
                                <div className="sub-section py-2">
                                  {groups.length === 0 ? (
                                    <p className="text-muted px-2">No group found</p>
                                  ) : (
                                    <ul className="list">
                                      {groups.map((group) => (
                                        <li
                                          key={group.groupName}
                                          className={`list-item item-btn px-2 selectable ${selectedGroup === group.groupName ? 'active' : ''}`}
                                          onClick={() => handleGroupClick(group.groupName)}
                                        >
                                          <div className="label-group" >
                                            <div className="value">{group.groupName}</div>
                                            <label>{(group.members?.length || 0)} {(group.members?.length || 0) === 1 ? 'User' : 'Users'}</label>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="panel-right">
                          <div className="tableSection">
                            <div className="tablePanel relative">
                              <div className="tableHeader">
                                <h3 className="text-ellipsis d-none d-md-block">All project members</h3>
                                  <div className="panelControls">
                                    <div className="filters-wrapper d-xl-flex d-none">
                                      <div className="filter-container null">
                                      <div className="view-filters">
                                        <div className="filter-container null">
                                          <div className="filters d-flex">
                                            {sampleFilters.map((filter) => (
                                              <div
                                                key={filter.type}
                                                className="filter-type mr-n1"
                                                onClick={() => handleDropdownToggle(filter.type)}
                                              >
                                                {filter.type} <FaCaretDown />
                                                {activeDropdown === filter.type && renderDropdown(filter)}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                    </div> 
                                      </div>

                                    </div>
                                    <div style={{ position: "relative" }}>
                                      <button
                                        className="search-button"
                                        onClick={handleSearchClick}
                                        style={{ display: "flex", alignItems: "center" }}
                                      >
                                        <IoSearchSharp className="search-icon" />
                                      </button>
                                      {showSearchBox && (
                                        <div
                                          ref={searchBoxRef}
                                          style={{
                                            position: "absolute",
                                            left: -290,
                                            top: -12,
                                            backgroundColor: "white",
                                            border: "1px solid #ccc",
                                            borderBottom: "1px solid #eb6314",
                                            padding: "5px",
                                            borderRadius: "4px",
                                            zIndex: 1
                                          }}
                                        >
                                          <input
                                            type="text"
                                            className="search-textbox"
                                            placeholder="Find people..."
                                            autoFocus
                                            onBlur={handleBlur}
                                            style={{
                                              backgroundColor: "white",
                                              width: "300px",
                                              padding: "5px",
                                              border: "none",
                                              outline: "none",
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <div className="dropdown-pane-container">
                                    <div className="menu-btn-container position-relative">
                                      <button
                                        className="btn btn-icon menu-btn"
                                        title="Menu"
                                        onClick={handleMenuToggle}
                                      >
                                        <BiDotsVertical />
                                      </button>
                                      {menuOpen && (
                                        <div className="dropdown-menu" id="contrib-dropdown">
                                          <div
                                            className="dropdown-item"
                                            onClick={() => handleMenuOptionClick("Export To Do")}
                                          >
                                            Export to Excel
                                          </div>
                                          <div
                                            className="dropdown-item"
                                            onClick={() => handleMenuOptionClick("Import To Do")}
                                          >
                                            Import from Excel 
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    </div>
                                  </div>
                              </div>
                              <div className="tableWrapper">
                                <div className="tableList">
                                <DataTable
                                  className="dataTables_wrapperx"
                                  id="explorer-table"
                                  columns={contTableColumn}
                                  data={contributors}
                                  responsive
                                />
                                </div>
                              </div> 
                            </div>
                          </div>
                          </div>
                      </div>
                    </div>
                </div>
          </div>

      </div>
      </div>
      );
    }
export default ProjectContributors;
