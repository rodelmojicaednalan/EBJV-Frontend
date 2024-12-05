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

import map from '../../../../../assets/images/samplemap.png'
import ProjectSidebar from '../../ProjectFolderSidebar';

function EditProject() {
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

  return (
    <div className="container">
    <StickyHeader />
    <a href="/projects" className="back-btn">
      <h3 className="title-page" id="proj-folder-title">
        <FiChevronLeft className="icon-left" /> {ownerName}'s {projectName} 
      </h3>
    </a>
    <div className="container-content" id="project-folder-container">
        <ProjectSidebar projectId={projectId} />
   

    <div className="projectFolder-display">
              <div className="main"> 
                  <div className="container-fluid moduleFluid">
                    <div className="project-content">

                    
                   <div className="content-row">
                     <div className="col-md-12 header">
                     <div className="table-header d-flex justify-content-between align-items-center mb-3">
                      <div className="page-title">
                        <h2>Edit Project Details</h2>
                      </div>
                      <div className="button-group d-flex">
                        <button id="addbtn"className="btn btn-primary add-btn" title="Save">
                          Save Changes
                        </button>
                      </div>
                    </div>
                     </div>

                     <div className="col-md-12">
                      <div className="row">
                        <div className="col-12 col-md-12 col-lg-6">
                          <div className="module mb-3">
                            <header> 
                              <h3> Details </h3>
                            </header>
                            <div className="content-row">
                              <div className="col-12">
                                <div className="input-group">
                                  <label for="projectName">
                                    <span>Project Name</span>
                                  </label>
                                  <div className="input-focus-group">
                                  <input id="projectName" class="" data-cy="projectName" type="text" autocomplete="off" maxlength="255" name="projectName"/>
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
                                    <img src={upload_icon}
                                         style={{height:"40px", width:"40px"}}
                                    /> 
                                  </div>
                                </div>
                                <div className="label-group uploadBtn">
                                  <label></label>
                                  <div>
                                  <button className="btn btn-primary add-btn" type="button" id="uploadbtn">Upload new</button>
                                  </div>
                                </div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="label-group">
                                  <label> Project Location: </label>
                                  <div className="value"> Asia </div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="label-group">
                                  <label> Date Created: </label>
                                  <div className="value"> {createdAt} </div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="label-group">
                                  <label> Last Modified: </label>
                                  <div className="value"> {updatedAt} </div>
                                </div>
                              </div>
                              <div className="col-6 col-sm-6 col-md-3">
                                <div className="label-group">
                                  <label> Size: </label>
                                  <div className="value"> 31.7 MB </div>
                                </div>
                              </div>
                              <div className="col-6 col-sm-6 col-md-3">
                                <div className="label-group">
                                  <label> Folders: </label>
                                  <div className="value"> 4 </div>
                                </div>
                              </div>
                              <div className="col-6 col-sm-6 col-md-3">
                                <div className="label-group">
                                  <label> Files: </label>
                                  <div className="value"> 7 </div>
                                </div>
                              </div>
                              <div className="col-6 col-sm-6 col-md-3">
                                <div className="label-group">
                                  <label> Users: </label>
                                  <div className="value"> 2 </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="module mb-3">
                            <header>
                              <h3>Other Details</h3>
                            </header>
                            <div className="row">
                              <div className="col-6">
                                <div className="input-group">
                                  <label for="startDate"><span>Start date: </span></label>
                                  <input id="startDate" className="datepicker" data-cy="startDate" type="datetime-local" autocomplete="off" maxlength="255" name="startDate"/>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="input-group">
                                  <label for="endDate"><span>End date: </span></label>
                                  <input id="endDate" className="datepicker" data-cy="endDate" type="datetime-local" autocomplete="off" maxlength="255" name="endDate"/>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="input-group">
                                  <label for="description"><span>End date: </span></label>
                                  <input id="description" className="" data-cy="description" type="text" autocomplete="off" maxlength="255" name="description"/>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>

                        <div className="col-12 col-md-12 col-lg-6">
                          <div className="module">
                            <header>
                              <h3>Project Location & CRS</h3>
                            </header>
                            <div className="project-location-crs"> 
                              <div className="map-heading"> 
                                <h5> Project Boundary </h5>
                                <div className="dropdown-pane-container connect-dropdown-menu m-width-0">
                                  <button id="crs-boundary-btn" className="dropdownpane-link button icon-medium tertiary icon-cirlce">
                                    <RiEdit2Fill/>
                                  </button>
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
                                  <button id="crs-boundary-btn" className="dropdownpane-link button icon-medium tertiary icon-cirlce">
                                    <RiEdit2Fill/>
                                  </button>
                                </div>
                              </div>
                              <div className="crs-container"> 
                                <label> No CRS Found </label>
                              </div>
                            </div>
                          </div>
                          <hr></hr>
                          <div className="d-flex mb-5">
                            <button id="leaveProjectbtn"className="btn btn-default add-btn mr-3" title="Leave">
                              Leave Project
                            </button>
                            <button id="deleteProjectbtn"className="btn btn-danger add-btn" title="Delete">
                              Delete Project
                            </button>
                          </div>
                          <hr className="d-flex d-lg-none"></hr>
                          <div className="page-submitBar d-flex d-lg-none">

                          </div>
                        </div>
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
