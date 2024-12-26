import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";
import { AuthContext } from "../../../Authentication/authContext";
import upload_icon from "../../../../assets/images/uploading.png";

import '../ProjectStyles.css'
import { FiChevronLeft, FiChevronDown } from 'react-icons/fi';
import { FaCaretDown } from "react-icons/fa";
import { BiDotsVertical } from "react-icons/bi";
import { IoGrid } from "react-icons/io5";
import { FaThList } from "react-icons/fa";


import ProjectSidebar from '../ProjectFolderSidebar';

function ProjectViews() {

  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [existingFiles, setExistingFiles] = useState([]); // Existing files
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [viewsTable ,setViewsTable] = useState([])

  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project/${projectId}`);
        const { project_name, owner, project_views, project_file } = response.data;
  

        setProjectName(project_name);
        setOwnerName(`${owner.first_name} ${owner.last_name}`)
        setExistingFiles(project_file);

        const formattedViews = project_views.map((view) => ({
          viewName: view.view_name, // Assuming the file object has this key
          viewOwner: `${owner.first_name} ${owner.last_name}`,
          isOwner: view.is_owner,
          viewDesc: view.view_description,
          viewTags: view.assigned_tags,
          lastModified: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }).format(new Date(updatedAt)),  // Format updatedAt
        }));

        setViewsTable(formattedViews)
        //console.log(viewsTable)
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
      type: "Date Modified",
      options: ["Today", "Last Week", "Last Month"],
    },
  ];

  const handleDropdownToggle = (filterType) => {
    // Toggle the dropdown visibility for the clicked filter
    setActiveDropdown((prev) => (prev === filterType ? null : filterType));
  };

  const renderDropdown = (filter) => {
    return (
      <div className="filter-dropdown"  id="viewFilters">
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
  
  // Define columns for the table
  const sampleColumns = [
    {
      name: "View Name",
      selector: (row) => row.viewName,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.viewDesc,
      sortable: true,
    },
    {
      name: "Ownership",
      selector: (row) => row.isOwner,
      sortable: true,
    },
    {
      name: "Modified",
      selector: (row) => row.lastModified,
      sortable: true,
    },
  ];


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
                          <h2>Views</h2>
                        </div>
                      </div>
                      <div className="view-group d-flex mb-3">
                          <div className="view-button-container">
                            <div className="view-buttons">
                              <div className="views-btn mr-n1 pb-2 active"> 3D View </div>
                              <div className="views-btn mr-n1 pb-2"> 2D View </div>
                            </div>
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
                        data={viewsTable}
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


export default ProjectViews;
