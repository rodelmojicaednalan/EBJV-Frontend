import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";
import '../ProjectStyles.css'
import { FaBookmark, FaCircleInfo  } from "react-icons/fa6";
import { FaRegCalendar, FaCaretDown, FaListAlt  } from "react-icons/fa";
import { GrStatusGoodSmall, GrSort } from "react-icons/gr";
import { RiEdit2Fill } from "react-icons/ri";
import { BiDotsVertical } from "react-icons/bi";
import { MdCompress, MdExpand  } from "react-icons/md";
import { GoAlertFill } from "react-icons/go";
import { TbSortAscending2, TbSortDescending2 } from "react-icons/tb";

import ProjectSidebar from '../ProjectFolderSidebar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import SidebarOffcanvas from '../MobileSidebar';
import useWindowWidth from './windowWidthHook.jsx'

function ProjectTopics() {
  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")

  const [topicData ,setTopicData] = useState([])

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filters, setFilters] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [filteredTopics, setFilteredTopics] = useState([]);  
  const dropdownRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 

  const [showCanvas, setShowCanvas] = useState(false);

  const [isCompressed, setIsCompressed] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [isSorted, setIsSorted] = useState('modifiedOn');
  const [sortDirection, setSortDirection] = useState('asc');

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
        const { project_name, owner, project_topics } = response.data;

        setProjectName(project_name);
        setOwnerName(`${owner.first_name} ${owner.last_name}`)

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
          creator: topic.topicCreator,
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

  const toggleDropdown = (id) => {
    console.log("Toggling dropdown for ID:", id);
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  useEffect(() => {
  const generateFilters = () => {
    const typeOptions = ["Undefined", "Comment", "Issue", "Request", "Fault", "Inquiry", "Solution", "Remark", "Clash"]; // Static mapping for ownership
    const prioOptions = ["Low", "Normal", "High", "Critical"]; // Use availableUsers
    const statusOptions = ["New", "In-progress", "Pending", "Closed", "Done"]; // Already formatted in `fetchAvailableUsers`
    const tagOptions = [""]; // Due date can remain static or dynamically computed
    
    const filters = [
      { type: "Type", options: typeOptions },
      { type: "Priority", options: prioOptions },
      { type: "Status", options: statusOptions },
      { type: "Tags", options: tagOptions },
    ];
    
    setFilters(filters); // Store the dynamic filters in state
  };
  generateFilters();
}, [ ]);


useEffect(() => {
    let filteredData = [...topicData];
  
    Object.keys(selectedFilters).forEach((filterType) => {
      const selectedOptions = selectedFilters[filterType];
      if (selectedOptions.length > 0) {
        filteredData = filteredData.filter((topic) => {
          switch (filterType) {
            case "Type":
              return selectedOptions.includes(topic.type);
            case "Priority":
              return selectedOptions.includes(topic.priority);
            case "Status":
              return selectedOptions.includes(topic.status);
            case "Tags":
              return selectedOptions.includes(topic.tags);
            default:
              return true;
          }
        });
      }
    });
  
    setFilteredTopics(filteredData);
  }, [selectedFilters, topicData]);
  
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
            text: error,
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

  const handleCompress = () => {
    setIsCompressed((prev) => !prev);
  }

  const handleSort = (criteria) => {
    setIsSorted(criteria);
    // setShowSortOptions(false);
  }

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

   const sortedTopics = [...filteredTopics].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;

    if (isSorted === 'modifiedOn') {
      return (new Date(a.modifiedOn) - new Date(b.modifiedOn)) * direction;
    }
    if (isSorted === 'name' || isSorted === 'assignee' || isSorted === 'creator') {
      return a[isSorted].localeCompare(b[isSorted]) * direction;
    }
    return 0;
  });

    return (
      <div className="container">
      <StickyHeader />
      <h3 className="title-page" id="projectFolder-title">
        {ownerName}&apos;s {projectName} 
      </h3>
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
                          <h2>Topics</h2>
                        </div>
                        <div className="button-group d-flex">
                          <button className="btn btn-icon grid-view-btn" title="Compress" onClick={handleCompress}>
                           {isCompressed ? <MdExpand/> :  <MdCompress /> }
                          </button>
                          <button className="btn btn-icon list-view-btn" title="Sort" onClick={() => setShowSortOptions((prev) => !prev)}>
                            <GrSort/>
                          </button>
                          {showSortOptions && (
                            <div className="sort-dropdown">
                              <select
                                onChange={(e) => handleSort(e.target.value)}
                                value={isSorted}
                                className="form-select"
                                id="topic-sort"
                              >
                                <option value="modifiedOn">Sort by Modified On</option>
                                <option value="name">Sort by Topic Title</option>
                                <option value="assignee">Sort by Assignee</option>
                                <option value="creator">Sort by Creator</option>
                              </select>
                              <button className="btn btn-icon ml-2" onClick={toggleSortDirection}>
                                {sortDirection === 'asc' ? <TbSortAscending2/> : <TbSortDescending2/>}
                              </button>
                            </div>
                          )}
                          {/* <div className="menu-btn-container position-relative">
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
                          </div> */}
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
                               {filters.map((filter) => (
                                  <div key={filter.type} className="filter-type mr-3 d-flex" onClick={() => setActiveDropdown(filter.type)}>
                                    {filter.type} <FaCaretDown />
                                    {activeDropdown === filter.type && renderDropdown(filter)}
                                  </div>
                                ))}
                            </div>
                          </div>
                      </div> 

                      <div className="topic-cards-box mt-2 d-flex">
                        {sortedTopics.map((topic) => (
                          <div key={topic.id}  className={`container-fluid topic-card ${isCompressed ? 'compressed' : ''}`}
                          style={{
                            marginTop: isCompressed ? '0' : '20px',
                          }}>
                            <div className="topic-time d-none d-md-flex ">
                              <span className="text-muted">{topic.modifiedOn}</span>
                            </div>
                            <div className="flex-row">
                              <div className="topic flex-1">
                                <div className="topic-title">{topic.name}</div>
                                <div className="row-distribute">
                                  <div className="topic-users flex-row">
                                    <div className="assignee">
                                      <p>
                                        <strong>Assigned to: </strong> {topic.assignee}
                                      </p>
                                    </div>
                                    <div className="creator">
                                      <p>
                                        <strong>Created by: </strong> {topic.creator}
                                      </p>
                                    </div>
                                  </div>
                                  {!isCompressed && (
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
                                  )}
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
