import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";
import DataTable from "react-data-table-component";
import '../ProjectStyles.css'
import {  FiEdit, FiMoreVertical } from "react-icons/fi";
import { FaCaretDown } from "react-icons/fa";
import { IoIosPaper } from "react-icons/io";
import { TbBoxOff } from "react-icons/tb";
import ProjectSidebar from '../ProjectFolderSidebar';

function ProjectReleases() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [refreshKey, setRefreshKey] = useState(0); 

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [availableEmails, setAvailableEmails] = useState([]); 
  const [availableUsers, setAvailableUsers] = useState([]);
  const [projectGroups, setProjectGroups] = useState([]);
  const [filters, setFilters] = useState([]);

  const toggleDropdown = (id) => {
    console.log("Toggling dropdown for ID:", id);
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const [releasesTable ,setReleasesTable] = useState([])

  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project/${projectId}`);
        const { project_name, owner, project_releases,} = response.data;
  
        setProjectName(project_name);
        setOwnerName(`${owner.first_name} ${owner.last_name}`)

        const formattedViews = project_releases.map((release) => ({
          id: release.id,
          releaseName: release.release_name, // Assuming the file object has this key
          releaseOwner: `${owner.first_name} ${owner.last_name}`,
          totalFiles: release.total_files || 0,
          dueDate: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }).format(new Date(release.due_date)), 
          recipients: JSON.parse(release.recipients),
          releaseStatus: release.release_status,
          releaseNote: release.release_note,
          viewTags: release.assigned_tags,
          ownership: release.is_owner,
          lastModified: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }).format(new Date(release.createdAt)),  // Format updatedAt
        }));

        setReleasesTable(formattedViews)
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };
    
    const fetchAvailableUsers = async () => {
      try {
        const [currentUserResponse, projectResponse, usersResponse] = await Promise.all([
          axiosInstance.get(`/user`),
          axiosInstance.get(`/project-contributors/${projectId}`),
          axiosInstance.get(`/users`),
        ]);
    
        const currentUser = currentUserResponse.data;
        const { contributors, groups } = projectResponse.data; // Get contributors from project details
        const users = usersResponse.data;
    
        // Extract emails of contributors
        const contributorEmails = contributors.map((contributor) => contributor.email);
        const projectGroups = groups.map((group) => group.group_name)

        const formattedToAdd = users
        .filter((user) => 
          contributorEmails.includes(user.email) 
        )
        .map((user) => ({
          label: `${user.first_name} ${user.last_name} (${user.email})`, // Label for dropdown
          value: user.email, // Value for dropdown
        }));

        setProjectGroups(projectGroups);
        setAvailableUsers(formattedToAdd);
        //console.log(formattedUsers)
        console.log(projectGroups)
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchAvailableUsers();
    fetchProjectDetails();
  }, [projectId, refreshKey]);

  useEffect(() => {
    const generateFilters = () => {
      const ownershipOptions = ["Created by Me", "Shared with Me"]; // Static mapping for ownership
      const userOptions = availableUsers.map(user => user.label); // Use availableUsers
      const groupOptions = projectGroups; // Already formatted in `fetchAvailableUsers`
      const statusOptions = Array.from(new Set(releasesTable.map(release => release.releaseStatus))); // Unique statuses
      const dueDateOptions = ["Today", "Last Week", "Last Month"]; // Due date can remain static or dynamically computed
      
      const filters = [
        {
          type: "Owner",
          options: ownershipOptions,
        },
        {
          type: "Users",
          options: userOptions,
        },
        {
          type: "Groups",
          options: groupOptions,
        },
        {
          type: "Status",
          options: statusOptions,
        },
        {
          type: "Due Date",
          options: dueDateOptions,
        },
      ];
      
      setFilters(filters); // Store the dynamic filters in state
    };
  
    generateFilters();
  }, [releasesTable, availableUsers, projectGroups]);
  

  const handleDropdownToggle = (filterType) => {
    setActiveDropdown((prev) => (prev === filterType ? null : filterType));
  };

  const renderDropdown = (filter) => {
    return (
      <div className="filter-dropdown">
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

  const menuRef  = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        toggleDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);


  // Define columns for the table
  const sampleColumns = [
    {
      name: "Name",
      selector: (row) => row.releaseName,
      sortable: true,
    },
    {
      name: "Files",
      selector: (row) => row.totalFiles,
      sortable: true,
    },
    {
      name: "Due Date",
      selector: (row) => row.dueDate,
      sortable: true,
    },
    {
      name: "Recipients",
      selector: (row) => row.recipients,
      sortable: true,
    },
    {
      name: "Status",
      button: true,
      cell: (row) => (
        <button className="draft-btn">
          <FiEdit size={18} color="#6A6976" /> {row.releaseStatus}
        </button>
      ),
    },
    {
      button: true,
      cell: (row) => (
        <div className="more-btn">
          <button
            className="dropdown-button"
            onClick={() => toggleDropdown(row.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FiMoreVertical size={24} color="#6A6976" />
          </button>
          {openDropdownId === row.id && (
            <div className="dropdown-menu" style={{marginLeft: "-110px", top: '-30px'}}  ref={menuRef}>
              <button onClick={() => alert(`Send clicked for ${row.name}`)}>
                Send
              </button>
              <button onClick={() => handleDeleteRelease(row.id)}>
                Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];


  const handleAddNewRelease = async () => {
    Swal.fire({
      title: 'Add New Release',
      html: `
        <div style="text-align: left;">
          <label for="release-name" style="display: block; margin-bottom: 5px;">Release Name</label>
          <input type="text" id="release-name" class="swal2-input" placeholder="Enter release name" style="margin-bottom: 15px; width:100%;">
          
          <label for="due-date" style="display: block; margin-bottom: 5px;">Due Date</label>
          <input type="date" id="due-date" class="swal2-input" placeholder="Select due date" style="margin-bottom: 15px; width:100%;">
          
          <label for="recipients" style="display: block; margin-bottom: 5px;">Recipients</label>
          <input type="text" id="recipients" class="swal2-input" placeholder="Enter recipients (comma-separated)" style="width:100%;">
          
          <div id="group-container" style="margin-top: 10px;">
            <button id="add-releaseNote-btn" type="button" class="btn btn-primary" style="margin-bottom: 10px;">Add a note?</button>
          </div>
        </div>
      `,
      confirmButtonText: 'Add Release',
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success rel-btn-success",
        cancelButton: "btn btn-danger rel-btn-danger"
      },
      didOpen: () => {
        const addNoteBtn = document.getElementById('add-releaseNote-btn');
        const groupContainer = document.getElementById('group-container');
  
        // Replace button with a text input when clicked
        addNoteBtn.addEventListener('click', () => {
          if (!document.getElementById('release-note')) {
            const textArea = document.createElement('textarea');
            textArea.id = 'release-note';
            textArea.className = 'swal2-input';
            textArea.placeholder = 'Write a note...';
            textArea.style = `
              margin-bottom: 10px; width: 100%; 
              white-space: pre-wrap; word-wrap: break-word;
              background-color: #FFF; color: black;
            `;
            groupContainer.appendChild(textArea);
            addNoteBtn.disabled = true; // Disable button after note addition
          }
        });
      },
      preConfirm: () => {
        const releaseName = document.getElementById('release-name').value.trim();
        const dueDate = document.getElementById('due-date').value.trim();
        const recipients = document.getElementById('recipients').value.trim();
        const releaseNote = document.getElementById('release-note')
          ? document.getElementById('release-note').value.trim()
          : null;

        if (!releaseName || !dueDate || !recipients) {
          Swal.showValidationMessage('Please fill in all required fields.');
          return null;
        }
  
        const recipientList = recipients.split(',').map((email) => email.trim());
        const invalidEmails = recipientList.filter(
          (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        );
  
        if (invalidEmails.length > 0) {
          Swal.showValidationMessage(
            `Invalid email(s): ${invalidEmails.join(', ')}`
          );
          return null;
        }
  
        return { releaseName, dueDate, recipients: recipientList, releaseNote };
      },
    }).then(async(result) => {
      if (result.isConfirmed) {
        const { releaseName, dueDate, recipients, releaseNote } = result.value;
  
        try {
          await axiosInstance.post(`/create-release/${projectId}`, {
            releaseName,
            dueDate,
            recipients,
            releaseNote,
          });
        Swal.fire('Success!', 'The new release has been added.', 'success');
        setRefreshKey((prevKey) => prevKey + 1);
        } catch (error){
          Swal.fire('Error!', 'Failed to add the release. Try again.', 'error');
        console.error(error);
        }
      }
    });
  };

  const handleDeleteRelease = async (id) => {
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
          await axiosInstance.delete(`/delete-release/${projectId}/${id}`);
          Swal.fire({
            title: 'Success!',
            text: `Release has been deleted.`,
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
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'There was an error deleting the project release.',
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

  return (
    <div className="container">
      <StickyHeader />
      <h3 className="title-page" id="projectFolder-title">
        {ownerName}'s {projectName} 
      </h3>
      <div className="container-content" id="project-folder-container">
      <div className="projectFolder-sidebar-container">
      <ProjectSidebar projectId={projectId}/>
      </div>

        <div className="projectFolder-display">
        <div className="main"> 
                    <div className="container-fluid moduleFluid">
                      <div className="project-content">

                      <div className="table-header d-flex justify-content-between align-items-center mb-3">
                        <div className="page-title">
                          <h2>Releases</h2>
                        </div>
                        <div className="button-group d-flex">
                          <button id="addbtn"className="btn btn-primary add-btn" title="Add New Release"   onClick={handleAddNewRelease}>
                              New
                          </button>
                        </div>
                      </div>
                      <div className="release-filters">
                        <div className="filter-container">
                        <div className="filters d-flex">
                          {filters.map((filter) => (
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
                      <DataTable
                        className="dataTables_wrapperz mt-3"
                        columns={sampleColumns}
                        data={releasesTable}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 20, 30]}
                        paginationComponentOptions={{
                          rowsPerPageText: 'Views displayed:',
                          rangeSeparatorText: 'out of',
                          noRowsPerPage: true, // Hide the rows per page dropdown
                        }}
                        responsive
                        noDataComponent={
                          <div className="noData mt-4">
                            <div className="circle">
                            <TbBoxOff size={65} color="#9a9a9c"/>
                            </div>
                            <div className="no-display-text mt-2">
                              No releases found.
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
  );
}

export default ProjectReleases;
