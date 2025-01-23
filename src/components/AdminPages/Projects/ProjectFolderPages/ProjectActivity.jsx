import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import { useParams } from "react-router-dom";
import StickyHeader from "../../../SideBar/StickyHeader";
import man from '../../../../assets/images/man.png'
import { CSVLink } from 'react-csv'
import '../ProjectStyles.css'
import ProjectSidebar from '../ProjectFolderSidebar';
import { FaCaretDown, FaFileExcel, FaHistory } from "react-icons/fa";

import SidebarOffcanvas from '../MobileSidebar';
import useWindowWidth from './windowWidthHook.jsx'
function ProjectActivity() {
  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [activityCardData ,setActivityCardData] = useState([])
  const [activeDropdown, setActiveDropdown] = useState(null);
   const [openDropdownId, setOpenDropdownId] = useState(null);

  const [filters, setFilters] = useState([]);
  const [projectGroups, setProjectGroups] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [filteredActivities, setFilteredActivities] = useState([]);
  const dropdownRef = useRef(null);

  const toggleDropdown = (id) => {
    console.log("Toggling dropdown for ID:", id);
    setOpenDropdownId(openDropdownId === id ? null : id);
  };
  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project-activities/${projectId}`);
        const { project_name, owner, project_activities, } = response.data;

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

    
    const fetchGroups = async () => {
      try {
        const [projectResponse] = await Promise.all([
          axiosInstance.get(`/project-contributors/${projectId}`),
        ]);

        const { groups } = projectResponse.data;
        const projectGroups = groups.map((group) => group.group_name);

        setProjectGroups(projectGroups);

      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchProjectDetails();
    fetchGroups();
  }, [projectId], projectGroups);

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
    const typeOptions = ["Files", "Folders", "Users", "Views", "Clashsets", "activitys", "ToDo", "Topics", "Comments", "Share", "Other"]; // Static mapping for ownership
    const userOptions = Array.from(
      new Set(activityCardData.map((owner) => owner.activityOwner))
    );    
    const groupOptions = projectGroups; // Already formatted in `fetchAvailableUsers`
    const dateModifiedOptions = ["Today", "This Week", "Last Month"];
    
    const filters = [
      { type: "Type", options: typeOptions},
      { type: "Users", options: userOptions},
      { type: "Groups", options: groupOptions},
      { type: "Date Modified", options: dateModifiedOptions},
    ];
    
    setFilters(filters); // Store the dynamic filters in state
  };

  generateFilters();
}, [activityCardData, projectGroups]);


useEffect(() => {
    let filteredData = [...activityCardData];
  
    Object.keys(selectedFilters).forEach((filterType) => {
      const selectedOptions = selectedFilters[filterType];
      if (selectedOptions.length > 0) {
        filteredData = filteredData.filter((activity) => {
          switch (filterType) {
            case "Type":
              return selectedOptions.includes(activity.activityType);
            case "Users":
              return selectedOptions.includes(activity.activityOwner);
            case "Groups":
              return selectedOptions.includes(activity.group);
            case "Date Modified":
              { const dueDate = new Date(activity.lastModified);
              const today = new Date();
              if (selectedOptions.includes("Today")) {
                return (
                  dueDate.getFullYear() === today.getFullYear() &&
                  dueDate.getMonth() === today.getMonth() &&
                  dueDate.getDate() === today.getDate()
                );
              }
              if (selectedOptions.includes("This Week")) {
                const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                return dueDate >= startOfWeek && dueDate <= endOfWeek;
              }
              if (selectedOptions.includes("Last Month")) {
                const lastMonth = new Date();
                lastMonth.setMonth(today.getMonth() - 1);
                return (
                  dueDate.getFullYear() === lastMonth.getFullYear() &&
                  dueDate.getMonth() === lastMonth.getMonth()
                );
              }
              return true; }
            default:
              return true;
          }
        });
      }
    });
  
    setFilteredActivities(filteredData);
  }, [selectedFilters, activityCardData]);


  const handleCheckboxChange = (filterType, option) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: prevFilters[filterType]?.includes(option)
        ? prevFilters[filterType].filter((item) => item !== option)
        : [...(prevFilters[filterType] || []), option],
    }));
  };

  const renderDropdown = (filter) => (
      <div className="filter-dropdown" ref={dropdownRef}>
        {filter.options.map((option, index) => (
          <div key={index} className="dropdown-item">
            <input
              type="checkbox"
              id={`${filter.type}-${index}`}
              checked={selectedFilters[filter.type]?.includes(option) || false}
              onChange={() => handleCheckboxChange(filter.type, option)}
            />
            <label className="filter-label" htmlFor={`${filter.type}-${index}`}>{option}</label>
          </div>
        ))}
      </div>
    );
  
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleOutsideClick = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setActiveDropdown(null);
        }
      };
  
      document.addEventListener("mousedown", handleOutsideClick);
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, []);
  
  
    const menuRef  = useRef(null);
    useEffect(() => {
      const handleOutsideClick = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          toggleDropdown(null);
        }
      };
  
      document.addEventListener("mousedown", handleOutsideClick);
  
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, []);


  return (
    <div className="container">
      {/* <StickyHeader />
      <h3 className="title-page" id="projectFolder-title">
        {ownerName}&apos;s {projectName} 
      </h3> */}
      <div className="container-content" id="project-folder-container">
      <div className="projectFolder-sidebar-container">
      {isMobile ? (
          <SidebarOffcanvas projectId={projectId} />
        ) : (
          <ProjectSidebar projectId={projectId} />
        )}
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
                              <div key={filter.type} className="filter-type mr-3 d-flex" onClick={() => setActiveDropdown(filter.type)}>
                                {filter.type} <FaCaretDown />
                                {activeDropdown === filter.type && renderDropdown(filter)}
                              </div>
                            ))}
                            </div>
                          </div>
                      </div> 

                <div className="activity-cards-box mt-1 d-flex">
                  {filteredActivities.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)).map((data) => (
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
