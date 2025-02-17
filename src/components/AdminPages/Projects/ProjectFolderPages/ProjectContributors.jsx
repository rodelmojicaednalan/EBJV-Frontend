import React, { useState, useEffect, useRef } from "react";
import Select from 'react-select'
import axiosInstance from "../../../../../axiosInstance.js";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import {useParams } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import { CSVLink } from 'react-csv'

import StickyHeader from "../../../SideBar/StickyHeader";
import '../ProjectStyles.css'

// import { RiAddLargeFill } from "react-icons/ri";
import { IoSearchSharp, IoPersonAddSharp, IoPersonRemoveSharp  } from "react-icons/io5";
import { BiDotsVertical, BiSolidEditAlt } from "react-icons/bi";
import { LiaTimesSolid } from "react-icons/lia";
import { FaCaretDown, FaFile, FaFileExcel, FaTrash } from "react-icons/fa";
import { MdGroupOff, MdGroupAdd, MdDeleteSweep   } from "react-icons/md";
import { ImPlus } from "react-icons/im";
import { HiMiniUserGroup } from "react-icons/hi2";

import ProjectSidebar from '../ProjectFolderSidebar';
import SidebarOffcanvas from '../MobileSidebar';
import useWindowWidth from './windowWidthHook.jsx'
import Offcanvas from 'react-bootstrap/Offcanvas';
import { ToastContainer, Toast } from 'react-bootstrap';

