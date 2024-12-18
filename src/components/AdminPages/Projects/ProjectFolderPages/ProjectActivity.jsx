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
        const response = await axiosInstance.get(`/project-activities/${projectId}`);
        const { id, project_name, owner, project_activities, } = response.data;


        setProjectName(project_name);
        setOwnerName(`${owner.first_name} ${owner.last_name}`)


        const formattedActivities = project_activities.map((activity) => ({
          id: id,
          activityType: activity.activityType, // Assuming the file object has this key
          activityDescription: activity.activityDescription,
          relatedData: JSON.parse(activity.relatedData),
          activityOwner: `${owner.first_name} ${owner.last_name}`,
          lastModified: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: 'numeric'
          }).format(new Date(activity.lastModified)),  // Format updatedAt
        }));

        setActivityCardData(formattedActivities)
        console.log(project_activities)
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
                  {activityCardData.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)).map((data) => (
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
                              <div> <img src={man} style={{height:"24px"}}/> <span style={{fontWeight:"500", textTransform:"uppercase"}}>{data.activityOwner} </span></div>
                              <div> <span style={{fontStyle: "italic", fontWeight:"light"}} > {data.activityDescription} </span></div>
                            </div>
                            <div className="activity-file"> {data.relatedData} </div>
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
