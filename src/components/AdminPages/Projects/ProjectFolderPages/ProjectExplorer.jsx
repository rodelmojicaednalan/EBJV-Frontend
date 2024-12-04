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
import { FiChevronLeft } from 'react-icons/fi';


import ProjectSidebar from '../ProjectFolderSidebar';

function ProjectExplorer() {
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
      fileName: "Model1.ifc",
      fileOwner: "John Doe",
      lastModified: "2024-12-01 14:35",
      fileSize: "2.3 MB",
    },
    {
      id: 2,
      fileName: "Model2.ifc",
      fileOwner: "Jane Smith",
      lastModified: "2024-11-28 09:12",
      fileSize: "5.1 MB",
    },
    {
      id: 3,
      fileName: "Model3.ifc",
      fileOwner: "Alice Johnson",
      lastModified: "2024-11-25 16:50",
      fileSize: "3.8 MB",
    },
    {
      id: 4,
      fileName: "Model4.ifc",
      fileOwner: "Bob Williams",
      lastModified: "2024-11-22 13:27",
      fileSize: "1.2 MB",
    },
    {
      id: 5,
      fileName: "Model5.ifc",
      fileOwner: "Charlie Brown",
      lastModified: "2024-11-20 08:10",
      fileSize: "300 KB",
    },
  ];
  
  // Define columns for the table
  const sampleColumns = [
    {
      name: "File Name",
      selector: (row) => row.fileName,
      sortable: true,
    },
    {
      name: "File Owner",
      selector: (row) => row.fileOwner,
      sortable: true,
    },
    {
      name: "Date Last Modified",
      selector: (row) => row.lastModified,
      sortable: true,
    },
    {
      name: "File Size",
      selector: (row) => row.fileSize,
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
      

                      <DataTable
                        className="dataTables_wrapper mt-5"
                        columns={sampleColumns}
                        data={sampleData}
                        pagination
                        paginationPerPage={20}
                        paginationRowsPerPageOptions={[20, 30]}
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

export default ProjectExplorer;
