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
import { BiDotsVertical } from "react-icons/bi";
import { IoGrid } from "react-icons/io5";
import { FaThList } from "react-icons/fa";


import ProjectSidebar from '../ProjectFolderSidebar';

function ProjectExplorer() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [existingFiles, setExistingFiles] = useState([]); // Existing files
  const [fileName, setFileName] = useState([]);
  const [fileSize, setFileSize] = useState([])
  const [error, setError] = useState("");

  const [explorerTable ,setExplorerTable] = useState([])
  const navigate = useNavigate();


  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project/${projectId}`);
        const { project_name, user, files, updatedAt } = response.data;
        const parsedFiles = JSON.parse(response.data.project_file)

        setProjectName(project_name);
        setOwnerName(`${user.first_name} ${user.last_name}`)
        setExistingFiles(parsedFiles);

        const formattedFiles = files.map((file) => ({
          fileName: file.fileName, // Assuming the file object has this key
          fileSize: `${(file.fileSize / (1024 * 1024)).toFixed(2)} MB`, // Convert bytes to KB
          fileOwner: `${user.first_name} ${user.last_name}`,
          lastModified: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }).format(new Date(updatedAt)),  // Format updatedAt
        }));

        setExplorerTable(formattedFiles)
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };
    

    fetchProjectDetails();
  }, [projectId]);

  
  // Define columns for the table
  const explorerColumn = [
    {
      name: "File Name",
      width: "30%",
      selector: (row) => row.fileName,
      sortable: true,
    },
    {
      name: "File Owner",
      width: "20%",
      selector: (row) => row.fileOwner,
      sortable: true,
    },
    {
      name: "Last Modified",
      width: "20%",
      selector: (row) => row.lastModified,
      sortable: true,
    },
    {
      name: "File Size",
      selector: (row) => row.fileSize,
      sortable: true,
    },
    {
      name: "Tags",
      selector: (row) => "",
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
                          <h2>Explorer</h2>
                        </div>
                        <div className="button-group d-flex">
                          <button className="btn btn-icon grid-view-btn" title="Grid View">
                            <IoGrid /> 
                          </button>
                          <button className="btn btn-icon list-view-btn" title="List View">
                            <FaThList/>
                          </button>
                          <button className="btn btn-icon menu-btn" title="Menu">
                            <BiDotsVertical/>
                          </button>
                          <button id="addbtn"className="btn btn-primary add-btn" title="Add">
                            + Add
                          </button>
                        </div>
                      </div>

                      <DataTable
                        className="dataTables_wrapperz mt-3"
                        id="explorer-table"
                        columns={explorerColumn}
                        data={explorerTable}
                        //pagination
                        //paginationPerPage={20}
                        //paginationRowsPerPageOptions={[20, 30]} 
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
