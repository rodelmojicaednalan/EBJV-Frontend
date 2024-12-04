import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../../assets/images/check.png";
import StickyHeader from "../../../../SideBar/StickyHeader";
import { AuthContext } from "../../../../Authentication/authContext";
import upload_icon from "../../../../../assets/images/uploading.png";

import '../../ProjectStyles.css'
import { FiChevronLeft } from 'react-icons/fi';


import ProjectSidebar from '../../ProjectFolderSidebar';

function EditProject() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [existingFiles, setExistingFiles] = useState([]); // Existing files
  const [error, setError] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project/${projectId}`);
        const { project_name, user } = response.data;
        const parsedFiles = JSON.parse(response.data.project_file)

        setProjectName(project_name);
        setOwnerName(`${user.first_name} ${user.last_name}`)
        setExistingFiles(parsedFiles); 
        // Assuming `project_files` is an array of file objects
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
                      <h1>EDIT PROJECT PAGE</h1>
                      </div>
                    </div>
                </div>
          </div>

      </div>
      </div>
      );
    }


export default EditProject;
