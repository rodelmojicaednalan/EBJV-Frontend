import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../../assets/images/check.png";
import StickyHeader from "../../../../SideBar/StickyHeader";
import { AuthContext } from "../../../../Authentication/authContext";
import upload_icon from "../../../../../assets/images/uploading.png";

import '../../ProjectStyles.css'
import { FiChevronLeft, FiChevronDown } from 'react-icons/fi';
import { BiDotsVertical } from "react-icons/bi";
import { MdOutlineUnfoldLess } from "react-icons/md";



import ProjectSidebar from '../../ProjectFolderSidebar';

import { sampleData1, sampleColumns1, sampleData2, sampleColumns2, sampleData3, sampleColumns3 } from './dummyTopicSettings'

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
        <h3 className="title-page">
          <FiChevronLeft className="icon-left" /> {ownerName}'s {projectName} 
        </h3>
      </a>
      <div className="container-content" id="project-folder-container">
      <ProjectSidebar projectId={projectId}/>

      <div className="projectFolder-display">
                <div className="main"> 
                    <div className="container-fluid moduleFluid">
                      <div className="project-content">
                    
                      <div className="table-header d-flex justify-content-between align-items-center mb-3">
                        <div className="page-title">
                          <h2>Topic Config</h2>
                        </div>
                        <div className="button-group d-flex">
                          <button className="btn btn-icon menu-btn" title="Menu">
                            <BiDotsVertical/>
                          </button>
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
                              <button id="top-conf-btn" className="dropdownpane-link button icon-medium tertiary icon-cirlce">
                                <BiDotsVertical/>
                              </button>
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
                                  <input type="text" data-cy="newType" placeholder="Add new topic type..." value=""/>
                                  </div>
                                </div>
                                <div className="ml-1">
                                <button id="addbtn"className="btn btn-primary add-btn" title="Save Changes">
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
                              <button id="top-conf-btn" className="dropdownpane-link button icon-medium tertiary icon-cirlce">
                                <BiDotsVertical/>
                              </button>
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
                                  <input type="text" data-cy="newStatus" placeholder="Add new topic status..." value=""/>
                                  </div>
                                </div>
                                <div className="ml-1">
                                <button id="addbtn"className="btn btn-primary add-btn" title="Save Changes">
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
                            columns={sampleColumns2}
                            data={sampleData2}
                            responsive
                          />
                          </div>
                        </div>
                      </div>

                      <div className="module mb-2 py-2">
                        <header className="row-distributez mb-0">
                          <h3> Topic Priorities </h3>
                          <div className="d-flex">
                            <div className="dropdown-pane-container connect-dropdown-menu m-width-0">
                              <button id="top-conf-btn" className="dropdownpane-link button icon-medium tertiary icon-cirlce">
                                <BiDotsVertical/>
                              </button>
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
                                  <input type="text" data-cy="newPriority" placeholder="Add new topic priority..." value=""/>
                                  </div>
                                </div>
                                <div className="ml-1">
                                <button id="addbtn"className="btn btn-primary add-btn" title="Save Changes">
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
