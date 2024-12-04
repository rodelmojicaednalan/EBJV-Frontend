import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../assets/images/check.png";
import StickyHeader from "../../SideBar/StickyHeader";
import { AuthContext } from "../../Authentication/authContext";
import upload_icon from "../../../assets/images/uploading.png";

import './ProjectStyles.css';
import { FiChevronLeft } from 'react-icons/fi';
import { FaFolderTree } from "react-icons/fa6";
import { FaHistory, FaEye, FaCommentAlt, FaClipboardCheck } from 'react-icons/fa';
import { TbBrandDatabricks } from "react-icons/tb";
import { IoIosPaper } from 'react-icons/io';
import { IoPeopleSharp } from "react-icons/io5";
import { MdSettings } from 'react-icons/md';
import { BiSolidEdit } from "react-icons/bi";
import { HiCog } from "react-icons/hi2";
import { TbRulerMeasure } from "react-icons/tb";

import ProjectSidebar from './ProjectFolderSidebar';

function ProjectFolder() {
  const { user } = useContext(AuthContext);
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectStatus, setProjectStatus] = useState("Active");
  const [projectOwner, setProjectOwner] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [projectFiles, setProjectFiles] = useState([]); // New files
  const [existingFiles, setExistingFiles] = useState([]); // Existing files
  const [loadingIfc, setLoadingIfc] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project/${projectId}`);
        const { project_name, project_address, user_id, project_status, user } = response.data;
        const parsedFiles = JSON.parse(response.data.project_file)

        setProjectName(project_name);
        setProjectAddress(project_address);
        setProjectOwner(user_id);
        setOwnerName(`${user.first_name} ${user.last_name}`)
        setProjectStatus(project_status);
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
                        <h1>Project Overview</h1>
                    </div>
                </div>
          </div>
   
      </div>
    </div>
  );
}

export default ProjectFolder;
