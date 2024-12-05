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
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const toggleDropdown = (id) => {
    console.log("Toggling dropdown for ID:", id);
    setOpenDropdownId(openDropdownId === id ? null : id);
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

    return (
    <div className="container">
      <StickyHeader />
      <a href="/projects" className="back-btn">
        <h3 className="title-page">
          <FiChevronLeft className="icon-left" /> {ownerName}'s {projectName}
        </h3>
      </a>
      <div className="container-content" id="project-folder-container">
        <ProjectSidebar projectId={projectId} />

        <div className="projectFolder-display">
        <div className="main"> 
                    <div className="container-fluid moduleFluid">
                      <div className="project-content">

                      <div className="table-header d-flex justify-content-between align-items-center mb-3">
                        <div className="page-title">
                          <h2>To Do List</h2>
                        </div>
                        <div className="button-group d-flex">
                        <button className="btn btn-icon menu-btn" title="Menu">
                            <BiDotsVertical/>
                          </button>
                          <button id="addbtn"className="btn btn-primary add-btn" title="Add New Release">
                              New
                          </button>
                        </div>
                      </div>
                      <div className="view-filters">
                          <div className="filter-container null">
                            <div className="filters">
                                <div id="filter-categ-container">
                                    <div className="filter-type mr-n1">Owner <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Users <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Groups <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Status <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Priority <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Date Modified <FaCaretDown/> </div>
                                </div>
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
