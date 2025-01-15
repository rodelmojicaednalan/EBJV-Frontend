import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import StickyHeader from "../../../SideBar/StickyHeader";
import DataTable from "react-data-table-component";
import { CSVLink } from 'react-csv'

import '../ProjectStyles.css'
import { FaBookmark, FaCircleInfo, FaClipboardQuestion  } from "react-icons/fa6";
import { FaRegCalendar, FaCaretDown, FaListAlt, FaFileExcel, FaTrash, FaFile  } from "react-icons/fa";
import { GrStatusGoodSmall } from "react-icons/gr";
import { RiEdit2Fill } from "react-icons/ri";
import { BiDotsVertical, BiSolidEditAlt } from "react-icons/bi";
import { LiaTimesSolid } from "react-icons/lia";
import { GoAlertFill } from "react-icons/go";
import { BsClipboard2PlusFill } from "react-icons/bs";

import ProjectSidebar from '../ProjectFolderSidebar';
import SidebarOffcanvas from '../MobileSidebar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import useWindowWidth from './windowWidthHook.jsx'

import { Modal, Button, ToastContainer, Toast } from 'react-bootstrap';
import Select from 'react-select';
import { prioSelect, statusSelect, typeSelect} from '../ProjectFolderPages/ProjectSettingsPages/dummyTopicSettings';

