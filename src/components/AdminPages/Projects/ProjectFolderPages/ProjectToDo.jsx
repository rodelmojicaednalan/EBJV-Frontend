import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";
import { AuthContext } from "../../../Authentication/authContext";
import upload_icon from "../../../../assets/images/uploading.png";
import DataTable from "react-data-table-component";

import '../ProjectStyles.css'
import { FiChevronLeft, FiEdit, FiMoreVertical } from "react-icons/fi";
import { FaRegCalendar, FaCaretDown, FaListAlt  } from "react-icons/fa";
import { BiDotsVertical } from "react-icons/bi"
import { FaBookmark, FaCircleInfo  } from "react-icons/fa6";
import { GrStatusGoodSmall, GrSort } from "react-icons/gr";
import { GoAlertFill } from "react-icons/go";


import ProjectSidebar from '../ProjectFolderSidebar';

function ProjectToDo() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [existingFiles, setExistingFiles] = useState([]); // Existing assignees
  const [error, setError] = useState("");
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
        const { project_name, user } = response.data;
        const parsedFiles = JSON.parse(response.data.project_assignee)

        setProjectName(project_name);
        setOwnerName(`${user.first_name} ${user.last_name}`)
        setExistingFiles(parsedFiles); 
        // Assuming `project_assignees` is an array of assignee objects
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const sampleFilters = [
    {
      type: "Owner",
      options: ["Created by Me", "Shared with Me",],
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
      type: "Status",
      options: ["New", "In Progress", "Pending", "Done", "Closed"],
    },
    {
      type: "Priority",
      options: ["Low", "Normal", "High", "Critical"],
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

  const sampleData = [
    {
      id: 1,
      name: "Review Architecural Design",
      assignee: "Earvin Johnson",
      createdOn: "Dec 02, 2024",
      modifiedOn: "Dec 08, 2024",
      priority: "Critical",
      status: "In Progress",
      icons: {
        priorityIcon: <FaBookmark style={{ color: "red" }} />,
        statusIcon: <GrStatusGoodSmall style={{ color: "blue" }} />,
      },
    },
    {
      id: 2,
      name: "Polish House Frame",
      assignee: "Larry Bird",
      createdOn: "Nov 05, 2024",
      modifiedOn: "Dec 06, 2024",
      priority: "Normal",
      status: "Done",
      icons: {
        priorityIcon: <FaBookmark style={{ color: "royalBlue" }} />,
        statusIcon: <GrStatusGoodSmall style={{ color: "green" }} />,
      },
    },
    {
      id: 3,
      name: "Garage Design",
      assignee: "Michael Jordan",
      createdOn: "Dec 10, 2024",
      modifiedOn: "Dec 11, 2024",
      priority: "High",
      status: "New",
      icons: {
        priorityIcon: <FaBookmark style={{ color: "gold" }} />,
        statusIcon: <GrStatusGoodSmall style={{ color: "royalBlue" }} />,
      },
    },
    {
      id: 4,
      name: "Review Barn Design",
      assignee: "Hakeem Olajuwon",
      createdOn: "Dec 06, 2024",
      modifiedOn: "Dec 07, 2024",
      priority: "Low",
      status: "Waiting",
      icons: {
        priorityIcon: <FaBookmark style={{ color: "green" }} />,
        statusIcon: <GrStatusGoodSmall style={{ color: "gold" }} />,
      },
    },
    {
      id: 5,
      name: "Review Warehouse Structure",
      assignee: "Charles Barkley",
      createdOn: "Dec 05, 2024",
      modifiedOn: "Dec 09, 2024",
      priority: "Normal",
      status: "Closed",
      icons: {
        priorityIcon: <FaBookmark style={{ color: "royalBlue" }} />,
        statusIcon: <GrStatusGoodSmall style={{ color: "grey" }} />,
      },
    },
  ];

  // Define columns for the table
  const sampleColumns = [
    {
      name: "Title",
      width: "25%",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Assignee",
      width: "20%",
      selector: (row) => row.assignee,
      sortable: true,
    },
    {
      name: "Created On",
      selector: (row) => row.createdOn,
      sortable: true,
    },
    {
      name: "Modified On",
      selector: (row) => row.modifiedOn,
      sortable: true,
    },
    {
      name: "Priority",
      selector: (row) => (
        <div className="d-flex align-items-center">
          {row.icons.priorityIcon}
          <span className="ms-2">{row.priority}</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (
        <div className="d-flex align-items-center">
          {row.icons.statusIcon}
          <span className="ms-2">{row.status}</span>
        </div>
      ),
      sortable: true,
    },
  ];

  const handleAddNewToDo = () => {
    Swal.fire({
      title: 'Add New To Do',
      html: `
        <div style="text-align: left;">
          <label for="todo-title" style="display: block;">Title: </label>
          <input type="text" id="todo-title" class="swal2-input" placeholder="Enter title" style="margin-bottom: 10px; width: 100%; ">
          
          <label for="todo-desc" style="display: flex;">Description</label>
          <input type="text" id="todo-desc" class="swal2-input" placeholder="Enter description" style="margin-bottom: 10px; width: 100%;">
          
          <label for="todo-assignee" style="display: block;">Assignee</label>
          <input type="text" id="todo-assignee" class="swal2-input" placeholder="Select people (comma-separated)" style="width: 100%;">
        </div>
      `,
      confirmButtonText: 'Add Release',
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success todo-btn-success",
        cancelButton: "btn btn-danger todo-btn-danger"
      },
      preConfirm: () => {
        const todoTitle = document.getElementById('todo-title').value;
        const todoDesc = document.getElementById('todo-desc').value;
        const todoAssignee = document.getElementById('todo-assignee').value;
  
        if (!todoTitle || !todoDesc || !todoAssignee) {
          Swal.showValidationMessage('Please fill in all fields.');
          return null;
        }
  
        return { todoTitle, todoDesc, todoAssignee };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { todoTitle, todoDesc, todoAssignee } = result.value;
  
        // Handle adding the new release (e.g., API call)
        console.log('New To Do:', { todoTitle, todoDesc, todoAssignee });
        Swal.fire('Success!', 'The new to do has been added.', 'success');
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
                              <div className="dropdown-menu" id="toDo-dropdown">
                                <div
                                  className="dropdown-item"
                                  
                                  onClick={() => handleMenuOptionClick("Export To Do")}
                                >
                                  Export to Excel
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
                      <DataTable
                        className="dataTables_wrapperz mt-3"
                        columns={sampleColumns}
                        data={sampleData}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 20, 30]}
                        paginationComponentOptions={{
                          rowsPerPageText: 'Views displayed:',
                          rangeSeparatorText: 'out of',
                          noRowsPerPage: true, // Hide the rows per page dropdown
                        }}
                        responsive
                      />

                      </div>
                    </div>
                </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectToDo;
