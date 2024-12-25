import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";
import { AuthContext } from "../../../Authentication/authContext";
import upload_icon from "../../../../assets/images/uploading.png";

import '../ProjectStyles.css'
import { FiMoreVertical } from 'react-icons/fi';
import { FaBookmark, FaCircleInfo  } from "react-icons/fa6";
import { FaRegCalendar, FaCaretDown, FaListAlt  } from "react-icons/fa";
import { GrStatusGoodSmall, GrSort } from "react-icons/gr";
import { RiEdit2Fill } from "react-icons/ri";
import { BiDotsVertical } from "react-icons/bi";
import { MdCompress } from "react-icons/md";
import { GoAlertFill } from "react-icons/go";


import ProjectSidebar from '../ProjectFolderSidebar';

import Offcanvas from 'react-bootstrap/Offcanvas';
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
  const [refreshKey, setRefreshKey] = useState(0); 

  const [showCanvas, setShowCanvas] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuOptionClick = (option) => {
    setMenuOpen(false);
    Swal.fire(`Function to: ${option}`);
  };

  const handleCloseCanvas = () => setShowCanvas(false);
  const handleShowCanvas = () => setShowCanvas(true);

  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project-topics/${projectId}`);
        const { project_name, owner, project_topics, project_file } = response.data;

        setProjectName(project_name);
        setOwnerName(`${owner.first_name} ${owner.last_name}`)
        setExistingFiles(project_file);

        const capitalizeWords = (str) => {
          if (!str) return ""; // Handle null or undefined values
          return str
            .toLowerCase() // Convert the entire string to lowercase
            .split(" ") // Split the string into words
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
            .join(" "); // Join the words back into a single string
        };        

        const formattedTopics = project_topics.map((topic) => ({
          id: topic.id,
          name: topic.topicName,
          description: topic.topicDescription,
          assignee: JSON.parse(topic.assignee),
          type: capitalizeWords(topic.topicType),
          status: capitalizeWords(topic.topicStatus),
          priority: capitalizeWords(topic.topicPriority),
          topicDue: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }).format(new Date(topic.topicDueDate)),
          tags: topic.topicTags,
          modifiedOn: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: 'numeric',
            second: 'numeric'
          }).format(new Date(topic.lastUpdated)),
        }));

        setTopicData(formattedTopics)
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };
    

    fetchProjectDetails();
  }, [projectId, refreshKey]);



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

  const iconMappings = {
    priority: {
      low: <FaBookmark style={{ color: "green" }} />,
      normal: <FaBookmark style={{ color: "royalBlue" }} />,
      high: <FaBookmark style={{ color: "orange" }} />,
      critical: <FaBookmark style={{ color: "red" }} />,
    },
    status: {
      new: <GrStatusGoodSmall style={{ color: "green" }} />,
      "in-progress": <GrStatusGoodSmall style={{ color: "orange" }} />,
      pending: <GrStatusGoodSmall style={{ color: "royalBlue" }} />,
      closed: <GrStatusGoodSmall style={{ color: "gray" }} />,
      done: <GrStatusGoodSmall style={{ color: "blue" }} />,
    },
    type: {
      undefined: <FaCircleInfo style={{ color: "gray" }} />,
      comment: <RiEdit2Fill style={{ color: "royalBlue" }} />,
      issue: <GoAlertFill style={{ color: "red" }} />,
      request: <FaListAlt style={{ color: "teal" }} />,
      fault: <GoAlertFill style={{ color: "orange" }} />,
      inquiry: <FaCircleInfo style={{ color: "green" }} />,
      solution: <RiEdit2Fill style={{ color: "green" }} />,
      remark: <FaCircleInfo style={{ color: "gold" }} />,
      clash: <GoAlertFill style={{ color: "darkred" }} />,
    },
    deadline: <FaRegCalendar style={{ color: "gray" }} />, // Default deadline icon
  };
  
  const handleCreateTopic = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const formData = new FormData(e.target); // Automatically gathers form inputs
    const topicData = Object.fromEntries(formData);
    Swal.fire({
      title: 'Confirm topic creation',
      showCancelButton: true,
      confirmButtonColor: '#eb6314',
      cancelButtonColor: '#00000000',
      cancelTextColor: '#000000',
      confirmButtonText: 'Create Topic',
      customClass: {
        container: 'custom-container',
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button',
        title: 'custom-swal-title',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.post(`/create-topic/${projectId}`, topicData);
          Swal.fire({
            title: 'Success!',
            text: `Topic has been created.`,
            imageUrl: check,
            imageWidth: 100,
            imageHeight: 100,
            confirmButtonText: 'OK',
            confirmButtonColor: '#0ABAA6',
            customClass: {
              confirmButton: 'custom-success-confirm-button',
              title: 'custom-swal-title',
            },
          });
          setRefreshKey((prevKey) => prevKey + 1);
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'There was an error creating the topic.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#EC221F',
            customClass: {
              confirmButton: 'custom-error-confirm-button',
              title: 'custom-swal-title',
            },
          });
        }
      }
    });
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
                              <div className="dropdown-menu" id="topic-dropdown">
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
                          <button id="addbtn"className="btn btn-primary add-btn" title="Add Topic" onClick={handleShowCanvas}>
                             New
                          </button>
                        </div>
                      </div>

                      <Offcanvas 
                        show={showCanvas} 
                        onHide={handleCloseCanvas} 
                        placement="end" 
                        backdrop="static"
                        className="offcanvas"
                      >
                        <Offcanvas.Header closeButton className="offcanvas-head">
                          <Offcanvas.Title>Add New Topic</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body className="offcanvas-body">
                          {/* Form Starts Here */}
                          <form onSubmit={handleCreateTopic}>
                            <div className="form-group mb-3">
                              <label htmlFor="topicName">Topic Name <small>(Required)</small></label>
                              <input
                                type="text"
                                id="topicName"
                                name="topicName"
                                className="form-control"
                                placeholder="Enter topic name"
                                required
                              />
                            </div>
                            <div className="form-group mb-3">
                              <label htmlFor="topicDescription">Description </label>
                              <input
                                type="textarea"
                                id="topicDescription"
                                name="topicDesc"
                                className="form-control"
                                placeholder="Enter topic description"
                              />
                            </div>
                            <div className="form-group mb-3">
                              <label htmlFor="assignedTo">Assigned To</label>
                              <input
                                type="text"
                                id="assignedTo"
                                name="assigneeList"
                                className="form-control"
                                placeholder="Enter assignee's name"
                              />
                            </div>
                            <div className="form-group mb-3">
                              <label htmlFor="priority">Priority</label>
                              <select id="priority" name="topicPrio" className="form-control" required>
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                              </select>
                            </div>
                            <div className="form-group mb-3">
                              <label htmlFor="status">Status</label>
                              <select id="status" name="topicStatus" className="form-control" required>
                                <option value="new">New</option>
                                <option value="in-progress">In Progress</option>
                                <option value="pending">Pending</option>
                                <option value="closed">Closed</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                            <div className="form-group mb-3">
                              <label htmlFor="type">Type</label>
                              <select id="type" name="topicType" className="form-control" required>
                                <option value="undefined">Undefined</option>
                                <option value="comment">Comment</option>
                                <option value="issue">Issue</option>
                                <option value="request">Request</option>
                                <option value="fault">Fault</option>
                                <option value="inquiry">Inquiry</option>
                                <option value="solution">Solution</option>
                                <option value="remark">Remark</option>
                                <option value="clash">Clash</option>
                              </select>
                            </div>
                            <div className="form-group mb-3">
                              <label htmlFor="deadline">Deadline</label>
                              <input
                                type="date"
                                id="deadline"
                                name="topicDue"
                                className="form-control"
                                required
                              />
                            </div>
                            <button type="submit" id="offcanvas-btn" className="btn btn-primary w-100">Save Topic</button>
                          </form>
                          {/* Form Ends Here */}
                        </Offcanvas.Body>
                      </Offcanvas>


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
                        {topicData.sort((a, b) => new Date(b.modifiedOn) - new Date(a.modifiedOn)).map((topic) => (
                          <div key={topic.id} className="topic-card container-fluid">
                            <div className="topic-time d-none d-md-flex ">
                              <span className="text-muted">{topic.modifiedOn}</span>
                            </div>
                            <div className="flex-row">
                              <div className="activity flex-1">
                                <div className="topic-title">{topic.name}</div>
                                <div className="row-distribute">
                                  <div className="topic-users flex-row">
                                    <div className="assignee">
                                      <p>
                                        <strong>Assigned to:</strong> {topic.assignee}
                                      </p>
                                    </div>
                                    <div className="creator">
                                      <p>
                                        <strong>Created by:</strong> {ownerName}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="topic-config">
                                    <ul className="flex-row">
                                      <li className="mr-2">
                                        {iconMappings.priority[topic.priority.toLowerCase()] || iconMappings.priority.normal} {topic.priority}  
                                      </li>
                                      <li className="mr-2">
                                        {iconMappings.status[topic.status.toLowerCase()] || iconMappings.status.new} {topic.status}    
                                      </li>
                                      <li className="mr-2">
                                        {iconMappings.type[topic.type.toLowerCase()] || iconMappings.type.undefined} {topic.type}    
                                      </li>
                                      <li className="mr-2">
                                        {iconMappings.deadline}  {topic.topicDue}  
                                      </li>
                                    </ul>
                                  </div>
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
export default ProjectTopics;