function ProjectToDo() {
  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")

  const [toDoData, setToDoData] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 

  const [availableUsers, setAvailableUsers] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [projectGroups, setProjectGroups] = useState([]);
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
    
  const [filteredToDoData, setFilteredToDoData] = useState([]);
  const filterRef = useRef(null);

  const [availableEmails, setAvailableEmails] = useState([]);
  const [showAddTodoModal, setShowAddTodoModal] = useState(false);
  const [todoTitle, setTodoTitle] = useState("");
  const [todoDesc, setTodoDesc] = useState("");
  const [todoAssignee, setTodoAssignee] = useState([]);
  const [isAddMoreDetails, setIsAddMoreDetails] = useState(false);
  const [todoPriority, setTodoPriority] = useState("");
  const [todoDueDate, setTodoDueDate] = useState("");
  const [todoType, setTodoType] = useState("");
  
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

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuOptionClick = (option) => {
    setMenuOpen(false);
    Swal.fire(`Function to: ${option}`);
  };

  const toggleDropdown = (id) => {
    console.log("Toggling dropdown for ID:", id);
    setOpenDropdownId(openDropdownId === id ? null : id);
  };
//  Row Click Related Variables
    const [showCanvas, setShowCanvas] = useState(false);
    const handleCloseCanvas = () => setShowCanvas(false);
    const handleShowCanvas = () => setShowCanvas(true);
  
    const [selectedRow, setSelectedRow] = useState(null); // State to hold the selected row details
  
  // Handle row click
    const handleRowClick = (row) => {
      setSelectedRow(row); // Set the clicked row's data
      handleShowCanvas(); // Show the Offcanvas
    };

// Menu ref
const todoMenuRef = useRef(null);

useEffect(() => {
  const handleOutsideClick = (event) => {
    if (todoMenuRef.current && !todoMenuRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };

  document.addEventListener("mousedown", handleOutsideClick);
  return () => {
    document.removeEventListener("mousedown", handleOutsideClick);
  };
}, []);
  
  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project-toDo/${projectId}`);
        const { project_name, owner, project_toDos } = response.data;

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

        const formattedToDos = project_toDos.map((toDo) => ({
          id: toDo.id,
          title: toDo.toDoTitle,
          description: toDo.toDoDesc,
          ownership: toDo.is_owner,
          ownerUserName: toDo.owner,
          assignee: JSON.parse(toDo.toDoAssignee), //.replace(/"/g, " ", /[]]/g, " "),
          createdOn: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }).format(new Date(toDo.dateCreated)),
          modifiedOn: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }).format(new Date(toDo.lastUpdated)),
          priority: capitalizeWords(toDo.toDoPriority),
          status: capitalizeWords(toDo.toDoStatus),
          type: capitalizeWords(toDo.toDoType)
        }));

        setToDoData(formattedToDos)
        setFilteredToDoData(formattedToDos);
        // console.log(toDoData);
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    const fetchGroupsandUsers = async () => {
      try {
        const [currentUserResponse, projectResponse, usersResponse] = await Promise.all([
          axiosInstance.get(`/user`),
          axiosInstance.get(`/project-contributors/${projectId}`),
          axiosInstance.get(`/users`),
        ]);
        
        const currentUser = currentUserResponse.data;
        const { contributors, groups } = projectResponse.data;
        const users = usersResponse.data;

        const contributorEmails = contributors.map((contributor) => contributor.email);
        const projectGroups = groups.map((group) => group.group_name);

        const formattedUsers = users
          .filter((user) => contributorEmails.includes(user.email))
          .map((user) => ({
            label: `${user.first_name} ${user.last_name}`,
            value: user.email,
          }));

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

        setProjectGroups(projectGroups);
        setAvailableUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchProjectDetails();
    fetchGroupsandUsers();
    }, [projectId, refreshKey]);

      useEffect(() => {
        const generateFilters = () => {
          const ownershipOptions = ["Created by Me", "Shared with Me"];
          const userOptions = availableUsers.map((user) => user.label);
          // console.log(userOptions)
          const groupOptions = projectGroups;
          const statusOptions = ["New", "In Progress", "Pending", "Done", "Closed"];
          const priorityOptions = ["Low", "Normal", "High", "Critical"];
          const dateModifiedOptions = ["Today", "This Week", "Last Month"];
    
          const filters = [
            { type: "Owner", options: ownershipOptions },
            { type: "Users", options: userOptions },
            { type: "Groups", options: groupOptions },
            { type: "Status", options: statusOptions },
            { type: "Priority", options: priorityOptions },
            { type: "Date Modified", options: dateModifiedOptions },
          ];
    
          setFilters(filters);
        };
    
        generateFilters();
      }, [toDoData, availableUsers, projectGroups]);

  useEffect(() => {
    let filteredData = [...toDoData];
  
    Object.keys(selectedFilters).forEach((filterType) => {
      const selectedOptions = selectedFilters[filterType];
      if (selectedOptions.length > 0) {
        filteredData = filteredData.filter((todo) => {
          switch (filterType) {
            case "Owner":
              return selectedOptions.includes(todo.ownership ? "Created by Me" : "Shared with Me");
            case "Users":
              return selectedOptions.includes(todo.ownerUserName);
            case "Groups":
              return selectedOptions.includes(todo.group);
            case "Status":
              return selectedOptions.includes(todo.status);
            case "Priority":
              return selectedOptions.includes(todo.priority);
            case "Date Modified":
              { const dueDate = new Date(todo.modifiedOn);
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
  
    setFilteredToDoData(filteredData);
  }, [selectedFilters, toDoData]);

  
    const handleCheckboxChange = (filterType, option) => {
      setSelectedFilters((prevFilters) => ({
        ...prevFilters,
        [filterType]: prevFilters[filterType]?.includes(option)
          ? prevFilters[filterType].filter((item) => item !== option)
          : [...(prevFilters[filterType] || []), option],
      }));
    };
  
    // Render dropdown options
    const renderDropdown = (filter) => (
      <div className="filter-dropdown" ref={filterRef}>
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
        if (filterRef.current && !filterRef.current.contains(event.target)) {
          setActiveDropdown(null);
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
    statusIcon: {
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


  // Define columns for the table
  const toDoTableColumns = [
    {
      name: "Title",
      key: 'title',
      // width: "25%",
      selector: (row) => row.title,
      // selector: (row) => (
      //   <div style={{ display: "flex", alignItems: "center" }}>      
      //     <div className="user-details">
      //       <span>
      //         {" "}
      //         {row.title}
      //       </span>
      //       <span className="user-email-row" id="todo-table-desc">{row.description}</span>
      //     </div>
      //   </div>
      // ),
      sortable: true,
    },
    {
      name: "Assignee",
      key: 'assignee',
      // width: "20%",
      selector: (row) => row.assignee,
      sortable: true,
    },
    {
      name: "Created On",
      key: 'createdOn',
      selector: (row) => row.createdOn,
      sortable: true,
      hide:'sm'
    },
    {
      name: "Modified On",
      key: 'modifiedOn',
      selector: (row) => row.modifiedOn,
      sortable: true,
      hide: 'md'
    },
    {
      name: "Priority",
      key: 'priority',
      selector: (row) => (
        <div className="d-flex align-items-center">
          {iconMappings.priority[row.priority.toLowerCase()] || (
            <FaBookmark style={{ color: "gray" }} />
          )}
          <span className="ms-2">{row.priority}</span>
        </div>
      ),
      sortable: true,
      hide: 'sm'
    },
    {
      name: "Status",
      key: 'status',
      selector: (row) => (
        <div className="d-flex align-items-center">
          {iconMappings.statusIcon[row.status.toLowerCase()] || (
            <GrStatusGoodSmall style={{ color: "gray" }} />
          )}
          <span className="ms-2">{row.status}</span>
        </div>
      ),
      sortable: true,
      hide:'sm'
    },
  ];

  
  const handleExportToCSV = () => {
    // Filter out the checkbox column (no selector property)
    const filteredColumns = toDoTableColumns.filter((col) => col.selector);
    // Extract headers
    const headers = filteredColumns.map((col) => ({ label: col.name, key: col.key }));
    // Map data rows based on filtered columns
    const data = toDoData.map((row) =>
    Object.fromEntries(
      filteredColumns.map((col) => [col.key, col.selector(row)]) // Extract values dynamically
    )
  );
    return { headers, data };
  };


  const handleAddNewToDo = async () => {
    if (!todoTitle || !todoPriority || !todoDueDate || !todoType || todoAssignee.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }

    const assigneeList = todoAssignee.map((assignee) => assignee.value);

    try {
      await axiosInstance.post(`/create-todo/${projectId}`, {
        todoTitle,
        todoDesc,
        todoAssignee: assigneeList,
        todoPriority,
        todoDueDate,
        todoType,
      });
      openSuccessToast();
      setRefreshKey((prevKey) => prevKey + 1);
      handleClose();
    } catch (error) {
      console.error(error);
      openErrorToast();
    }
  };

  const handleClose = () => {
    setShowAddTodoModal(false);
    setTodoTitle("");
    setTodoDesc("")
    setTodoAssignee([])
    setIsAddMoreDetails(false);
    setTodoPriority("")
    setTodoDueDate("")
    setTodoType("")
    setIsAddMoreDetails(false)
  };

  const handleShow = () => setShowAddTodoModal(true);

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
              onClick={handleShow}
            >
              <BsClipboard2PlusFill/> 
            </button>
            </div>
                      <div className="project-content">

                      <div className="table-header d-flex justify-content-between align-items-center mb-3">
                        <div className="page-title">
                          <h2>To Do List</h2>
                        </div>
                        <div className="button-group d-flex">
                        <div className="menu-btn-container position-relative">
                            <button
                              className="btn btn-icon menu-btn"
                              title="Menu"
                              onClick={handleMenuToggle}
                            >
                              <BiDotsVertical />
                            </button>
                            {menuOpen && (
                              <div className="dropdown-menu" id="toDo-dropdown"  ref={todoMenuRef}>
                                <div className="dropdown-item">
                                  <CSVLink
                                      {...handleExportToCSV()}
                                      filename={`${ownerName}'s ${projectName}_To-Do-List.csv`}
                                      className="exportToCSV"
                                      target="_blank"
                                    >
                                      Export to CSV
                                  </CSVLink>
                                </div>
                                <div
                                  className="dropdown-item"
                                  onClick={() => handleMenuOptionClick("Import To Do")}
                                >
                                  Import from Excel 
                                </div>
                              </div>
                            )}
                          </div>
                          <button id="addbtn"className="btn btn-primary add-btn" title="Add New Release" onClick={handleAddNewToDo}>
                              New
                          </button>
                        </div>
                      </div>
                      <div className="view-filters">
                          <div className="filter-container null">
                            <div className="filters d-flex" id="todo-filters">
                              {filters.map((filter) => (
                                  <div key={filter.type} id="todo-filter-item" className="filter-type mr-n1" onClick={() => setActiveDropdown(filter.type)}>
                                      {filter.type} <FaCaretDown />
                                      {activeDropdown === filter.type && renderDropdown(filter)}
                                  </div>
                              ))}
                            </div>
                          </div>
                      </div> 
                      <DataTable
                        className="dataTables_wrapperz mt-3"
                        columns={toDoTableColumns}
                        data={filteredToDoData}
                        onRowClicked={handleRowClick}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 20, 30]}
                        paginationComponentOptions={{
                          rowsPerPageText: 'Views displayed:',
                          rangeSeparatorText: 'out of',
                          noRowsPerPage: true, // Hide the rows per page dropdown
                        }}
                        responsive
                        noDataComponent={
                        <div className="noData mt-4">
                          <div className="circle">
                            <FaClipboardQuestion size={65} color="#9a9a9c"/>
                          </div>
                          <div className="no-display-text mt-2">
                            No to dos found.
                          </div>
                        </div>
                        }
                      />

                      </div>
                    </div>
                </div>
        </div>
        <Modal id="releaseAddModal" show={showAddTodoModal} onHide={() => setShowAddTodoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New To Do</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-3">
          <div className="modal-form" style={{ marginBottom: "15px" }}>
          <label htmlFor="modal-todoTitle" style={{ marginBottom: "5px", display: "block" }}>
            Release Name:
          </label>
          <input
               type="text"
               id="modal-todoTitle"
               placeholder="Enter release name..."
               value={todoTitle}
               onChange={(e) => setTodoTitle(e.target.value)}
               required
          />
        </div>
        <div className="modal-form" style={{ marginBottom: "15px" }}>
          <label htmlFor="modal-todoDesc" style={{ marginBottom: "5px", display: "block" }}>
            Release Description:
          </label>
          <input
               type="text"
               id="modal-todoDesc"
               placeholder="Enter description..."
               value={todoDesc}
               onChange={(e) => setTodoDesc(e.target.value)}
               required
          />
        </div>


          <div className="modal-form" style={{ marginBottom: "15px" }}>
          <label htmlFor="recipients" style={{ marginBottom: "5px", display: "block" }}>
            Choose recipient(s):
          </label>
          <Select
            id="recipients"
            options={availableEmails}
            isMulti
            onChange={(selectedOptions) => setTodoAssignee(selectedOptions)}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>

        {isAddMoreDetails ? (
          <div id="details-container">
            <div className="prio-due-div d-flex justify-content-between gap-2">
              <div className="modal-form" style={{ marginBottom: "15px" }}>
                <label htmlFor="modal-todoPrio" style={{ marginBottom: "5px"}}>
                  Priority:
                </label>
                <Select
                  id="modal-todoPrio"
                  options={prioSelect}
                  onChange={(selectedOptions) => setTodoPriority(selectedOptions?.value || null)}
                  className="basic-single"
                  classNamePrefix="select"
                />
              </div>

              <div className="modal-form" style={{ marginBottom: "15px" }}>
                <label htmlFor="modal-todoDueDate" style={{ marginBottom: "5px"}}>
                  Due Date:
                </label>
                <input
                    type="date"
                    id="modal-todoDueDate"
                    value={todoDueDate}
                    onChange={(e) => setTodoDueDate(e.target.value)}
                    required
                />
              </div>
            </div>

            <div className="modal-form" style={{ marginBottom: "15px" }}>
                <label htmlFor="modal-todoType" style={{ marginBottom: "5px", display: "block" }}>
                  Type:
                </label>
                <Select
                  id="modal-todoType"
                  options={typeSelect}
                  onChange={(selectedOptions) => setTodoType(selectedOptions?.value || null)}
                  className="basic-single"
                  classNamePrefix="select"
                />
              </div>
            </div>
          ) : (
            <Button
                variant="text"
                onClick={() => setIsAddMoreDetails(true)}
                className="p-0"
              >
                Additional Details
              </Button>
            )}
            </div>
           
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="closeAdd"
            variant="secondary"
            onClick={handleClose}
          >
            Close
          </Button>
          <Button id="saveAdd" variant="primary" onClick={handleAddNewToDo}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

          {/* Create Topic Messages */}
              <ToastContainer className="p-3" position={toastPosition}>
                <Toast className="success-toast-container" show={showSuccessToast} onClose={openSuccessToast} delay={5000} autohide>
                  <Toast.Header className='success-toast-header justify-content-between'>
                 <span> To Do Created Successfully! </span>   
                  </Toast.Header>
                  <Toast.Body className="success-toast-body">
                    Review the details, share with your team, and proceed with the distribution of work.
                  </Toast.Body>
                </Toast>
              </ToastContainer>
      
              <ToastContainer className="p-3" position={toastPosition}>
                <Toast className="error-toast-container" show={showErrorToast} onClose={openErrorToast} delay={5000} autohide>
                  <Toast.Header className='error-toast-header justify-content-between'>
                  <span> To Do Creation Unsuccessful </span>
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
                    <span > To Do Deleted Successfully! </span>
                  </Toast.Header>
                  <Toast.Body className="success-toast-body">
                  The changes have been applied, and the to do item is no longer available.
                  </Toast.Body>
                </Toast> 
              </ToastContainer>
      
              <ToastContainer className="p-3" position={toastPosition}>
              <Toast className="error-toast-container" show={showDeleteErrorToast} onClose={openDeleteErrorToast} delay={5000} autohide>
                <Toast.Header className='error-toast-header justify-content-between'>
                  <span > To Do Deletion Unsuccessful </span>
                </Toast.Header>
                <Toast.Body className="error-toast-body">
                  Please review the error details, check your configurations, and try again.
                </Toast.Body>
              </Toast>
              </ToastContainer>
                {/* End of Delete Toast Messages */}


                {/* Row Click Offcanvas */}
                <Offcanvas 
                show={showCanvas} 
                onHide={handleCloseCanvas} 
                placement="end" 
                //backdrop="static"
                className="offcanvas"
                id="explorer-offcanvas"
              >
              <Offcanvas.Header className="offcanvas-head">
                <Offcanvas.Title>
                <div className="offcanvas-header d-flex justify-content-between align-items-center">
                <div className="offcanvas-title-description d-flex"
                  style={{flexDirection: 'column'}}>
                  <h5 className="offcanvas-title "
                    style={{fontSize: '1rem', fontWeight: 'bold', margin: '0'}}>
                    {selectedRow ? selectedRow.title : "To Do Title"}
                  </h5>
                </div>
                  <div className="offcanvas-button-group">
                    <button className="offcanvas-btn" title="Edit">
                      <BiSolidEditAlt size={18} />
                    </button>
                    <button
                      className="offcanvas-btn"
                      title="Close"
                      onClick={handleCloseCanvas}
                    >
                      <LiaTimesSolid size={18} />
                    </button>
                  </div>
                </div>
                </Offcanvas.Title>
              </Offcanvas.Header>
                <Offcanvas.Body className="offcanvas-body">
                <div className="offcanvas-button-group2 mb-3 flex-wrap">
                      <label htmlFor="buttons">  </label>
                      <button className="btn mr-1" ><FaFileExcel size={18}/></button>
                      <button className="btn mr-1" ><FaTrash size={18}/></button>

                  </div>
                {selectedRow && (
                  <div className="todo-details-container" style={{fontSize: "12px"}}>
                    <p><strong>Details: </strong></p>
                    <label style={{margin: "0", fontWeight: "300"}}>Description:</label>
                        <p>{selectedRow.description}</p>
                      <label style={{margin: "0", fontWeight: "300"}}>Assignee(s):</label>
                        <p>{selectedRow.assignee}</p>
                      <label style={{margin: "0", fontWeight: "300"}}>Date Created:</label>
                        <p>{selectedRow.createdOn} by {selectedRow.ownerUserName}</p>
                      <label style={{margin: "0", fontWeight: "300"}}>Last Modified:</label>
                        <p>{selectedRow.modifiedOn} by {selectedRow.ownerUserName}</p>
                        <label style={{margin: "0", fontWeight: "300"}}>Priority:</label>
                        <div className="d-flex align-items-center mb-3">
                          {iconMappings.priority[selectedRow.priority.toLowerCase()] || (
                            <FaBookmark style={{ color: "gray" }} />
                          )}
                          <span className="ms-2" style={{fontSize: ".85rem"}}>{selectedRow.priority}</span>
                        </div>
                        <label style={{margin: "0", fontWeight: "300"}}>Status:</label>
                        <div className="d-flex align-items-center mb-3">
                          {iconMappings.statusIcon[selectedRow.status.toLowerCase()] || (
                            <FaBookmark style={{ color: "gray" }} />
                          )}
                          <span className="ms-2" style={{fontSize: ".85rem"}}>{selectedRow.status}</span>
                        </div>
                        <label style={{margin: "0", fontWeight: "300"}}>Status:</label>
                        <div className="d-flex align-items-center mb-3">
                          {iconMappings.type[selectedRow.type.toLowerCase()] || (
                            <FaBookmark style={{ color: "gray" }} />
                          )}
                          <span className="ms-2" style={{fontSize: ".85rem"}}>{selectedRow.type}</span>
                        </div>
                  </div>
                )}
                  <div className="todo-attachments-container">
                    <label style={{margin: "0", fontWeight: "300"}}>Attachments:</label>
                    <div className="todo-attachments-list">
                      <div className="todo-attachment">
                        <FaFile size={18} />
                        <span className="ms-2">sample-attachment1.ifc</span>
                        <button className="btn btn-sm btn-outline-danger ml-2">Delete</button>
                      </div>
                      <div className="todo-attachment">
                        <FaFile size={18} />
                        <span className="ms-2">sampleAttachment2.nc1</span>
                        <button className="btn btn-sm btn-outline-danger ml-2">Delete</button>
                      </div>
                    </div>
                  </div>
                </Offcanvas.Body>
              </Offcanvas>
                {/* End of Row Click Offcanvas */}
      </div>
    </div>
  );
}

export default ProjectToDo;
