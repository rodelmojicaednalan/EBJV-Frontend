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
import { CSVLink } from 'react-csv'

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
  
  const [availableUsers, setAvailableUsers] = useState([]);
  const [projectGroups, setProjectGroups] = useState([]);
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project-activities/${projectId}`);
        const { id, project_name, owner, project_activities, } = response.data;


        setProjectName(project_name);
        setOwnerName(`${owner.first_name} ${owner.last_name}`)


        const formattedActivities = project_activities.map((activity) => ({
          id: activity.activityId,
          activityType: activity.activityType, // Assuming the file object has this key
          activityDescription: activity.activityDescription,
          relatedData: JSON.parse(activity.relatedData),
          activityOwner: activity.activator,
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
        //console.log(project_activities)
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };
    
    const fetchAvailableUsers = async () => {
      try {
        const [currentUserResponse, projectResponse, usersResponse] = await Promise.all([
          axiosInstance.get(`/user`),
          axiosInstance.get(`/project-contributors/${projectId}`),
          axiosInstance.get(`/users`),
        ]);
    
        const currentUser = currentUserResponse.data;
        const { contributors, groups } = projectResponse.data; // Get contributors from project details
        const users = usersResponse.data;
    
        // Extract emails of contributors
        const contributorEmails = contributors.map((contributor) => contributor.email);
        const projectGroups = groups.map((group) => group.group_name)

        const formattedToAdd = users
        .filter((user) => 
          contributorEmails.includes(user.email) 
        )
        .map((user) => ({
          label: `${user.first_name} ${user.last_name} (${user.email})`, // Label for dropdown
          value: user.email, // Value for dropdown
        }));

        setProjectGroups(projectGroups);
        setAvailableUsers(formattedToAdd);
        //console.log(formattedUsers)
        console.log(projectGroups)
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchAvailableUsers();
    fetchProjectDetails();
  }, [projectId]);

  const handleExportToCSV = () => {
    // Define headers based on activity card data keys
    const headers = [
        { label: "Activity Type", key: "activityType" },
        { label: "Activity Description", key: "activityDescription" },
        { label: "Related Data", key: "relatedData" },
        { label: "Activity Owner", key: "activityOwner" },
        { label: "Last Modified", key: "lastModified" },
    ];

    // Map activity card data to match the keys
    const data = activityCardData.map((activity) => ({
        activityType: activity.activityType,
        activityDescription: activity.activityDescription,
        relatedData: activity.relatedData, // Convert relatedData array to a string
        activityOwner: activity.activityOwner, // Assuming activator has first_name & last_name
        lastModified: activity.lastModified,
    }));

    // Return headers and data for the CSV export
    return { headers, data };
};


useEffect(() => {
  const generateFilters = () => {
    const typeOptions = ["Files", "Folders", "Users", "Views", "Clashsets", "Releases", "ToDo", "Topics", "Comments", "Share", "Other"]; // Static mapping for ownership
    const userOptions = availableUsers.map(user => user.label); // Use availableUsers
    const groupOptions = projectGroups; // Already formatted in `fetchAvailableUsers`
    const dueDateOptions = ["Today", "Last Week", "Last Month"]; // Due date can remain static or dynamically computed
    
    const filters = [
      {
        type: "Type",
        options: typeOptions,
      },
      {
        type: "Users",
        options: userOptions,
      },
      {
        type: "Groups",
        options: groupOptions,
      },
      {
        type: "Due Date",
        options: dueDateOptions,
      },
    ];
    
    setFilters(filters); // Store the dynamic filters in state
  };

  generateFilters();
}, [activityCardData, availableUsers, projectGroups]);


  const handleDropdownToggle = (filterType) => {
    // Toggle the dropdown visibility for the clicked filter
    setActiveDropdown((prev) => (prev === filterType ? null : filterType));
  };

  const renderDropdown = (filter) => {
    return (
      <div className="filter-dropdown" id="activity-filter" >
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
                            <CSVLink
                                {...handleExportToCSV()}
                                filename={`${ownerName}'s ${projectName}_Activity.csv`}
                                className="exportToCSV-white"
                                target="_blank"
                              >
                                <FaFileExcel/>
                            </CSVLink>
                          </button>
                        </div>
                      </div>

                      <div className="view-filters">
                          <div className="filter-container">
                            <div className="filters d-flex">
                            {filters.map((filter) => (
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
