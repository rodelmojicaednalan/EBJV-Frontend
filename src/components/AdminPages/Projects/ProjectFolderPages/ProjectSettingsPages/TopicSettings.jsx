import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../../assets/images/check.png";
import StickyHeader from "../../../../SideBar/StickyHeader";
import { AuthContext } from "../../../../Authentication/authContext";
import upload_icon from "../../../../../assets/images/uploading.png";
import { SketchPicker } from 'react-color';

import '../../ProjectStyles.css'
import { FiChevronLeft, FiChevronDown } from 'react-icons/fi';
import { BiDotsVertical } from "react-icons/bi";
import { MdOutlineUnfoldLess } from "react-icons/md";
import { BsCircleFill, BsFillInfoCircleFill  } from "react-icons/bs";
import { RiEdit2Fill, RiErrorWarningFill  } from "react-icons/ri";
import { IoIosListBox } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { IoBookmarkSharp  } from "react-icons/io5";

import ProjectSidebar from '../../ProjectFolderSidebar';

import { sampleData1, sampleColumns1 } from './dummyTopicSettings'

function TopicSettings() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [existingFiles, setExistingFiles] = useState([]); // Existing files
  const [fileName, setFileName] = useState([]);
  const [fileSize, setFileSize] = useState([])
  const [error, setError] = useState("");

  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  const [explorerTable ,setExplorerTable] = useState([])
  const navigate = useNavigate();

  const [editingRowId, setEditingRowId] = useState(null);
  const [iconColorEditId, setPriorityIconColorEditId] = useState(null);
  const [currentPriorityColor, setCurrentStatusColor] = useState("") // Track the row being edited
  const [currentColor, setCurrentColor] = useState("#fff"); // Current selected color

  const handleColorChange = (color) => {
    setCurrentColor(color.hex);
    setCurrentStatusColor(color.hex);
  };

  const saveColor = () => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === editingRowId ? { ...item, color: currentColor } : item
      )
    );
    setSampleData3((prevData) =>
      prevData.map((item) =>
        item.id === iconColorEditId ? { ...item, statusColor: currentPriorityColor } : item
      )
    );
    setEditingRowId(null); 
    setPriorityIconColorEditId(null);
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuOptionClick = (option) => {
    Swal.fire(`Function to: ${option}`);
  };


  const [dropdownStates, setDropdownStates] = useState({});

  const toggleDropdown = (id) => {
    setDropdownStates((prevState) => ({
      ...prevState,
      [id]: !prevState[id], // Toggle the specific dropdown state
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownStates({});
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      closeAllDropdowns();
    };

    // Add an event listener to close dropdowns when clicking outside
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  

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

        setCreatedAt(createdAt);
        setUpdatedAt(updatedAt);

        const formattedFiles = files.map((file) => ({
          fileName: file.fileName, // Assuming the file object has this key
          fileSize: `${(file.fileSize / (1024 * 1024)).toFixed(2)} MB`, // Convert bytes to KB
          fileOwner: `${user.first_name} ${user.last_name}`,
          lastModified: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }).format(new Date(updatedAt)),  // Format updatedAt
        }));

        setExplorerTable(formattedFiles)
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };
    

    fetchProjectDetails();
  }, [projectId]);




    const [data, setData] = useState([
      {
        id: 1,
        default: <input className="custom-input" type="radio" name="default" />,
        active: <input  className="custom-input" type="checkbox" defaultChecked />,
        color: "crimson",
        status: "Closed",
      },
      {
        id: 2,
        default: <input className="custom-input" type="radio" name="default" />,
        active: <input  className="custom-input" type="checkbox" defaultChecked />,
        color: "royalBlue",
        status: "New",
      },
      {
        id: 3,
        default: <input className="custom-input" type="radio" name="default" />,
        active: <input  className="custom-input" type="checkbox" defaultChecked />,
        color: "darkGreen",
        status: "In Progress",
      },
      {
        id: 4,
        default: <input className="custom-input" type="radio" name="default" />,
        active: <input  className="custom-input" type="checkbox"  />,
        color: "orange",
        status: "Pending",
      },
      {
        id: 5,
        default: <input className="custom-input" type="radio" name="default" />,
        active: <input  className="custom-input" type="checkbox" defaultChecked />,
        color: "blue",
        status: "Done",
      },
    ]);
  
    const [sampleData3, setSampleData3] = useState([
      {
        id: 1,
        priority: "Low",
        statusColor: "royalBlue", // Added a color property to each entry
        action: "Action1",
      },
      {
        id: 2,
        priority: "Normal",
        statusColor: "darkGreen",
        action: "Action1",
      },
      {
        id: 3,
        priority: "High",
        statusColor: "orange",
        action: "Action1",
      },
      {
        id: 4,
        priority: "Critical",
        statusColor: "crimson",
        action: "Action1",
      },
    ]);

    const columns = [
      {
        name: "Default",
        width: "15%",
        selector: (row) => row.default,
        sortable: false,
      },
      {
        name: "Active",
        width: "15%",
        selector: (row) => row.active,
        sortable: false,
      },
      {
        name: "Color",
        width: "20%",
        selector: (row) => (
          <span
            style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}
            onClick={() => {
              setEditingRowId(row.id);
              setCurrentColor(row.color);
            }}
          >
            <BsCircleFill color={row.color} size={18} />
            <FiChevronDown />
          </span>
        ),
        sortable: false,
      },
      {
        name: "Status",
        width: "30%",
        selector: (row) => row.status,
        sortable: true,
      },
      {
        name: "Actions",
        selector: (row) => (
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline p-1" title="Edit">
              <RiEdit2Fill className="action-btn" />
            </button>
            <button className="btn btn-outline p-1" title="Delete">
              <RxCross2 className="action-btn" />
            </button>
          </div>
        ),
        sortable: false,
      },
    ];

    const sampleColumns3 = [
    {
      name: "Icon",
      width: "15%",
      selector: (row) => (
        <span
          style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}
          onClick={() => {
            setPriorityIconColorEditId(row.id);
            setCurrentStatusColor(row.statusColor);
          }}
        >
          <IoBookmarkSharp color={row.statusColor} size={18} />
          <FiChevronDown />
        </span>
      ),
    },
    {
      name: "Priority",
      width: "65%",
      selector: (row) => row.priority,
      sortable: true,
    },
    {
      name: "Actions",
      selector: (row) => (
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline p-1" title="Edit">
            <RiEdit2Fill className="action-btn" />
          </button>
          <button className="btn btn-outline p-1" title="Delete">
            <RxCross2 className="action-btn" />
          </button>
        </div>
      ),
      sortable: false,
    },
  ];
    

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
                          <h2>Topic Config</h2>
                        </div>
                        <div className="button-group d-flex">
                        <div className="menu-btn-container position-relative">
                                  <button
                                        className="dropdownpane-link button icon-medium tertiary icon-cirlce"
                                        title="Menu"
                                        id="top-conf-btn"
                                        onClick={handleMenuToggle}
                                      >
                                        <BiDotsVertical />
                                      </button>
                                      {menuOpen && (
                                        <div className="dropdown-menu" id="topConf-dropdown">
                                          <div
                                            className="dropdown-item"
                                            onClick={() => handleMenuOptionClick("Import Settings")}
                                          >
                                            Import Settings
                                          </div>
                                        </div>
                                      )}
                              </div>
                          <button id="addbtn"className="btn btn-primary add-btn" title="Save Changes">
                            Save Changes
                          </button>
                        </div>
                      </div>

                      <div className="module mb-2 py-2">
                        <header className="row-distributez mb-0">
                          <h3> Topic Types </h3>
                          <div className="d-flex">
                            <div className="dropdown-pane-container connect-dropdown-menu m-width-0">
                              <div className="menu-btn-container position-relative">
                              <button
                                className="dropdownpane-link button icon-medium tertiary icon-circle"
                                title="Menu"
                                id="top-conf-btn"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent click outside from triggering
                                  toggleDropdown("topicTypes");
                                }}
                              >
                                <BiDotsVertical />
                              </button>
                              {dropdownStates["topicTypes"] && (
                                <div
                                  className="dropdown-menu"
                                  id="topConf-dropdown"
                                  onClick={(e) => e.stopPropagation()} // Prevent click inside dropdown from closing it
                                >
                                  <div
                                    className="dropdown-item"
                                    onClick={() => handleMenuOptionClick("Reset Defaults")}
                                  >
                                    Reset Defaults
                                  </div>
                                  <div
                                    className="dropdown-item"
                                    onClick={() => handleMenuOptionClick("Remove all")}
                                  >
                                    Remove all
                                  </div>
                                </div>
                              )}
                              </div>
                            </div>
                            <button id="top-conf-btnz" className="button icon-medium tertiary icon-circle ">
                              <MdOutlineUnfoldLess/>
                            </button>
                          </div>
                        </header>

                        <div className="row mt-2 accordionContent">
                          <div className="col-md-12 col-lg-4 mb-2">
                            <p className="text-meta">
                            A topic type is a way to easily identify and categorize issues accounting to BCF standards. You can use the default types or create custom ones.
                            </p>
                            <div className="mt-3">
                              <h5>Add custom types</h5>
                              <hr className="my-1"></hr>
                              <div className="row-distributez align-top-button">
                                <div className="input-group flex-grow-1 mb-0">
                                  <div className="input-focus-group">
                                  <input type="text" data-cy="newType" id="newTopicType" placeholder="Add new topic type..." value=""/>
                                  </div>
                                </div>
                                <div className="ml-1">
                                <button id="addbtn"className="btn btn-primary add-btn" 
                                title="Save Changes" style={{marginTop: "8px"}}>
                                  Add
                                </button>
                                </div>
                              </div>
                            </div>

                          </div>
                          <div className="col-md-12 col-lg-8">
                          <DataTable
                            className="dataTables_wrapperz mt-3"
                            id="explorer-table"
                            columns={sampleColumns1}
                            data={sampleData1}
                            responsive
                          />
                          </div>
                        </div>
                      </div>

                      <div className="module mb-2 py-2">
                        <header className="row-distributez mb-0">
                          <h3> Topic Status </h3>
                          <div className="d-flex">
                            <div className="dropdown-pane-container connect-dropdown-menu m-width-0">
                            <div className="menu-btn-container position-relative">
                              <button
                                className="dropdownpane-link button icon-medium tertiary icon-circle"
                                title="Menu"
                                id="top-conf-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdown("topicStatus");
                                }}
                              >
                                <BiDotsVertical />
                              </button>
                              {dropdownStates["topicStatus"] && (
                                <div
                                  className="dropdown-menu"
                                  id="topConf-dropdown"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div
                                    className="dropdown-item"
                                    onClick={() => handleMenuOptionClick("Reset Defaults")}
                                  >
                                    Reset Defaults
                                  </div>
                                  <div
                                    className="dropdown-item"
                                    onClick={() => handleMenuOptionClick("Remove all")}
                                  >
                                    Remove all
                                  </div>
                                </div>
                              )}
                              </div>
                            </div>
                            <button id="top-conf-btnz" className="button icon-medium tertiary icon-circle ">
                              <MdOutlineUnfoldLess/>
                            </button>
                          </div>
                        </header>

                        <div className="row mt-2 accordionContent">
                          <div className="col-md-12 col-lg-4 mb-2">
                            <p className="text-meta">
                            A topic status is a way to easily track progress of topics. You can use the default types or create custom ones.
                            </p>
                            <p className="text-meta">
                            To keep the topics listing manageable, you can set individual statuses to “Inactive”. This will remove the topic from the main active list.
                            </p>
                            <div className="mt-3">
                              <h5>Add custom status</h5>
                              <hr className="my-1"></hr>
                              <div className="row-distributez align-top-button">
                                <div className="input-group flex-grow-1 mb-0">
                                  <div className="input-focus-group">
                                  <input type="text" data-cy="newStatus" id="newTopicStatus" placeholder="Add new topic status..." value=""/>
                                  </div>
                                </div>
                                <div className="ml-1">
                                <button id="addbtn"className="btn btn-primary add-btn" 
                                title="Save Changes" style={{marginTop: "8px"}}>
                                  Add
                                </button>
                                </div>
                              </div>
                            </div>

                          </div>
                          <div className="col-md-12 col-lg-8">
                          <DataTable
                            className="dataTables_wrapperz mt-3"
                            id="explorer-table"
                            columns={columns}
                            data={data}
                            responsive
                          />
                          {editingRowId && (
                              <div
                                style={{
                                  position: "absolute",
                                  zIndex: 1000,
                                  top: "10%",
                                  left: "40%",
                                  backgroundColor: "white",
                                  padding: "10px",
                                  border: "1px solid #ccc",
                                  borderRadius: "5px",
                                }}
                              >
                                <SketchPicker color={currentColor} onChange={handleColorChange} />
                                <div style={{ marginTop: "10px", display:"flex" }}>
                                  <button className="btn" onClick={saveColor}>Save</button>
                                  <button className="btn" onClick={() => setEditingRowId(null)}>Cancel</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="module mb-2 py-2">
                        <header className="row-distributez mb-0">
                          <h3> Topic Priorities </h3>
                          <div className="d-flex">
                            <div className="dropdown-pane-container connect-dropdown-menu m-width-0">
                            <div className="menu-btn-container position-relative">
                              <button
                                  className="dropdownpane-link button icon-medium tertiary icon-circle"
                                  title="Menu"
                                  id="top-conf-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown("topicPriority");
                                  }}
                                >
                                  <BiDotsVertical />
                                </button>
                                {dropdownStates["topicPriority"] && (
                                  <div
                                    className="dropdown-menu"
                                    id="topConf-dropdown"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div
                                      className="dropdown-item"
                                      onClick={() => handleMenuOptionClick("Reset Defaults")}
                                    >
                                      Reset Defaults
                                    </div>
                                    <div
                                      className="dropdown-item"
                                      onClick={() => handleMenuOptionClick("Remove all")}
                                    >
                                      Remove all
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button id="top-conf-btnz" className="button icon-medium tertiary icon-circle ">
                              <MdOutlineUnfoldLess/>
                            </button>
                          </div>
                        </header>

                        <div className="row mt-2 accordionContent">
                          <div className="col-md-12 col-lg-4 mb-2">
                            <p className="text-meta">
                            Priorities give a rank of importance to topics. You can use the default types or create custom ones.
                            </p>
                            <div className="mt-3">
                              <h5>Add custom priority</h5>
                              <hr className="my-1"></hr>
                              <div className="row-distributez align-top-button">
                                <div className="input-group flex-grow-1 mb-0">
                                  <div className="input-focus-group">
                                  <input type="text" data-cy="newPriority" id="newTopicPriority" placeholder="Add new topic priority..." value=""/>
                                  </div>
                                </div>
                                <div className="ml-1">
                                <button id="addbtn"className="btn btn-primary add-btn" 
                                title="Save Changes" style={{marginTop: "8px"}}>
                                  Add
                                </button>
                                </div>
                              </div>
                            </div>

                          </div>
                          <div className="col-md-12 col-lg-8">
                          <DataTable
                            className="dataTables_wrapperz mt-3"
                            id="explorer-table"
                            columns={sampleColumns3}
                            data={sampleData3}
                            responsive
                          />
                          {iconColorEditId && (
                            <div
                              style={{
                                position: "absolute",
                                  zIndex: 1000,
                                  top: "-50%",
                                  left: "10%",
                                  backgroundColor: "white",
                                  padding: "10px",
                                  border: "1px solid #ccc",
                                  borderRadius: "5px",
                              }}
                            >
                              <SketchPicker color={currentPriorityColor} onChange={handleColorChange} />
                              <div style={{ marginTop: "10px", display: "flex" }}>
                                <button className="btn" onClick={saveColor}>Save</button>
                                <button className="btn" onClick={() => setPriorityIconColorEditId(null)}>Cancel</button>
                              </div>
                            </div>
                          )}

                          </div>
                        </div>
                      </div>

                      </div>
                    </div>
                </div>
          </div>

      </div>
      </div>
      );
    }

export default TopicSettings;
