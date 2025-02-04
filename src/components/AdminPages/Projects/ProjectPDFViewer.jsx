import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosInstance.js";
import { useNavigate, useParams } from "react-router-dom";

import './ProjectStyles.css';

import useWindowWidth from '../Projects/ProjectFolderPages/windowWidthHook.jsx'
import ProjectSidebar from './ProjectFolderSidebar.jsx';
import SidebarOffcanvas from "./MobileSidebar.jsx";
import { FaChevronLeft } from "react-icons/fa6";


function ProjectFolder() {
  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const { projectId, fileName } = useParams();
  const [projectName, setProjectName] = useState("");
  const [projectStatus, setProjectStatus] = useState("Active");
  const [projectOwner, setProjectOwner] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0); 

   // Fetch project details and populate fields
   const fetchProjectDetails = async () => {
    try {
      const response = await axiosInstance.get(
        `/project/${projectId}`
      );
      const {
        project_name,
        owner,
      } = response.data;

      setProjectName(project_name);
      setOwnerName(`${owner.first_name} ${owner.last_name}`);

    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };


  useEffect(() => {
  fetchProjectDetails();
}, [projectId, refreshKey]);
  

  return (
    <div className="container">
      <h3 className="projectFolder-title" id="projectFolder-title" >
       {ownerName}&apos;s {projectName}
      </h3>
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
                      <div className="pdf-preview-header">
                        <span className="d-flex flex-row align-items-center pdf-name"
                              onClick={() => navigate(`/project-folder/${projectId}/data/project-explorer`)}>    
                          <FaChevronLeft className="mr-2"/> Go Back to Project Explorer 
                        </span>
                      </div>

                      <div className="pdf-preview-container">
                          {/* PDF Viewer Component */}
                          <div className="pdf-viewer">
                           <iframe
                            className="pdf-iframe"
                            src={`https://www.ebjv.api.e-fab.com.au/uploads/ifc-files/${fileName}`}
                            title="PDF Document"
                          /> 
                  

                          </div>
                      </div>

                    </div>
                </div>
          </div>
   
      </div>
    </div>
  );
}

export default ProjectFolder;
