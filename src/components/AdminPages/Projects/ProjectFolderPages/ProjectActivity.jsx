import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";
import { AuthContext } from "../../../Authentication/authContext";
import upload_icon from "../../../../assets/images/uploading.png";
import view_model from "../../../../assets/images/view-model.png";
import man from '../../../../assets/images/man.png'

import '../ProjectStyles.css'
import { FiChevronLeft, FiUser } from 'react-icons/fi';


import ProjectSidebar from '../ProjectFolderSidebar';
import { FaChevronLeft } from "react-icons/fa6";
import { FaCaretDown, FaFileExcel, FaHistory } from "react-icons/fa";

function ProjectActivity() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [existingFiles, setExistingFiles] = useState([]); // Existing files
  const [error, setError] = useState("");

  const [activityCardData ,setActivityCardData] = useState([])
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);

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

        setActivityCardData(formattedFiles)
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };
    

    fetchProjectDetails();
  }, [projectId]);

  const sampleFilters = [
    {
      type: "Activity Type",
      options: ["Files", "Folders", "Users", "Views", "Clashsets", "Releases", "ToDo", "Topics", "Comments", "Share", "Other"],
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
      <div className="filter-dropdown" id="activity-filter">
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

  const cardData = [
    {
      id: 1,
      fileName: "Model5.ifc",
      fileOwner: "Charlie White",
      lastModified: "Nov 12, 2024 3:15 AM",
      fileSize: "300 KB",
      activityDesc: "added topic to file"
    },
    {
      id: 2,
      fileName: "Model5.ifc",
      fileOwner: "Charlie Red",
      lastModified: "Nov 8, 2024 11:41 AM",
      fileSize: "300 KB",
      activityDesc: "modified file name"
    },
    {
      id: 3,
      fileName: "Model72.ifc",
      fileOwner: "Charlie Brown",
      lastModified: "Nov 8, 2024 6:33 AM",
      fileSize: "300 KB",
      activityDesc: "added file"
    },
    {
      id: 4,
      fileName: "Modelxx31.ifc",
      fileOwner: "Charlie Green",
      lastModified: "Nov 7, 2024 1:12 PM",
      fileSize: "300 KB",
      activityDesc: "Commented on Topic A"
    },
    {
      id: 5,
      fileName: "",
      fileOwner: "Charlie Brown",
      lastModified: "Nov 7, 2024 12:07 PM",
      fileSize: "300 KB",
      activityDesc: "added Topic A "
    },
    {
      id: 6,
      fileName: "",
      fileOwner: "Charlie Brown",
      lastModified: "Nov 7, 2024 11:33 AM",
      fileSize: "300 KB",
      activityDesc: "created Project "
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
                          <h2>Activity</h2>
                        </div>
                        <div className="button-group d-flex">
                          <button id="excelExport"className="btn btn-primary add-btn" title="Export to Excel">
                            <FaFileExcel/>
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

                <div className="activity-cards-box mt-1 d-flex">
                  {cardData.map((data) => (
                    <div
                      key={data.id}
                      className="activity-card container-fluid mb-2"
                    >
                      <div className="activity-time d-none d-md-flex ">
                        <span className="text-muted">{data.lastModified}</span>
                      </div>
                      <div className="d-flex">
                        <div className="d-none d-md-block activity-type">
                          <FaHistory style={{height:"24px", width:"24px", color:"#eb6314"}}/>
                        </div>
                        <div className="activity-container">
                          <div className="activity-type-profile">
                    
                          </div>
                          <div className="activity">
                            <div className="row">
                              <div> <img src={man} style={{height:"24px"}}/> <span style={{fontWeight:"500", textTransform:"uppercase"}}>{data.fileOwner} </span></div>
                              <div> <span style={{fontStyle: "italic", fontWeight:"light"}} > {data.activityDesc} </span></div>
                            </div>
                            <div className="activity-file"> {data.fileName} </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProjectActivity;
