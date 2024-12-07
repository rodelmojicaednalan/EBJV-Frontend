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
                          <button id="addbtn"className="btn btn-primary add-btn" title="Add New Release">
                              New
                          </button>
                        </div>
                      </div>
                      <div className="view-filters">
                          <div className="filter-container null">
                            <div className="filters">
                                <div id="filter-categ-container">
                                    <div className="filter-type mr-n1">Owner <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Users <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Groups <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Status <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Due Date <FaCaretDown/> </div>
                                </div>
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
