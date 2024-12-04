import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";
import { AuthContext } from "../../../Authentication/authContext";
import upload_icon from "../../../../assets/images/uploading.png";

import '../ProjectStyles.css'
import { FiChevronLeft, FiClock } from 'react-icons/fi';
import { FaBookmark } from "react-icons/fa6";
import { FaRegCalendar } from "react-icons/fa";
import { GrStatusGoodSmall } from "react-icons/gr";
import { RiEdit2Fill } from "react-icons/ri";


import ProjectSidebar from '../ProjectFolderSidebar';

function ProjectTopics() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [existingFiles, setExistingFiles] = useState([]); // Existing files
  const [fileName, setFileName] = useState([]);
  const [fileSize, setFileSize] = useState([])
  const [error, setError] = useState("");

  const [topicData ,setTopicData] = useState([])
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

        const formattedFiles = files.map((file) => ({
          fileName: file.fileName, // Assuming the file object has this key
          fileSize: `${(file.fileSize / (1024 * 1024)).toFixed(2)} MB`, // Convert bytes to KB
          fileOwner: `${user.first_name} ${user.last_name}`,
          dateCreated: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }).format(new Date(createdAt)),
          lastModified: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }).format(new Date(updatedAt)),  // Format updatedAt
        }));

        setTopicData(formattedFiles)
        console.log(topicData.dateCreated)
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
                          <h2>Topics</h2>
                        </div>
                    
                      </div>

                      <div className="activity-cards-box mt-2 d-flex">

                        <div className="topic-card container-fluid">
                          <div className="topic-time d-none d-md-flex ">
                            <span className="text-muted"> Dec 02, 2024 10:53 AM </span>
                          </div>

                          <div className="flex-row">
                            <div className="activity flex-1">
                            <div className="topic-title">Topic Title</div>
                              <div className="row-distribute">
                              
                                <div className="topic-users flex-row">
                                  <div className="assignee"> <p><strong>Assigned to:</strong> {ownerName}</p> </div>
                                  <div className="creator"> <p><strong>Created by:</strong> {ownerName}</p></div>
                                </div>
                                <div className="topic-config">
                                  <ul className="flex-row">
                                    <li className="mr-2"><FaBookmark className="topic-icons" style={{color:"royalBlue"}}/> Topic Priority</li>
                                    <li className="mr-2"><GrStatusGoodSmall className="topic-icons" style={{color:"green"}}/> Topic Status</li>
                                    <li className="mr-2"><RiEdit2Fill className="topic-icons" style={{color:"royalBlue"}}/> Topic Type</li>
                                    <li className="mr-2"><FaRegCalendar/> Deadline</li>
                                  </ul>
                                </div>
                              </div>


                             <div className="topic-desc">

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
export default ProjectTopics;
