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
      viewName: "Model1 View",
      description: "Basic View",
      shared: "Created by Me",
      lastModified: "2024-12-01 14:35"

    },
    {
      id: 2,
      viewName: "Model1 View - Top",
      description: "Top View",
      shared: "Created by Me",
      lastModified: "2024-11-28 09:12"

    },
    {
      id: 3,
      viewName: "Model1 View - Side",
      description: "Left Rear Side View",
      shared: "Shared with Me",
      lastModified: "2024-11-25 16:50"

    },
    {
      id: 4,
      viewName: "Model1 View - Skeleton",
      description: "Skeletal Structure View",
      shared: "Shared with Me",
      lastModified: "2024-11-22 13:27"
    },
  ];
  
  // Define columns for the table
  const sampleColumns = [
    {
      name: "View Name",
      selector: (row) => row.viewName,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
    },
    {
      name: "Ownership",
      selector: (row) => row.shared,
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
      <a href="/projects" className="back-btn">
        <h3 className="title-page">
          <FiChevronLeft className="icon-left" /> {ownerName}'s {projectName} 
        </h3>
      </a>
      <div className="container-content" id="project-folder-container">
      <ProjectSidebar projectId={projectId}/>

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
                          <div className="filter-container null">
                            <div className="filters">
                                <div id="filter-categ-container">
                                    <div className="filter-type mr-n1">Owner <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Users <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Groups <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Date Modified <FaCaretDown/> </div>
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


export default ProjectViews;
