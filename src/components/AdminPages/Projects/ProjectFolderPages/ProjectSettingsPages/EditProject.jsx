import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../../assets/images/check.png";
import StickyHeader from "../../../../SideBar/StickyHeader";
import { AuthContext } from "../../../../Authentication/authContext";
import upload_icon from "../../../../../assets/images/uploading.png";

import '../../ProjectStyles.css'
import '../../../../../App.css'
import { FiChevronLeft } from 'react-icons/fi';
import { RiEdit2Fill } from "react-icons/ri";
import { MdSaveAs } from "react-icons/md";

import map from '../../../../../assets/images/samplemap.png'
import ProjectSidebar from '../../ProjectFolderSidebar';
import ProjectMap from "../ProjectMap.jsx";
import SidebarOffcanvas from '../../MobileSidebar';
import useWindowWidth from '../windowWidthHook.jsx'
import { useLoader } from '../../../../Loaders/LoaderContext';
function EditProject() {
  const { setLoading } = useLoader();
  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const { projectId } = useParams();
  const [refreshKey, setRefreshKey] = useState(0); 
  const [projectName, setProjectName] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [projectThumbnail, setProjectThumbnail] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [existingFiles, setExistingFiles] = useState([]); // Existing files
  const [fileName, setFileName] = useState([]);
  const [fileSize, setFileSize] = useState([])
  const [error, setError] = useState("");

  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  const [explorerTable ,setExplorerTable] = useState([])
  const navigate = useNavigate();

  const [dropdownStates, setDropdownStates] = useState({});

  const [contributors, setContributors] = useState([])
  const [contributorCount, setContributorCount] = useState(0);

  const [groups, setGroups] = useState([]);
  const [groupCount, setGroupCount] = useState(0);

  const [userRole, setUserRole] = useState("")

  const handleMenuOptionClick = (option) => {
    Swal.fire(`Function to: ${option}`);
  };

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

const [totalFileSize, setTotalFileSize] = useState(0);

useEffect(() => {
  // Fetch project details and populate fields
  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/project/${projectId}`);
      const { project_name, folderTree, owner, updatedAt, createdAt, 
        project_file, project_location, project_thumbnail, 
        start_date, end_date, project_description } = response.data;

      setProjectName(project_name);
      setProjectLocation(project_location);
      setOwnerName(`${owner.first_name} ${owner.last_name}`);
      setProjectThumbnail(project_thumbnail);
      setStartDate(start_date);
      setEndDate(end_date);
      setProjectDescription(project_description && project_description !== "null" ? project_description : "No description available");
      setExistingFiles(project_file);
      setCreatedAt(new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: 'numeric'
      }).format(new Date(createdAt)));
      setUpdatedAt(new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: 'numeric'
      }).format(new Date(updatedAt)));

      if (folderTree && folderTree.files) {
        const formattedFiles = folderTree.files.map((file) => ({
          fileName: file.fileName, // Assuming the file object has this key
          fileSize: `${(file.fileSize / (1024 * 1024)).toFixed(2)} MB`, // Convert bytes to MB
          fileOwner: `${owner.first_name} ${owner.last_name}`,
          lastModified: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: 'numeric'
          }).format(new Date(file.fileLastModified)), // Format file's last modified time
        }));

        const totalSize = folderTree.files.reduce((sum, file) => sum + file.fileSize, 0); // Sum file sizes
        setTotalFileSize((totalSize / (1024 * 1024)).toFixed(2)); // Convert to MB and set state

        setExplorerTable(formattedFiles);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setLoading(false);
    }
  };


    const fetchUserGroup = async () => {
      try {
        const response = await axiosInstance.get(`/project-contributors/${projectId}`);
        const { contributors, groups } = response.data;
    
        const formattedContributors = contributors.map((contributor) => ({
          contName: contributor.name,
          contEmployer: contributor.employer,
          contRole: contributor.role,
          contStatus: contributor.status,
          contEmail: contributor.email,
          lastAccessed: contributor.last_login && contributor.last_login !== "No login record"
            ? new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(contributor.last_login))
            : "No login record", // Fallback when there's no valid date or the login record is "No login record"
        }));
    
        const formattedGroups = groups.map((group) => ({
          groupId: group.id,
          groupName: group.group_name,
          members: group.members || [],
        }));
    
        setContributors(formattedContributors);
        setContributorCount(contributors.length);
        setGroups(formattedGroups);
        setGroupCount(groups.length)

      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    }

    fetchProjectDetails();
    fetchUserGroup();
  }, [projectId, refreshKey]);

  const handleLeaveProject = () => {
    Swal.fire({
      title: 'Are you sure to leave the project?',
      text: 'This action is irreversible.',
      icon: "warning",
      confirmButtonText: 'Leave',
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success contrib-btn-success",
        cancelButton: "btn"
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Success!', 'You have left the project.', 'success');
      }
    });
  };

  const handleDeleteProject = () => {
    Swal.fire({
      title: 'Are you sure you want to delete this Project?',
      text: 'This action is irreversible.',
      icon: "warning",
      confirmButtonText: 'Delete',
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success contrib-btn-success",
        cancelButton: "btn"
      },
    }).then(async(result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/delete-project/${projectId}`);
          Swal.fire('Success!', 'You have deleted the project.', 'success');
          navigate("/projects")
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

  const handleUpdateProject = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("projectName", projectName);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("projectDescription", projectDescription);
  
    if (projectThumbnail) {
      formData.append("projectThumbnail", projectThumbnail);
    }
  
    try {
      const response = await axiosInstance.put(`/update-project/${projectId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 200) {
        Swal.fire("Success!", "Project updated successfully.", "success");
        setRefreshKey((prevKey) => prevKey + 1);
      } else {
        Swal.fire("Error!", response.data.message || "Failed to update project.", "error");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      Swal.fire("Error!", error.response?.data?.message || "An unexpected error occurred.", "error");
    }
  };
  
 

  return (
    <div className="container">
    {/* <StickyHeader />
    <h3 className="title-page" id="projectFolder-title">
        {ownerName}'s {projectName} 
      </h3> */}
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

                    
                   <div className="row">
                     <div className="col-md-12 header">
                     <div className="table-header d-flex justify-content-between align-items-center mb-3">
                      <div className="page-title">
                        <h2>Edit Project Details</h2>
                      </div>
                      <div className="button-group d-flex">
                        <button id="editProject-saveBtn" className="btn btn-primary add-btn" title="Save" form="updateProjectForm">
                        {isMobile? <MdSaveAs size={24}/> :   'Save Changes'}
                        </button>
                      </div>
                    </div>
                     </div>

                     <div className="col-md-12">
                      <div className="row">
                        <div className="col-12 col-md-12 col-lg-6">
                          <form onSubmit={handleUpdateProject} id="updateProjectForm">
                          <div className="module mb-3">
                            <header> 
                              <h3> Details </h3>
                            </header>
                            <div className="row">
                              <div className="col-12">
                                <div className="input-group">
                                  <label htmlFor="projectName">
                                    <span>Project Name</span>
                                  </label>
                                  <div className="input-focus-group">
                                  <input id="projectName" data-cy="projectName" type="text" 
                                  autoComplete="off" maxLength="255" name="projectName" defaultValue={projectName}
                                  onChange={(e) => setProjectName(e.target.value)}/>
                                  </div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="label-group">
                                  <label> Project Owner: </label>
                                  <div className="value"> {ownerName} </div>
                                </div>
                              </div>
                              <div className="col-12 relative">
                                <div className="flex-row align-items center">
                                <div className="label-group">
                                  <label> Project Thumbnail: </label>
                                  <div className="project-img-settings">
                                  <img 
                                    src={`https://www.api-cadstream.ebjv.e-fab.com.au/uploads/project-thumbnails/${projectThumbnail}`}
                                    alt="" 
                                    style={{ height: "36px", width: "36px" }} 
                                  />
                                  </div>
                                </div>
                                <div className="label-group uploadBtn">
                                  <div>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    id="upload-thumbnail"
                                    name="projectThumbnail"
                                    // className="btn btn-primary add-btn"
                                    // id="uploadbtn"
                                    onChange={(e) => setProjectThumbnail(e.target.files[0])}
                                  />
                                  </div>
                                </div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="label-group">
                                  <label> Project Location: </label>
                                  <div className="value"> {projectLocation} </div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="label-group">
                                  <label> Date Created: </label>
                                  <div className="value"> {createdAt} by {ownerName} </div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="label-group">
                                  <label> Last Modified: </label>
                                  <div className="value"> {updatedAt} by {ownerName} </div>
                                </div>
                              </div>
                              <div className="row ml-1">
                              <div className="col-6 col-sm-6 col-md-3">
                                <div className="label-group">
                                  <label> Size: </label>
                                  <div className="value">  {totalFileSize} MB </div>
                                </div>
                              </div>
                              <div className="col-6 col-sm-6 col-md-3">
                                <div className="label-group">
                                  <label> Groups: </label>
                                  <div className="value"> {groupCount} </div>
                                </div>
                              </div>
                              <div className="col-6 col-sm-6 col-md-3">
                                <div className="label-group">
                                  <label> Files: </label>
                                  <div className="value"> {explorerTable.length} </div>
                                </div>
                              </div>
                              <div className="col-6 col-sm-6 col-md-3">
                                <div className="label-group">
                                  <label> Users: </label>
                                  <div className="value"> {contributorCount} </div>
                                </div>
                              </div>
                              </div>
                              
                            </div>
                          </div>

                        

                          </form>
                        </div>


                        <div className="col-12 col-md-12 col-lg-6">
                        <div className="module mb-3">
                            <header>
                              <h3>Other Details</h3>
                            </header>
                            <div className="row">
                              <div className="col-6">
                                <div className="input-group">
                                  <label htmlFor="startDate"><span>Start date: </span></label>
                                  <input 
                                  id="startDate" 
                                  className="datepicker" 
                                  data-cy="startDate" 
                                  type="date" 
                                  autoComplete="off" 
                                  maxLength="255" 
                                  name="startDate"
                                  value={startDate} 
                                  onChange={(e) => setStartDate(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="input-group">
                                  <label htmlFor="endDate"><span>End date: </span></label>
                                  <input 
                                  id="endDate" 
                                  className="datepicker" 
                                  data-cy="endDate" 
                                  type="date"
                                  autoComplete="off" 
                                  maxLength="255" 
                                  name="endDate"
                                  value={endDate}
                                  onChange={(e) => setEndDate(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="input-group">
                                  <label htmlFor="description"><span>Description: </span></label>
                                  <input 
                                  id="description" 
                                  style={{height:"4rem"}} 
                                  data-cy="description" 
                                  type="textarea" 
                                  autoComplete="off" 
                                  maxLength="255" 
                                  name="description"
                                  defaultValue={projectDescription}
                                  onChange={(e) => setProjectDescription(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex mb-5">
                            <button id="deleteProjectbtn"className="btn btn-danger add-btn" title="Delete" onClick={handleDeleteProject}>
                              Delete Project
                            </button>
                          </div>
                        </div>
                        {/* <div className="col-12 col-md-12 col-lg-6">
                          <div className="module">
                            <header>
                              <h3>Project Location & CRS</h3>
                            </header>
                            <div className="project-location-crs"> 
                              <div className="map-heading"> 
                                <h5> Project Boundary </h5>
                                <div className="dropdown-pane-container connect-dropdown-menu m-width-0">
                                  <button id="crs-boundary-btn" className="dropdownpane-link button icon-medium tertiary icon-cirlce"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent click outside from triggering
                                    toggleDropdown("projectBoundary");
                                  }}
                                  >
                                    <RiEdit2Fill/>
                                  </button>
                                  {dropdownStates["projectBoundary"] && (
                                <div
                                  className="dropdown-menu"
                                  id="boundary-dropdown"
                                  onClick={(e) => e.stopPropagation()} // Prevent click inside dropdown from closing it
                                >
                                  <div
                                    className="dropdown-item"
                                    onClick={() => handleMenuOptionClick("Draw Boundary on Map")}
                                  >
                                    Draw Boundary on Map
                                  </div>
                                  <div
                                    className="dropdown-item"
                                    onClick={() => handleMenuOptionClick("Input Boundary Coordinates")}
                                  >
                                    Input Boundary Coordinates
                                  </div>
                                </div>
                              )}
                                </div>
                              </div>
                              <div className="map-container"> 
                              <div id="projectBoundaryMap" className="">
                              <img src={map}
                                  style={{width:"50%"}}
                                       className="mb-4"
                                  />
                                </div>
                              </div>
                              <div className="mt-2 crs-heading"> 
                                <h5> Coordinate Reference System </h5>
                                <div className="dropdown-pane-container connect-dropdown-menu m-width-0">
                                  <button id="crs-boundary-btn" className="dropdownpane-link button icon-medium tertiary icon-cirlce"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent click outside from triggering
                                      toggleDropdown("projectCRS");
                                    }}
                                    >
                                      <RiEdit2Fill/>
                                    </button>
                                    {dropdownStates["projectCRS"] && (
                                  <div
                                    className="dropdown-menu"
                                    id="CRS-dropdown"
                                    onClick={(e) => e.stopPropagation()} // Prevent click inside dropdown from closing it
                                  >
                                    <div
                                      className="dropdown-item"
                                      onClick={() => handleMenuOptionClick("Choose published coordinate system")}
                                    >
                                      Choose published coordinate system
                                    </div>
                                    <div
                                      className="dropdown-item"
                                      onClick={() => handleMenuOptionClick("Upload calibration file")}
                                    >
                                      Upload calibration file
                                    </div>
                                    <div
                                      className="dropdown-item"
                                      onClick={() => handleMenuOptionClick("Remove coordinate system")}
                                    >
                                      Remove coordinate system
                                    </div>
                                  </div>
                                )}
                                </div>
                              </div>
                              <div className="crs-container"> 
                                <label> No CRS Found </label>
                              </div>
                            </div>
                          </div>
                          <hr></hr>
                          <div className="d-flex mb-5">
                            <button id="leaveProjectbtn"className="btn btn-default add-btn mr-3" title="Leave" onClick={handleLeaveProject} disabled>
                              Leave Project
                            </button>
                            <button id="deleteProjectbtn"className="btn btn-danger add-btn" title="Delete" onClick={handleDeleteProject}>
                              Delete Project
                            </button>
                          </div>
                          <hr className="d-flex d-lg-none"></hr>
                          <div className="page-submitBar d-flex d-lg-none">

                          </div>
                        </div> */}

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


export default EditProject;
