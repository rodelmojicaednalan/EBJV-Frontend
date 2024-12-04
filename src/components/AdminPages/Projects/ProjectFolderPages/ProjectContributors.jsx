import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";
import { AuthContext } from "../../../Authentication/authContext";
import upload_icon from "../../../../assets/images/uploading.png";

import '../ProjectStyles.css'
import { FiChevronLeft, FiChevronDown } from 'react-icons/fi';
import { IoSearchSharp } from "react-icons/io5";
import { BiDotsVertical } from "react-icons/bi";


import ProjectSidebar from '../ProjectFolderSidebar';
function ProjectContributors() {
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
        const { project_name, user, files, updatedAt, project_status } = response.data;
        const parsedFiles = JSON.parse(response.data.project_file)

        setProjectName(project_name);
        setOwnerName(`${user.first_name} ${user.last_name}`)
        setExistingFiles(parsedFiles);

        const formattedFiles = files.map((file) => ({
          fileName: file.fileName, // Assuming the file object has this key
          fileSize: `${(file.fileSize / (1024 * 1024)).toFixed(2)} MB`, // Convert bytes to KB
          fileOwner: `${user.first_name} ${user.last_name}`,
          projectStatus: project_status,
          lastModified: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(updatedAt)),  // Format updatedAt
        }));

        setExplorerTable(formattedFiles)
        console.log(status)
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };
    

    fetchProjectDetails();
  }, [projectId]);

  const explorerColumn = [
    {
      name: "Name",

      selector: (row) => row.fileOwner,
      sortable: true,
    },
    {
      name: "Employer",

      selector: (row) => "-",
      sortable: true,
    },
    {
      name: "Role",

      selector: (row) => "~",
      sortable: true,
    },
    {
      name: "Status",

      selector: (row) => row.projectStatus,
      sortable: true,
    },
    {
      name: "Last Modified",

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
                    <div className="container-fluid moduleFluid px-0">
                    <div className="table-header d-flex justify-content-between align-items-center mb-3">
                        <div className="page-title ml-2">
                          <h2>Project Contributors</h2>
                        </div>
                    
                      </div>
                      <div className="contributor-wrapper">
                        <div className="panel-left d-none d-md-flex">
                          <div className="tempPanel">
                            <div className="listPanel">
                              <div className="listHeader">
                                <h3>Groups</h3>
                                <button className="btn-default small">
                                  New Group
                                </button>
                              </div>
                              <div className="listWrapper">
                                <div classname="sub-section py-2">
                                  <ul className="list">
                                    <li className="list-item item-btn px-2 selectable active">
                                      <div className="label-group">
                                        <div className="value">All contributors</div>
                                        <label>1 User</label>
                                      </div>
                                    </li>
                                  </ul>
                                </div>
                                <h6  id="customgroup" className="text-muted px-2"> Custom Groups </h6>
                                <div classname="sub-section py-2">
                                  <p className="text-muted px-2"> No group found</p>
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
                                        <div className="filters">
                                          <div id="filter-categ-container">
                                            <div className="filter-type mr-n1">Role <FiChevronDown/> </div>
                                            <div className="filter-type mr-n1">Status <FiChevronDown/> </div>
                                          </div>
                                        </div>
                                      </div>

                                    </div>
                                    <button className="search-button">
                                      <IoSearchSharp className="search-icon"/>
                                    </button>
                                    <div className="dropdown-pane-container">
                                    <button className="more-button">
                                      <BiDotsVertical className="more-icon"/>
                                    </button>
                                    </div>
                                  </div>

                              </div>
                              <div className="tableWrapper">
                                <div className="tableList">
                                <DataTable
                                  className="dataTables_wrapperx"
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
                    </div>
                </div>
          </div>

      </div>
      </div>
      );
    }
export default ProjectContributors;