function ProjectContributors() {
  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const { projectId } = useParams();
  const [refreshKey, setRefreshKey] = useState(0); 
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")

  const [contributors , setContributors] = useState([])
  const [contributorCount, setContributorCount] = useState(0);

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [availableEmails, setAvailableEmails] = useState([]); 

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [showSearchBox, setShowSearchBox] = useState(false);
  const [searchContributor, setSearchContributor] = useState('');
  const searchBoxRef = useRef(null);

  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showInviteBox, setShowInviteBox] = useState(false);
  const inviteBoxRef = useRef(null);  

  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
      
  const [filteredContributors, setFilteredContributors] = useState([]);
  const filterRef = useRef(null);
  const csvRef = useRef(null);

  const [toastPosition, setToastPosition] = useState('bottom-end')
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showDeleteSuccessToast, setShowDeleteSuccessToast] = useState(false);
  const [showDeleteErrorToast, setShowDeleteErrorToast] = useState(false);  
    
  const openSuccessToast = () => setShowSuccessToast(!showSuccessToast);
  const openErrorToast = () => setShowErrorToast(!showErrorToast);
  const openDeleteSuccessToast = () => setShowDeleteSuccessToast(!showDeleteSuccessToast);
  const openDeleteErrorToast = () => setShowDeleteErrorToast(!showDeleteErrorToast); 

  //  Row Click Related Variables
      const [showCanvas, setShowCanvas] = useState(false);
      const handleCloseCanvas = () => setShowCanvas(false);
      const handleShowCanvas = () => setShowCanvas(true);
    
      const [selectedRow, setSelectedRow] = useState(null); // State to hold the selected row details
    
    // Handle row click
      const handleRowClick = (row) => {
        setSelectedRow(row); // Set the clicked row's data
        handleShowCanvas(); // Show the Offcanvas
      };
      // console.log(selectedRow)

  // search people hide function
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchContributor(value);
  
    const filtered = contributors.filter((contributor) =>
      contributor.contName.toLowerCase().includes(value) ||
      contributor.contEmail.toLowerCase().includes(value) ||
      (contributor.contRole && contributor.contRole.some((role) =>
        role.toLowerCase().includes(value)
      )) ||
      contributor.contStatus.toLowerCase().includes(value)
    );
  
    setFilteredContributors(filtered);
  };

  const handleSearchClick = () => {
    setShowSearchBox(true);
  };

  const handleBlur = (event) => {
    if (!searchBoxRef.current.contains(event.target)) {
      setShowSearchBox(false);
    } 
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


  // dropdown menu toggle
  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuOptionClick = (option) => {
    setMenuOpen(false);
    Swal.fire(`Function to: ${option}`);
  };

// Hiding invite box 
  const handleInviteBlur = (event) => {
    if (!inviteBoxRef.current.contains(event.target)) {
      setShowInviteBox(false);
    } 
  };

  useEffect(() => {
    if (showInviteBox) {
      document.addEventListener("mousedown", handleInviteBlur);
    } else {
      document.removeEventListener("mousedown", handleInviteBlur);
    }

    return () => {
      document.removeEventListener("mousedown", handleInviteBlur);
    };

  }, [showInviteBox]);

    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project-contributors/${projectId}`);
        const { project_name, owner, contributors, groups } = response.data;
    
        setProjectName(project_name);
        setOwnerName(owner);
    
        const formattedContributors = contributors.map((contributor) => ({
          contId: contributor.id,
          contName: contributor.name,
          contEmployer: contributor.employer,
          contRole: contributor.role,
          contStatus: contributor.status,
          contEmail: contributor.email,
          lastAccessed: contributor.last_login && contributor.last_login !== "No login record"
            ? new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(contributor.last_login))
            : "No login record", // Fallback when there's no valid date or the login record is "No login record"
        }));
    
        const formattedGroups = groups.map((group) => ({
          groupId: group.id,
          groupName: group.group_name,
          members: group.members || [],
        }));
    
        // Extract email addresses
        //const emailOptions = formattedContributors.map((contributor) => contributor.contEmail);
    
        setContributors(formattedContributors);
        setContributorCount(contributors.length);
        setGroups(formattedGroups);
        //setAvailableEmails(emailOptions); // Store the emails for dropdown usage
        //console.table(formattedContributors)
        //console.log(formattedContributors)
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    // fetches all available users not in the project and/or not in a group
    const fetchAvailableUsers = async () => {
      try {
        const [currentUserResponse, projectResponse, usersResponse] = await Promise.all([
          axiosInstance.get(`/user`),
          axiosInstance.get(`/project-contributors/${projectId}`),
          axiosInstance.get(`/users`),
        ]);
    
        const currentUser = currentUserResponse.data;
        const { contributors } = projectResponse.data; // Get contributors from project details
        const users = usersResponse.data;
    
        // Extract emails of contributors
        const contributorEmails = contributors.map((contributor) => contributor.email);
    
        const formattedUsers = users
          .filter((user) => 
            user.email !== currentUser.email && // Exclude current user
            !contributorEmails.includes(user.email) // Exclude contributor emails
          )
          .map((user) => ({
            userName: `${user.first_name} ${user.last_name}`,
            userEmail: user.email,
          }));
    
        const emailOptions = formattedUsers.map((user) => user.userEmail);


        const formattedToAdd = users
        .filter((user) => 
          contributorEmails.includes(user.email) 
        )
        .map((user) => ({
          label: `${user.first_name} ${user.last_name} (${user.email})`, // Label for dropdown
          value: user.email, // Value for dropdown
        }));

        setAvailableUsers(formattedToAdd);
        setAvailableEmails(emailOptions);
        // console.log(availableUsers)
        // console.log(availableEmails)
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    useEffect(() => {
      fetchProjectDetails();
      fetchAvailableUsers();
    }, [projectId, refreshKey]);
    
    
  const handleExportToCSV = () => {
    // Filter out the checkbox column (no selector property)
    const filteredColumns = contTableColumn.filter((col) => col.selector);
    // Extract headers
    const headers = filteredColumns.map((col) => ({ label: col.name, key: col.key }));
    // Map data rows based on filtered columns
    const data = contributors.map((row) =>
    Object.fromEntries(
      filteredColumns.map((col) => [col.key, col.selector(row)]) // Extract values dynamically
    )
  );
    // console.log(headers)
    return { headers, data };
  };

  const contTableColumn = [
    {
      name: "Name",
      key: 'contName',
      // selector: (row) => row.contName,
       selector: (row) => (
              <div style={{ display: "flex", alignItems: "center" }}>      
                <div className="user-details">
                  <span>
                    {" "}
                    {row.contName}
                  </span>
                  <span className="user-email-row">{row.contEmail}</span>
                </div>
              </div>
            ),
      sortable: true,
    },
    // {
    //   name: "Employer",
    //   key: 'contEmployer',
    //   selector: (row) => row.contEmployer,
    //   sortable: true,
    //   hide: 'md'
    // },
    {
      name: "Role",
      key: 'contRole',
      selector: (row) => row.contRole,
      sortable: true,
      hide: 'sm'
    },
    {
      name: "Status",
      key: 'contStatus',
      selector: (row) => row.contStatus,
      sortable: false,
    },
    {
      name: "Last Login",
      key: 'lastAccessed',
      selector: (row) => row.lastAccessed,
      sortable: true,
      hide: 'md'
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
        setRefreshKey((prevKey) => prevKey + 1);
        } catch (error){
          Swal.fire('Error!', 'Failed to create group. Try again.', 'error');
        console.error(error);
        }
      }
    });
  };

  const handleInviteToGroup = async (id) => {
    // console.log(selectedGroup);
    // Validate that selected users are not already in the group
    const usersToInvite = selectedUsers.filter(
      (user) => !contributors.some((contributor) => contributor.contEmail === user.value)
    );
  
    if (usersToInvite.length === 0) {
      Swal.fire({
        title: 'No Valid Users',
        text: 'The selected users are already part of the group.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EC221F',
      });
      return;
    }
  
    Swal.fire({
      title: 'Add users to the group?',
      showCancelButton: true,
      icon: 'question',
      confirmButtonColor: '#eb6314',
      cancelButtonColor: '#00000000',
      cancelTextColor: '#000000',
      confirmButtonText: 'Confirm',
      customClass: {
        container: 'custom-container',
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button',
        title: 'custom-swal-title',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
           await axiosInstance.post(`/group-invite/${projectId}/${id}`, {
            emails: usersToInvite.map((user) => user.value),
          });
  
          Swal.fire({
            title: 'Success!',
            text: `User(s) have been added to the group.`,
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
          setRefreshKey((prevKey) => prevKey + 1);
          // console.log("Invite response:", response.data);
          setSelectedUsers([]); // Clear selections after submitting
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: error,
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
  

  const handleDeleteGroup = async (id) => {
    // console.log(id)
    // console.log(selectedGroup)
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
          openDeleteSuccessToast()
          setRefreshKey((prevKey) => prevKey + 1);
        } catch (error) {
          openDeleteErrorToast()
        }
      }
    });
  };

  const handleRemoveContributor = async (contId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be removing this user from the project.',
      showCancelButton: true,
      icon: 'warning',
      confirmButtonColor: '#EC221F',
      cancelButtonColor: '#00000000',
      cancelTextColor: '#000000',
      confirmButtonText: 'Confirm',
      customClass: {
        container: 'custom-container',
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button',
        title: 'custom-swal-title',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/remove-contributor/${projectId}/${contId}`);
          openDeleteSuccessToast()
          setRefreshKey((prevKey) => prevKey + 1);
        } catch (error) {
          openDeleteErrorToast()
        }
      }
    });
  };

  const handleRemoveFromGroup = async (contId, groupId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be removing this user from the group.',
      showCancelButton: true,
      icon: 'warning',
      confirmButtonColor: '#EC221F',
      cancelButtonColor: '#00000000',
      cancelTextColor: '#000000',
      confirmButtonText: 'Confirm',
      customClass: {
        container: 'custom-container',
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button',
        title: 'custom-swal-title',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/remove-groupMember/${projectId}/${contId}/${groupId}`);
          openDeleteSuccessToast();
          setRefreshKey((prevKey) => prevKey + 1);
        } catch (error) {
          openDeleteErrorToast();
        }
      }
    });
  };
  

  const handleInviteToProject = () => {
    Swal.fire({
      title: 'Invite Contributors',
      html: `
        <div style="text-align: left;">
          <label for="email-select" style="display: block;">Select People: </label>
          <select id="email-select" class="swal2-input" multiple style="margin-bottom: 10px; width: 100%; height: 100px;">
            ${availableEmails.map((email) => `<option value="${email}">${email}</option>`).join('')}
          </select>
    
          <div id="group-container">
            <button id="add-to-group-btn" type="button" class="btn btn-primary" style="margin-bottom: 10px;">Add to Group</button>
          </div>
        </div>
      `,
      confirmButtonText: 'Invite',
      showCancelButton: true,
      customClass: {
        confirmButton: 'btn btn-success contrib-btn-success',
        cancelButton: 'btn btn-danger contrib-btn-danger',
      },
      didOpen: () => {
        const addGroupBtn = document.getElementById('add-to-group-btn');
        const groupContainer = document.getElementById('group-container');
    
        // Add group selection dropdown when the button is clicked
        addGroupBtn.addEventListener('click', () => {
          const groupOptions = groups
            .map((group) => `<option value="${group.groupId}">${group.groupName}</option>`)
            .join('');
          groupContainer.innerHTML = `
            <label for="contrib-group-id" style="display: block;">Select Group: </label>
            <select id="contrib-group-id" class="swal2-input" style="margin-bottom: 10px; width: 100%;">
              <option value="" disabled selected>Select a group...</option>
              ${groupOptions}
            </select>
          `;
        });
      },
      preConfirm: () => {
        const emailSelect = document.getElementById('email-select');
        const selectedEmails = Array.from(emailSelect.selectedOptions).map((option) => option.value);
        const groupIdInput = document.getElementById('contrib-group-id');
        const groupId = groupIdInput ? groupIdInput.value : null;
    
        if (selectedEmails.length === 0) {
          Swal.showValidationMessage('Please select at least one email.');
          return null;
        }
    
        return { emails: selectedEmails, groupId };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { emails, groupId } = result.value;
    
        try {
          const endpoint = groupId
            ? `/invite-to-project/${projectId}/${groupId}`
            : `/invite-to-project/${projectId}`;
    
          const payload = { emails, groupId: groupId || undefined };
    
          await axiosInstance.post(endpoint, payload);
    
          openSuccessToast()
          setRefreshKey((prevKey) => prevKey + 1);
        } catch (error) {
          openErrorToast()
          console.error(error);
        }
      }
    });
  };
  
  // const handleInviteClick = () => {
  //   handleInviteToProject(projectId, groups, availableEmails);
  // };
  
useEffect(() => {
  const generateFilters = () => {
    const roleOptions = Array.from(
      new Set(
        contributors.map((role) => JSON.stringify(role.contRole)) // Convert inner arrays to strings
      )
    ).map((role) => JSON.parse(role)); // Convert strings back to arrays    
    //console.log(roleOptions)
    const statusOptions = Array.from(
      new Set(contributors.map((status) => status.contStatus))
    );    
      const filters = [
        { type: "Role", options: roleOptions },
        { type: "Status", options: statusOptions },
      ];
      setFilters(filters);
  };
  generateFilters();
}, [contributors]);

useEffect(() => {
  let filteredData = [...contributors];
    Object.keys(selectedFilters).forEach((filterType) => {
      const selectedOptions = selectedFilters[filterType];
      //console.log(selectedOptions)
      if (selectedOptions.length > 0) {
        filteredData = filteredData.filter((contributor) => {
          switch (filterType) {
            case "Role":
              return selectedOptions.some(
                (option) =>
                  Array.isArray(option) &&
                  Array.isArray(contributor.contRole) &&
                  option.length === contributor.contRole.length &&
                  option.every((val, index) => val === contributor.contRole[index])
              );
            case "Status":
              return selectedOptions.includes(contributor.contStatus);
            default:
              return true;
          }
        });
      }
    });
    setFilteredContributors(filteredData);
}, [selectedFilters, contributors]);

  const handleCheckboxChange = (filterType, option) => {
        setSelectedFilters((prevFilters) => ({
          ...prevFilters,
          [filterType]: prevFilters[filterType]?.includes(option)
            ? prevFilters[filterType].filter((item) => item !== option)
            : [...(prevFilters[filterType] || []), option],
        }));
      };
    
      // Render dropdown options
      const renderDropdown = (filter) => (
        <div className="filter-dropdown pt-0 mt-2" ref={filterRef}>
          {filter.options.map((option, index) => (
            <div key={index} className="dropdown-item m-0 p-1" id="contrib-filter-dropdown">
              <input
                type="checkbox"
                id={`${filter.type}-${index}`}
                checked={selectedFilters[filter.type]?.includes(option) || false}
                onChange={() => handleCheckboxChange(filter.type, option)}
              />
              <label className="filter-label" htmlFor={`${filter.type}-${index}`}>{option}</label>
            </div>
          ))}
        </div>
      );
    
      // Close dropdown when clicking outside
      useEffect(() => {
        const handleOutsideClick = (event) => {
          if (filterRef.current && !filterRef.current.contains(event.target)) {
            setActiveDropdown(null);
          } else if (csvRef.current && !csvRef.current.contains(event.target)){
            setMenuOpen(null);
          }
        };
    
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
          document.removeEventListener("mousedown", handleOutsideClick);
        };
      }, []);

  const fetchContributorsByGroup = async (groupId) => {
    try {
      const response = await axiosInstance.get(`/group-contributors/${projectId}/${groupId}`);
      const groupcontributors = response.data.contributors.map((contributor) => ({
        contId: contributor.id,
        contName: contributor.name,
        contEmployer: contributor.employer,
        contEmail: contributor.email,
        contRole: contributor.role,
        contStatus: contributor.status,
        lastAccessed: contributor.last_login && contributor.last_login !== "No login record"
          ? new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(contributor.last_login))
          : "No login record", // Fallback when there's no valid date or the login record is "No login record"
      }));
      setContributors(groupcontributors);
    } catch (error) {
      console.error("Error fetching contributors for group:", error);
    }
  };

  const handleGroupClick = (groupName) => {
    const group = groups.find((g) => g.groupName === groupName);
    if (group) {
      setSelectedGroup(group);
      fetchContributorsByGroup(group.groupId);
    }
  };
  
  const handleAllContributorsClick = () => {
    setSelectedGroup(null);
    fetchProjectDetails(); // Fetch all contributors again
  };
  
    return (
      <div className="container">
      {/* <StickyHeader />
      <h3 className="title-page" id="projectFolder-title">
        {ownerName}&apos;s {projectName} 
      </h3> */}
      <div className="container-content" id="project-folder-container">
      <div className="projectFolder-sidebar-container">
      {isMobile ? (
          <SidebarOffcanvas projectId={projectId} />
        ) : (
          <ProjectSidebar projectId={projectId} />
        )}
      </div>

      <div className="projectFolder-display">
                <div className="main"> 
                    <div className="container-fluid moduleFluid px-0">
                    <div className="add-files-menu-container">
            <button
              id="addFiles-btn"
              className="btn addFiles-btn btn-primary"
              title="Add"
              onClick={handleInviteToProject}
            >
              <IoPersonAddSharp/> 
            </button>
            </div>
                    <div className="table-header d-flex justify-content-between align-items-center mb-3">
                        <div className="page-title ml-2">
                          <h2>Project Contributors</h2>
                        </div>
                        <div className="button-group d-flex">
                            <button id="addbtn" className="btn btn-primary add-btn" title="Add" onClick={handleInviteToProject}>
                              <ImPlus/>
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
                                          className={`list-item item-btn px-2 selectable ${selectedGroup === group ? 'active' : ''}`}
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
                                <h3 className="text-ellipsis d-md-block d-none">All project members</h3>
                                  <div className="panelControls">
                                    <div className="filters-wrapper d-xl-flex ">
                                      <div className="filter-container null">
                                      <div className="view-filters d-none">
                                        <div className="filter-container null">
                                          <div className="filters d-flex">
                                          {filters.map((filter) => (
                                              <div key={filter.type} className="filter-type mr-n1" onClick={() => setActiveDropdown(filter.type)}>
                                                  {filter.type} <FaCaretDown />
                                                  {activeDropdown === filter.type && renderDropdown(filter)}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                    </div> 
                                      </div>

                                    </div>
                                    {selectedGroup && (
                                      <div className="group-action-buttons d-flex">
                                        <div style={{ position: "relative" }}>
                                          <button
                                            className="btn btn-icon"
                                            onClick={() => setShowInviteBox((prev) => !prev)} // Toggle the invite dropdown visibility
                                          >
                                            <MdGroupAdd size={18}/>
                                          </button>

                                          {showInviteBox && (
                                            <div
                                              ref={inviteBoxRef}
                                              style={{
                                                position: "absolute",
                                                right: "10px",
                                                backgroundColor: "white",
                                                border: "1px solid #ccc",
                                                padding: "10px",
                                                borderRadius: "4px",
                                                zIndex: 1,
                                                width: "300px",
                                              }}
                                            >
                                              <Select
                                                options={availableUsers.filter(
                                                (user) => !contributors.some((contributor) => contributor.contEmail === user.value)
                                                )} // Exclude contributors
                                                isMulti
                                                placeholder="Select users to invite..."
                                                onChange={(selectedOptions) => setSelectedUsers(selectedOptions)} // Update selected users
                                                onBlur={handleInviteBlur}
                                              />
                                              <button
                                                className="btn btn-primary"
                                                id="addToGroupbtn"
                                                onClick={() => handleInviteToGroup(selectedGroup.groupId)}
                                                style={{ marginTop: "10px", width: "100%" }}
                                              >
                                                Send Invite
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        <button
                                          className="btn btn-icon"
                                          onClick={() => handleDeleteGroup(selectedGroup.groupId)}
                                        >
                                          <MdDeleteSweep size={18}/>
                                        </button>
                                      </div>
                                    )}
                                    <div style={{ position: "relative" }}>
                                      <button
                                        className="search-button p-2 btn btn-icon"
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
                                            value={searchContributor}
                                            onChange={handleSearch}
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
                                        <div className="dropdown-menu" id="contrib-dropdown" ref={csvRef}>
                                          <div className="dropdown-item">
                                              <CSVLink
                                                {...handleExportToCSV()}
                                                filename={`${ownerName}'s ${projectName}_Contributors.csv`}
                                                className="exportToCSV"
                                                target="_blank"
                                              >
                                                Export to CSV
                                            </CSVLink>
                                          </div>
                                          {/* <div
                                            className="dropdown-item"
                                            onClick={() => handleMenuOptionClick("Import To Do")}
                                          >
                                            Import from CSV
                                          </div> */}
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
                                  data={filteredContributors}
                                  onRowClicked={handleRowClick}
                                  responsive
                                  noDataComponent={
                                    <div className="noData mt-4">
                                      <div className="circle">
                                      <MdGroupOff size={65} color="#9a9a9c"/>
                                      </div>
                                      <div className="no-display-text mt-2">
                                        No contributors found.
                                      </div>
                                    </div>
                                    }
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

          {/* Create Topic Messages */}
              <ToastContainer className="p-3" position={toastPosition}>
                <Toast className="success-toast-container" show={showSuccessToast} onClose={openSuccessToast} delay={5000} autohide>
                  <Toast.Header className='success-toast-header justify-content-between'>
                 <span> Contributor Added Successfully! </span>   
                  </Toast.Header>
                  <Toast.Body className="success-toast-body">
                    Let us welcome our new contributor to this project!.
                  </Toast.Body>
                </Toast>
              </ToastContainer>
      
              <ToastContainer className="p-3" position={toastPosition}>
                <Toast className="error-toast-container" show={showErrorToast} onClose={openErrorToast} delay={5000} autohide>
                  <Toast.Header className='error-toast-header justify-content-between'>
                  <span> Adding Contributor was Unsuccessful </span>
                  </Toast.Header>
                  <Toast.Body className="error-toast-body">
                    Please review the error details, check your configurations, and try again.
                  </Toast.Body>
                </Toast>
              </ToastContainer>
                {/* End of Create Topic Messages */}
      
                {/* Delete Toast Messages */}
              <ToastContainer className="p-3" position={toastPosition}>
                <Toast className="success-toast-container" show={showDeleteSuccessToast} onClose={openDeleteSuccessToast} delay={5000} autohide>
                  <Toast.Header className='success-toast-header justify-content-between'>
                    <span > Contributor removed Successfully! </span>
                  </Toast.Header>
                  <Toast.Body className="success-toast-body">
                  The changes have been applied, and the contributor is no longer a part of this project .
                  </Toast.Body>
                </Toast> 
              </ToastContainer>
      
              <ToastContainer className="p-3" position={toastPosition}>
              <Toast className="error-toast-container" show={showDeleteErrorToast} onClose={openDeleteErrorToast} delay={5000} autohide>
                <Toast.Header className='error-toast-header justify-content-between'>
                  <span > Contributor Removal Unsuccessful </span>
                </Toast.Header>
                <Toast.Body className="error-toast-body">
                  Please review the error details, check your configurations, and try again.
                </Toast.Body>
              </Toast>
              </ToastContainer>
                {/* End of Delete Toast Messages */}

              {/* Row Click Offcanvas */}
              <Offcanvas 
                show={showCanvas} 
                onHide={handleCloseCanvas} 
                placement="end" 
                //backdrop="static"
                className="offcanvas"
                id="explorer-offcanvas"
              >
              <Offcanvas.Header className="offcanvas-head">
                <Offcanvas.Title>
                <div className="offcanvas-header d-flex justify-content-between align-items-center">
                <div className="offcanvas-title-description d-flex"
                  style={{flexDirection: 'column'}}>
                  <h5 className="offcanvas-title "
                    style={{fontSize: '1rem', fontWeight: 'bold', margin: '0'}}>
                      {selectedRow?.contName}
                  </h5>
                </div>
                  <div className="offcanvas-button-group">
                    {/* <button className="offcanvas-btn" title="Edit">
                      <BiSolidEditAlt size={18} />
                    </button> */}
                     <button
                        className="btn mr-1"
                        onClick={() => {
                          const groupsWithContributor = groups.filter(group =>
                            group.members.some(member => member.name === selectedRow?.contName)
                          );

                          if (groupsWithContributor.length > 0) {
                            // console.log(groupsWithContributor)
                            // Remove from the first group found (or adapt for specific group selection)
                            handleRemoveFromGroup(selectedRow.contId, groupsWithContributor[0].groupId);
                          } else {
                            handleRemoveContributor(selectedRow.contId);
                          }
                        }}
                      >
                        <IoPersonRemoveSharp size={18} />
                      </button>
                    <button
                      className="offcanvas-btn"
                      title="Close"
                      onClick={handleCloseCanvas}
                    >
                      <LiaTimesSolid size={18} />
                    </button>
                  </div>
                </div>
                </Offcanvas.Title>
              </Offcanvas.Header>
                <Offcanvas.Body className="offcanvas-body">
             
                {selectedRow && (
                  <div className="todo-details-container mt-2" style={{fontSize: "12px"}}>
                    <p><strong>Details: </strong></p>
                    <label style={{margin: "0", fontWeight: "300"}}>Email:</label>
                        <p>{selectedRow.contEmail}</p>
                      <label style={{margin: "0", fontWeight: "300"}}>Employer:</label>
                        <p>{selectedRow.contEmployer || "N/A"}</p>
                      <label style={{margin: "0", fontWeight: "300"}}>Role:</label>
                        <p>{selectedRow.contRole} </p>
                      <label style={{margin: "0", fontWeight: "300"}}>Status</label>
                        <p>{selectedRow.contStatus} </p>
                        <label style={{margin: "0", fontWeight: "300"}}>Last Login</label>
                        <p>{selectedRow.lastAccessed}</p>

                  </div>
                )}
                  <div className="todo-attachments-container">
                    <label style={{margin: "0", fontWeight: "300"}}>Groups:</label>
                    <div className="todo-attachments-list">
                      <div className="todo-attachment">
                      {groups.filter(group => 
                        group.members && group.members.some(member => member.name === selectedRow?.contName)
                      ).length > 0 ? (
                        groups.filter(group => 
                          group.members && group.members.some(member => member.name === selectedRow?.contName)
                        ).map(group => (
                          <div key={group.groupId} className="todo-attachment">
                            <HiMiniUserGroup size={18} />
                            <span className="ms-2">
                              {group.groupName}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="todo-attachment">
                          <span>No groups assigned</span>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                </Offcanvas.Body>
              </Offcanvas>
                {/* End of Row Click Offcanvas */}


      </div>
      </div>
      );
    }
export default ProjectContributors;
