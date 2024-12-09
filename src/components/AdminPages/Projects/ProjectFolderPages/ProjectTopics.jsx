import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";
import { AuthContext } from "../../../Authentication/authContext";
import upload_icon from "../../../../assets/images/uploading.png";

import '../ProjectStyles.css'
import { FiChevronLeft, FiClock } from 'react-icons/fi';
import { FaBookmark, FaCircleInfo  } from "react-icons/fa6";
import { FaRegCalendar, FaCaretDown, FaListAlt  } from "react-icons/fa";
import { GrStatusGoodSmall, GrSort } from "react-icons/gr";
import { RiEdit2Fill } from "react-icons/ri";
import { BiDotsVertical } from "react-icons/bi";
import { MdCompress } from "react-icons/md";
import { GoAlertFill } from "react-icons/go";


import ProjectSidebar from '../ProjectFolderSidebar';

function ProjectTopics() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [existingFiles, setExistingFiles] = useState([]); // Existing files
  const [fileName, setFileName] = useState([]);
  const [fileSize, setFileSize] = useState([])
  const [error, setError] = useState("");

  const [topicData ,setTopicData] = useState([])
  const navigate = useNavigate();

  const [activeDropdown, setActiveDropdown] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);

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
        const { project_name, user, files, updatedAt, createdAt } = response.data;
        const parsedFiles = JSON.parse(response.data.project_file)

        setProjectName(project_name);
        setOwnerName(`${user.first_name} ${user.last_name}`)
        setExistingFiles(parsedFiles);

        const formattedFiles = files.map((file) => ({
          fileName: file.fileName, // Assuming the file object has this key
          fileSize: `${(file.fileSize / (1024 * 1024)).toFixed(2)} MB`, // Convert bytes to KB
          fileOwner: `${user.first_name} ${user.last_name}`,
          dateCreated: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }).format(new Date(createdAt)),
          lastModified: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }).format(new Date(updatedAt)),  // Format updatedAt
        }));

        setTopicData(formattedFiles)
        console.log(topicData.dateCreated)
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };
    

    fetchProjectDetails();
  }, [projectId]);



  const sampleFilters = [
    {
      type: "Type",
      options: ["Undefined", "Comment", "Issue", "Request", "Fault", "Inquiry", "Solution", "Remark", "Clash"],
    },
    {
      type: "Priority",
      options: ["Low", "Normal", "High", "Critical"],
    },
    {
      type: "Status",
      options: ["New", "In Progress", "Pending", "Closed", "Done"],
    },
    {
      type: "Tags",
      options: [""],
    },
  ];

  const handleDropdownToggle = (filterType) => {
    // Toggle the dropdown visibility for the clicked filter
    setActiveDropdown((prev) => (prev === filterType ? null : filterType));
  };

  const renderDropdown = (filter) => {
    return (
      <div className="filter-dropdown">
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



  const topicDummyData = [
    {
      id: 1,
      title: "New Structural Design for ABG Group",
      assignedTo: "Sean Carter",
      createdBy: "Marshall Mathers",
      createdAt: "Dec 02, 2024 10:53 AM",
      priority: "High Priority",
      status: "In Progress",
      type: "Inquiry",
      deadline: "Dec 15, 2024",
      icons: {
        priorityIcon: <FaBookmark style={{ color: "gold" }} />,
        statusIcon: <GrStatusGoodSmall style={{ color: "green" }} />,
        typeIcon: <FaCircleInfo style={{ color: "royalBlue" }} />,
        deadlineIcon: <FaRegCalendar />,
      },
    },
    {
      id: 2,
      title: "Architecture Update on House Remodeling",
      assignedTo: "Kyrie Irving",
      createdBy: "LeBron James",
      createdAt: "Dec 01, 2024 3:45 PM",
      priority: "Normal Priority",
      status: "Pending",
      type: "Remark",
      deadline: "Dec 10, 2024",
      icons: {
        priorityIcon: <FaBookmark style={{ color: "royalBlue" }} />,
        statusIcon: <GrStatusGoodSmall style={{ color: "orange" }} />,
        typeIcon: <RiEdit2Fill style={{ color: "darkorange" }} />,
        deadlineIcon: <FaRegCalendar />,
      },
    },
    {
      id: 3,
      title: "Adjustments to Structure for 2nd Avenue Warehouse",
      assignedTo: "Peter Parker",
      createdBy: "Frank Castle",
      createdAt: "Nov 30, 2024 11:15 AM",
      priority: "Low Priority",
      status: "Completed",
      type: "Request",
      deadline: "Dec 05, 2024",
      icons: {
        priorityIcon: <FaBookmark style={{ color: "green" }} />,
        statusIcon: <GrStatusGoodSmall style={{ color: "royalBlue" }} />,
        typeIcon: <FaListAlt  style={{ color: "teal" }} />,
        deadlineIcon: <FaRegCalendar />,
      },
    },
    {
      id: 4,
      title: "Revisions on Flooring for New Building",
      assignedTo: "Yoo Jimin",
      createdBy: "Kim Minjeong",
      createdAt: "Nov 30, 2024 11:15 AM",
      priority: "Critical Priority",
      status: "New",
      type: "Fault",
      deadline: "Dec 05, 2024",
      icons: {
        priorityIcon: <FaBookmark style={{ color: "red" }} />,
        statusIcon: <GrStatusGoodSmall style={{ color: "blue" }} />,
        typeIcon: <GoAlertFill style={{ color: "red" }} />,
        deadlineIcon: <FaRegCalendar />,
      },
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
                          <h2>Topics</h2>
                        </div>
                        <div className="button-group d-flex">
                          <button className="btn btn-icon grid-view-btn" title="Compress">
                            <MdCompress /> 
                          </button>
                          <button className="btn btn-icon list-view-btn" title="Sort">
                            <GrSort/>
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
                                  onClick={() => handleMenuOptionClick("Export Topics")}
                                >
                                  Export Topics
                                </div>
                                <div
                                  className="dropdown-item"
                                  onClick={() => handleMenuOptionClick("Import Topic")}
                                >
                                  Import Topics 
                                </div>
                              </div>
                            )}
                          </div>
                          <button id="addbtn"className="btn btn-primary add-btn" title="Add Topic" >
                             New
                          </button>
                        </div>
                      </div>

                      <div className="view-filters mb-2">
                          <div className="filter-container null">
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

                    
                      <div className="activity-cards-box mt-2 d-flex">
                        {topicDummyData.map((topic) => (
                          <div key={topic.id} className="topic-card container-fluid">
                            <div className="topic-time d-none d-md-flex ">
                              <span className="text-muted">{topic.createdAt}</span>
                            </div>
                            <div className="flex-row">
                              <div className="activity flex-1">
                                <div className="topic-title">{topic.title}</div>
                                <div className="row-distribute">
                                  <div className="topic-users flex-row">
                                    <div className="assignee">
                                      <p>
                                        <strong>Assigned to:</strong> {topic.assignedTo}
                                      </p>
                                    </div>
                                    <div className="creator">
                                      <p>
                                        <strong>Created by:</strong> {topic.createdBy}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="topic-config">
                                    <ul className="flex-row">
                                      <li className="mr-2">
                                        {topic.icons.priorityIcon} {topic.priority}
                                      </li>
                                      <li className="mr-2">
                                        {topic.icons.statusIcon} {topic.status}
                                      </li>
                                      <li className="mr-2">
                                        {topic.icons.typeIcon} {topic.type}
                                      </li>
                                      <li className="mr-2">
                                        {topic.icons.deadlineIcon} {topic.deadline}
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="topic-desc"></div>
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
export default ProjectTopics;
