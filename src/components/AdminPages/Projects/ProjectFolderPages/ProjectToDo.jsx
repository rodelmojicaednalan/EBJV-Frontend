import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import StickyHeader from "../../../SideBar/StickyHeader";

import DataTable from "react-data-table-component";

import '../ProjectStyles.css'
import {  FaCaretDown  } from "react-icons/fa";
import { BiDotsVertical } from "react-icons/bi"



import ProjectSidebar from '../ProjectFolderSidebar';

function ProjectToDo() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")

  const [toDoData, setToDoData] = useState([]);
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
        const response = await axiosInstance.get(`/project-topics/${projectId}`);
        const { project_name, owner, project_toDos } = response.data;

        setProjectName(project_name);
        setOwnerName(`${owner.first_name} ${owner.last_name}`)

        const formattedToDos = project_toDos.map((toDo) => ({
          id: toDo.id,
          title: toDo.toDoTitle,
          assignee: toDo.todoAssignee,
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
          priority: toDo.toDoPriority,
          status: toDo.toDoStatus
        }));

        setToDoData(formattedToDos)
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


  // Define columns for the table
  const toDoTableColumns = [
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
                        columns={toDoTableColumns}
                        data={toDoData}
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
