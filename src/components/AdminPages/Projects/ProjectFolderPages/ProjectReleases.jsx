import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";
import { AuthContext } from "../../../Authentication/authContext";
import upload_icon from "../../../../assets/images/uploading.png";
import DataTable from "react-data-table-component";

import '../ProjectStyles.css'
import { FiChevronLeft, FiEdit, FiMoreVertical } from "react-icons/fi";
import { FaCaretDown } from "react-icons/fa";

import ProjectSidebar from '../ProjectFolderSidebar';

function ProjectReleases() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [existingFiles, setExistingFiles] = useState([]); // Existing files
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const toggleDropdown = (id) => {
    console.log("Toggling dropdown for ID:", id);
    setOpenDropdownId(openDropdownId === id ? null : id);
  };


  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project/${projectId}`);
        const { project_name, user } = response.data;
        const parsedFiles = JSON.parse(response.data.project_file)

        setProjectName(project_name);
        setOwnerName(`${user.first_name} ${user.last_name}`)
        setExistingFiles(parsedFiles); 
        // Assuming `project_files` is an array of file objects
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const sampleFilters = [
    {
      type: "Owner",
      options: ["Created by Me", "Shared with Me",],
    },
    {
      type: "Users",
      options: ["UserName1", "UserName2", "UserName3"],
    },
    {
      type: "Groups",
      options: ["Group1", "Group2", "GroupABC"],
    },
    {
      type: "Status",
      options: ["Draft", "Sent"],
    },
    {
      type: "Due Date",
      options: ["Today", "Last Week", "Last Month"],
    },
  ];

  const handleDropdownToggle = (filterType) => {
    // Toggle the dropdown visibility for the clicked filter
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


  const sampleData = [
    {
      id: 1,
      name: "Release 1",
      file: "1",
      dueDate: "Dec 05, 2024",
      recipient: "Dirk Nowitzki",
    },
    {
      id: 2,
      name: "Release 1.2",
      file: "1",
      dueDate: "Dec 05, 2024",
      recipient: "LeBron James",
    },
    {
      id: 3,
      name: "Release 2",
      file: "3",
      dueDate: "Dec 05, 2024",
      recipient: "LeBron James",
    },
    {
      id: 4,
      name: "Pre-Final Release",
      file: "2",
      dueDate: "Dec 05, 2024",
      recipient: "Kawhi Leonard",
    },
  ];

  // Define columns for the table
  const sampleColumns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Files",
      selector: (row) => row.file,
      sortable: true,
    },
    {
      name: "Due Date",
      selector: (row) => row.dueDate,
      sortable: true,
    },
    {
      name: "Recipients",
      selector: (row) => row.recipient,
      sortable: true,
    },
    {
      name: "Status",
      button: true,
      cell: (row) => (
        <button className="draft-btn">
          <FiEdit size={18} color="#6A6976" /> Draft
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
            <div className="dropdown-menu">
              <button onClick={() => alert(`Send clicked for ${row.name}`)}>
                Send
              </button>
              <button onClick={() => alert(`Delete clicked for ${row.name}`)}>
                Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleAddNewRelease = () => {
    Swal.fire({
      title: 'Add New Release',
      html: `
        <div style="text-align: left;">
          <label for="release-name" style="display: block; margin-bottom: 5px;">Release Name</label>
          <input type="text" id="release-name" class="swal2-input" placeholder="Enter release name" style="margin-bottom: 15px;">
          
          <label for="due-date" style="display: block; margin-bottom: 5px;">Due Date</label>
          <input type="date" id="due-date" class="swal2-input" placeholder="Select due date" style="margin-bottom: 15px;">
          
          <label for="recipients" style="display: block; margin-bottom: 5px;">Recipients</label>
          <input type="text" id="recipients" class="swal2-input" placeholder="Enter recipients (comma-separated)">
        </div>
      `,
      confirmButtonText: 'Add Release',
      showCancelButton: true,
      preConfirm: () => {
        const releaseName = document.getElementById('release-name').value;
        const dueDate = document.getElementById('due-date').value;
        const recipients = document.getElementById('recipients').value;
  
        if (!releaseName || !dueDate || !recipients) {
          Swal.showValidationMessage('Please fill in all fields.');
          return null;
        }
  
        return { releaseName, dueDate, recipients };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { releaseName, dueDate, recipients } = result.value;
  
        // Handle adding the new release (e.g., API call)
        console.log('New Release:', { releaseName, dueDate, recipients });
        Swal.fire('Success!', 'The new release has been added.', 'success');
      }
    });
  };

  return (
    <div className="container">
      <StickyHeader />
      <a href="/projects" className="back-btn">
        <h3 className="title-page">
          <FiChevronLeft className="icon-left" /> {ownerName}'s {projectName}
        </h3>
      </a>
      <div className="container-content" id="project-folder-container">
        <ProjectSidebar projectId={projectId} />

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
                      <div className="view-filters">
                        <div className="filter-container">
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
                      <DataTable
                        className="dataTables_wrapperz mt-3"
                        columns={sampleColumns}
                        data={sampleData}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 20, 30]}
                        paginationComponentOptions={{
                          rowsPerPageText: 'Views displayed:',
                          rangeSeparatorText: 'out of',
                          noRowsPerPage: true, // Hide the rows per page dropdown
                        }}
                        responsive
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
