import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import StickyHeader from "../../../SideBar/StickyHeader";
import DataTable from "react-data-table-component";

import '../ProjectStyles.css'
import { FaBookmark, FaCircleInfo  } from "react-icons/fa6";
import { FaRegCalendar, FaCaretDown, FaListAlt  } from "react-icons/fa";
import { GrStatusGoodSmall } from "react-icons/gr";
import { RiEdit2Fill } from "react-icons/ri";
import { BiDotsVertical } from "react-icons/bi";
import { GoAlertFill } from "react-icons/go";
import { FaClipboardQuestion } from "react-icons/fa6";

import ProjectSidebar from '../ProjectFolderSidebar';

function ProjectToDo() {
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
          ownership: toDo.is_owner,
          ownerUserName: toDo.owner,
          assignee: toDo.toDoAssignee.replace(/"/g, " "),
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
          status: capitalizeWords(toDo.toDoStatus)
        }));

        setToDoData(formattedToDos)
        setFilteredToDoData(formattedToDos);
        console.log(toDoData);
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    const fetchGroupsandUsers = async () => {
      try {
        const [projectResponse, usersResponse] = await Promise.all([
          axiosInstance.get(`/project-contributors/${projectId}`),
          axiosInstance.get(`/users`),
        ]);

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
          console.log(userOptions)
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
      width: "25%",
      selector: (row) => row.title,
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
          {iconMappings.priority[row.priority.toLowerCase()] || (
            <FaBookmark style={{ color: "gray" }} />
          )}
          <span className="ms-2">{row.priority}</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (
        <div className="d-flex align-items-center">
          {iconMappings.statusIcon[row.status.toLowerCase()] || (
            <GrStatusGoodSmall style={{ color: "gray" }} />
          )}
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
            <div style="text-align: left; max-height: 550px; overflow-y: auto;">
                <label for="todo-title" style="display: block;">Title:</label>
                <input type="text" id="todo-title" class="swal2-input" placeholder="Enter title" style="margin-bottom: 10px; width: 100%;">

                <label for="todo-desc" style="display: block;">Description:</label>
                <input type="text" id="todo-desc" class="swal2-input" placeholder="Enter description" style="margin-bottom: 10px; width: 100%;">

                <label for="todo-assignee" style="display: block;">Assignee:</label>
                <input type="text" id="todo-assignee" class="swal2-input" placeholder="Select people (comma-separated)" style="margin-bottom: 10px; width: 100%;">

                <div id="details-container" style="margin-top: 10px;">
                    <button id="add-details-btn" type="button" class="btn btn-primary" style="margin-bottom: 10px;">Add Additional Details</button>
                </div>
            </div>
        `,
        confirmButtonText: 'Add To Do',
        showCancelButton: true,
        customClass: {
            confirmButton: "btn btn-success todo-btn-success",
            cancelButton: "btn btn-danger todo-btn-danger"
        },
        didOpen: () => {
            const addDetailsBtn = document.getElementById('add-details-btn');
            const detailsContainer = document.getElementById('details-container');

            addDetailsBtn.addEventListener('click', () => {
                if (!document.getElementById('todo-priority')) {
                    // Priority Field
                    const priorityLabel = document.createElement('label');
                    priorityLabel.setAttribute('for', 'todo-priority');
                    priorityLabel.style.display = 'block';
                    priorityLabel.textContent = 'Priority:';

                    const prioritySelect = document.createElement('select');
                    prioritySelect.id = 'todo-priority';
                    prioritySelect.className = 'swal2-input';
                    ['Critical', 'High', 'Normal', 'Low'].forEach(priority => {
                        const option = document.createElement('option');
                        option.value = priority.toLowerCase();
                        option.textContent = priority;
                        prioritySelect.appendChild(option);
                    });

                    // Due Date Field
                    const dueDateLabel = document.createElement('label');
                    dueDateLabel.setAttribute('for', 'todo-due-date');
                    dueDateLabel.style.display = 'block';
                    dueDateLabel.textContent = 'Due Date:';

                    const dueDateInput = document.createElement('input');
                    dueDateInput.type = 'date';
                    dueDateInput.id = 'todo-due-date';
                    dueDateInput.className = 'swal2-input';

                    // To-Do Type Field
                    const typeLabel = document.createElement('label');
                    typeLabel.setAttribute('for', 'todo-type');
                    typeLabel.style.display = 'block';
                    typeLabel.textContent = 'To-Do Type:';

                    const typeSelect = document.createElement('select');
                    typeSelect.id = 'todo-type';
                    typeSelect.className = 'swal2-input';
                    ["Undefined", "Comment", "Issue", "Request", "Fault", 
                      "Inquiry", "Solution", "Remark", "Clash"].forEach(type => {
                        const option = document.createElement('option');
                        option.value = type.toLowerCase();
                        option.textContent = type;
                        typeSelect.appendChild(option);
                    });
                    typeSelect.style.width = "96%";

                    // Wrapper Div for Priority and Due Date
                    const wrapperDiv = document.createElement('div');
                    wrapperDiv.style.display = 'flex';
                    wrapperDiv.style.justifyContent = 'space-between';
                    wrapperDiv.style.gap = '10px';
                    wrapperDiv.style.marginBottom = '10px';

                    const priorityWrapper = document.createElement('div');
                    priorityWrapper.style.flex = '1';
                    priorityWrapper.appendChild(priorityLabel);
                    priorityWrapper.appendChild(prioritySelect);

                    const dueDateWrapper = document.createElement('div');
                    dueDateWrapper.style.flex = '1';
                    dueDateWrapper.appendChild(dueDateLabel);
                    dueDateWrapper.appendChild(dueDateInput);

                    wrapperDiv.appendChild(priorityWrapper);
                    wrapperDiv.appendChild(dueDateWrapper);

                    // Append Fields to Details Container
                    detailsContainer.appendChild(wrapperDiv);
                    detailsContainer.appendChild(typeLabel);
                    detailsContainer.appendChild(typeSelect);

                    addDetailsBtn.disabled = true; // Disable button after fields are added
                }
            });
        },
        preConfirm: () => {
            const todoTitle = document.getElementById('todo-title').value.trim();
            const todoDesc = document.getElementById('todo-desc').value.trim();
            const todoAssignee = document.getElementById('todo-assignee').value.trim();
            const todoPriority = document.getElementById('todo-priority')?.value || null;
            const todoDueDate = document.getElementById('todo-due-date')?.value || null;
            const todoType = document.getElementById('todo-type')?.value || null;

            if (!todoTitle || !todoDesc || !todoAssignee) {
                Swal.showValidationMessage('Please fill in all required fields.');
                return null;
            }

            return { todoTitle, todoDesc, todoAssignee, todoPriority, todoDueDate, todoType };
        },
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { todoTitle, todoDesc, todoAssignee, todoPriority, todoDueDate, todoType } = result.value;

            try {
                await axiosInstance.post(`/create-todo/${projectId}`, {
                    todoTitle,
                    todoDesc,
                    todoAssignee,
                    todoPriority,
                    todoDueDate,
                    todoType,
                });
                Swal.fire('Success!', 'The to-do has been added.', 'success');
                setRefreshKey((prevKey) => prevKey + 1);
            } catch (error) {
                Swal.fire('Error!', 'Failed to add to-do. Try again.', 'error');
                console.error(error);
            }
        }
    });
};



    return (
    <div className="container">
      <StickyHeader />
      <h3 className="title-page" id="projectFolder-title">
        {ownerName}&apos;s {projectName} 
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
                              {filters.map((filter) => (
                                  <div key={filter.type} className="filter-type mr-n1" onClick={() => setActiveDropdown(filter.type)}>
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
                            No to do's found.
                          </div>
                        </div>
                        }
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
