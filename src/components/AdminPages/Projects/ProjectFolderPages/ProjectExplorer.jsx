import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";


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

  const [viewType, setViewType] = useState("list");
  const [menuOpen, setMenuOpen] = useState(false);

  const [explorerTable ,setExplorerTable] = useState([])
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuOptionClick = (option) => {
    setMenuOpen(false);
    Swal.fire(`Function to: ${option}`);
  };

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
                          <h2>Explorer</h2>
                        </div>
                        <div className="button-group d-flex">
                          <button
                            className={`btn btn-icon grid-view-btn ${viewType === "grid" ? "active" : ""}`}
                            title="Grid View"
                            onClick={() => setViewType("grid")}
                          >
                            <IoGrid />
                          </button>
                          <button
                            className={`btn btn-icon list-view-btn ${viewType === "list" ? "active" : ""}`}
                            title="List View"
                            onClick={() => setViewType("list")}
                          >
                            <FaThList />
                          </button>
                          <div className="menu-btn-container position-relative">
                      <button
                        className="btn btn-icon menu-btn"
                        title="Menu"
                        onClick={handleMenuToggle}
                      >
                        <BiDotsVertical />
                      </button>
                      {menuOpen && (
                        <div className="dropdown-menu">
                          <div
                            className="dropdown-item"
                            onClick={() => handleMenuOptionClick("Export to Excel")}
                          >
                            Export to Excel
                          </div>
                          <div
                            className="dropdown-item"
                            onClick={() => handleMenuOptionClick("Checkin")}
                          >
                            Checkin Files
                          </div>
                          <div
                            className="dropdown-item"
                            onClick={() => handleMenuOptionClick("Checkout")}
                          >
                            Checkout Files
                          </div>
                        </div>
                      )}
                    </div>
                          <button id="addbtn" className="btn btn-primary add-btn" title="Add">
                            + Add
                          </button>
                        </div>
                      </div>

                      <div className={`project-display ${viewType}`}>
                        {viewType === "grid" ? (
                          <div className="grid-view">
                            {explorerTable.map((row, index) => (
                              <div key={index} className="grid-item">
                                <h5>{row.fileName}</h5>
                                <p>Owner: {row.fileOwner}</p>
                                <p>Modified: {row.lastModified}</p>
                                <p>Size: {row.fileSize}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <DataTable
                            className="dataTables_wrapperz mt-3"
                            id="explorer-table"
                            columns={explorerColumn}
                            data={explorerTable}
                            responsive
                          />
                        )}
                      </div>

                      </div>
                    </div>
                </div>
          </div>

      </div>
      </div>
      );
    }

export default ProjectExplorer;
