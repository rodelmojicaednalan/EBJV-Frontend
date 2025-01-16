import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
// import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import Select from 'react-select';
// import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";
import '../ProjectStyles.css'
import { FaBookmark, FaCircleInfo  } from "react-icons/fa6";
import { FaRegCalendar, FaCaretDown, FaListAlt, FaTrash  } from "react-icons/fa";
import { GrStatusGoodSmall, GrSort } from "react-icons/gr";
import { RiEdit2Fill } from "react-icons/ri";
import { BiSolidCommentAdd } from "react-icons/bi";
import { MdCompress, MdExpand} from "react-icons/md";
import { GoAlertFill } from "react-icons/go";
import { TbSortAscending2, TbSortDescending2 } from "react-icons/tb";

import ProjectSidebar from '../ProjectFolderSidebar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import SidebarOffcanvas from '../MobileSidebar';
import useWindowWidth from './windowWidthHook.jsx'

import { sortSelect, prioSelect, statusSelect, typeSelect} from '../ProjectFolderPages/ProjectSettingsPages/dummyTopicSettings';

import { ToastContainer, Toast } from 'react-bootstrap';

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

  // const [menuOpen, setMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 

  const [showCanvas, setShowCanvas] = useState(false);

  const [isCompressed, setIsCompressed] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [isSorted, setIsSorted] = useState('modifiedOn');
  const [sortDirection, setSortDirection] = useState('asc');

  const [availableEmails, setAvailableEmails] = useState([]);
  const [recipients, setRecipients] = useState([])

  // const handleMenuToggle = () => {
  //   setMenuOpen(!menuOpen);
  // };

  // const handleMenuOptionClick = (option) => {
  //   setMenuOpen(false);
  //   Swal.fire(`Function to: ${option}`);
  // };

  const handleCloseCanvas = () => setShowCanvas(false);
  const handleShowCanvas = () => setShowCanvas(true);

    // Custom toast messages
  const [toastPosition, setToastPosition] = useState('bottom-end')
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showDeleteSuccessToast, setShowDeleteSuccessToast] = useState(false);
  const [showDeleteErrorToast, setShowDeleteErrorToast] = useState(false);  
  
  const openSuccessToast = () => setShowSuccessToast(!showSuccessToast);
  const openErrorToast = () => setShowErrorToast(!showErrorToast);
  const openDeleteSuccessToast = () => setShowDeleteSuccessToast(!showDeleteSuccessToast);
  const openDeleteErrorToast = () => setShowDeleteErrorToast(!showDeleteErrorToast); 

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

    const fetchAvailableUsers = async () => {
      try {
        const [currentUserResponse,projectResponse, usersResponse] = await Promise.all([
          axiosInstance.get(`/user`),
          axiosInstance.get(`/project-contributors/${projectId}`),
          axiosInstance.get(`/users`),
        ]);

        const currentUser = currentUserResponse.data;
        const { contributors } = projectResponse.data;
        const users = usersResponse.data;

        const contributorEmails = contributors.map((contributor) => contributor.email);

        const formattedToAdd = users
          .filter((user) => 
          user.email !== currentUser.email && // Exclude current user
          contributorEmails.includes(user.email) 
          )
          .map((user) => ({
            label: `${user.first_name} ${user.last_name} (${user.email})`, // Label for dropdown
            value: user.email, // Value for dropdown
          }));
  
          setAvailableEmails(formattedToAdd);

      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    
    fetchAvailableUsers();
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
    topicData.assigneeList = recipients.map((recipient) => recipient.value);
  
    try {
      await axiosInstance.post(`/create-topic/${projectId}`, topicData);
      openSuccessToast();
      setShowCanvas(false);
      setRefreshKey((prevKey) => prevKey + 1);
    } catch (error) {
      openErrorToast();
    }
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
                    <div className="add-files-menu-container">
                     <button
                       id="addFiles-btn"
                       className="btn addFiles-btn btn-primary"
                       title="Add"
                       onClick= {handleShowCanvas}
                     >
                      <BiSolidCommentAdd/> 
                     </button>
                    </div>
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
                              <Select
                              className="basic-single"
                              classNamePrefix="select"
                              defaultValue={sortSelect[0]}
                              name="sortSelect"
                              options={sortSelect}
                              id="topic-sort"
                              onChange={(selectedOption) => handleSort(selectedOption.value)}
                              required
                              />
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
                              <Select
                                id="assignedTo"
                                options={availableEmails}
                                isMulti
                                onChange={(selectedOptions) => setRecipients(selectedOptions)}
                                name="assigneeList"
                                className="basic-multi-select"
                                classNamePrefix="select"
                              />
                            </div>
                            <div className="form-group mb-3">
                            <label htmlFor="topicPrio-ocform-dropdown">Priority</label>
                            <Select
                              className="basic-single"
                              classNamePrefix="select"
                              defaultValue={prioSelect[0]}
                              name="topicPrio"
                              options={prioSelect}
                              id="topicPrio-ocform-dropdown"
                              required
                            />
                            </div>
                            <div className="form-group mb-3">
                            <label htmlFor="topicStatus-ocform-dropdown">Status</label>
                            <Select
                              className="basic-single"
                              classNamePrefix="select"
                              defaultValue={statusSelect[0]}
                              name="topicStatus"
                              options={statusSelect}
                              id="topicStatus-ocform-dropdown"
                              required
                            />
                            </div>
                            <div className="form-group mb-3">
                            <label htmlFor="topicType-ocform-dropdown">Type</label>
                            <Select
                              className="basic-single"
                              classNamePrefix="select"
                              defaultValue={typeSelect[0]}
                              name="topicType"
                              options={typeSelect}
                              id="topicType-ocform-dropdown"
                              required
                            />
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
                                    <div className="d-flex justify-content-between">
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
                                    <ul className="flex-row" id="topic-card-btn-grp">
                                       <li>
                                        <button className="btn btn-sm "> <RiEdit2Fill size={14}/> </button>
                                      </li>
                                      <li>
                                        <button className="btn btn-sm "> <FaTrash size={14}/> </button>
                                      </li>
                                    </ul>
                                    </div>
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

          {/* Create Topic Messages */}
        <ToastContainer className="p-3" position={toastPosition}>
          <Toast className="success-toast-container" show={showSuccessToast} onClose={openSuccessToast} delay={5000} autohide>
            <Toast.Header className='success-toast-header justify-content-between'>
           <span> Project Topic Created Successfully! </span>   
            </Toast.Header>
            <Toast.Body className="success-toast-body">
              Review the details, share with your team, and proceed with the discussion on the topic.
            </Toast.Body>
          </Toast>
        </ToastContainer>

        <ToastContainer className="p-3" position={toastPosition}>
          <Toast className="error-toast-container" show={showErrorToast} onClose={openErrorToast} delay={5000} autohide>
            <Toast.Header className='error-toast-header justify-content-between'>
            <span> Topic Creation Unsuccessful </span>
            </Toast.Header>
            <Toast.Body className="error-toast-body">
              Please review the error details, check your configurations, and try again.
            </Toast.Body>
          </Toast>
        </ToastContainer>
          {/* End of Create Topic Messages */}

          {/* Delete Toast Messages */}
        <ToastContainer className="p-3" position={toastPosition}>
          <Toast className="success-toast-container" show={showDeleteSuccessToast} onClose={openDeleteSuccessToast} delay={5000} autohide>
            <Toast.Header className='success-toast-header justify-content-between'>
              <span > Topic Deleted Successfully! </span>
            </Toast.Header>
            <Toast.Body className="success-toast-body">
            The changes have been applied, and the topic is no longer available.
            </Toast.Body>
          </Toast> 
        </ToastContainer>

        <ToastContainer className="p-3" position={toastPosition}>
        <Toast className="error-toast-container" show={showDeleteErrorToast} onClose={openDeleteErrorToast} delay={5000} autohide>
          <Toast.Header className='error-toast-header justify-content-between'>
            <span > Topic Deletion Unsuccessful </span>
          </Toast.Header>
          <Toast.Body className="error-toast-body">
            Please review the error details, check your configurations, and try again.
          </Toast.Body>
        </Toast>
        </ToastContainer>
          {/* End of Delete Toast Messages */}

      </div>
      </div>
      );
    }
export default ProjectTopics;
