import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";
import { AuthContext } from "../../../Authentication/authContext";
import upload_icon from "../../../../assets/images/uploading.png";
import view_model from "../../../../assets/images/view-model.png";
import man from '../../../../assets/images/man.png'

import '../ProjectStyles.css'
import { FiChevronLeft, FiUser } from 'react-icons/fi';


import ProjectSidebar from '../ProjectFolderSidebar';
import { FaChevronLeft } from "react-icons/fa6";
import { FaCaretDown, FaFileExcel, FaHistory } from "react-icons/fa";

function ProjectActivity() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [existingFiles, setExistingFiles] = useState([]); // Existing files
  const [error, setError] = useState("");

  const [activityCardData ,setActivityCardData] = useState([])
  const navigate = useNavigate();


  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project/${projectId}`);
        const { project_name, user, files, updatedAt } = response.data;
        const parsedFiles = JSON.parse(response.data.project_file)

        setProjectName(project_name);
        setOwnerName(`${user.first_name} ${user.last_name}`)
        setExistingFiles(parsedFiles);

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

        setActivityCardData(formattedFiles)
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };
    

    fetchProjectDetails();
  }, [projectId]);

  const cardData = [
    {
      id: 1,
      fileName: "Model5.ifc",
      fileOwner: "Charlie White",
      lastModified: "Nov 12, 2024 3:15 AM",
      fileSize: "300 KB",
      activityDesc: "added topic to file"
    },
    {
      id: 2,
      fileName: "Model5.ifc",
      fileOwner: "Charlie Red",
      lastModified: "Nov 8, 2024 11:41 AM",
      fileSize: "300 KB",
      activityDesc: "modified file name"
    },
    {
      id: 3,
      fileName: "Model72.ifc",
      fileOwner: "Charlie Brown",
      lastModified: "Nov 8, 2024 6:33 AM",
      fileSize: "300 KB",
      activityDesc: "added file"
    },
    {
      id: 4,
      fileName: "Modelxx31.ifc",
      fileOwner: "Charlie Green",
      lastModified: "Nov 7, 2024 1:12 PM",
      fileSize: "300 KB",
      activityDesc: "Commented on Topic A"
    },
    {
      id: 5,
      fileName: "",
      fileOwner: "Charlie Brown",
      lastModified: "Nov 7, 2024 12:07 PM",
      fileSize: "300 KB",
      activityDesc: "added Topic A "
    },
    {
      id: 6,
      fileName: "",
      fileOwner: "Charlie Brown",
      lastModified: "Nov 7, 2024 11:33 AM",
      fileSize: "300 KB",
      activityDesc: "created Project "
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
                          <h2>Activity</h2>
                        </div>
                        <div className="button-group d-flex">
                          <button id="excelExport"className="btn btn-primary add-btn" title="Export to Excel">
                            <FaFileExcel/>
                          </button>
                        </div>
                      </div>

                      <div className="view-filters mb-4">
                          <div className="filter-container null">
                            <div className="filters">
                                <div id="filter-categ-container">
                                    <div className="filter-type mr-n1">Activity Type <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Users <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Groups <FaCaretDown/> </div>
                                    <div className="filter-type mr-n1">Date Modified <FaCaretDown/> </div>
                                </div>
                            </div>
                          </div>
                      </div> 

                <div className="activity-cards-box mt-1 d-flex">
                  {cardData.map((data) => (
                    <div
                      key={data.id}
                      className="activity-card container-fluid mb-2"
                    >
                      <div className="activity-time d-none d-md-flex ">
                        <span className="text-muted">{data.lastModified}</span>
                      </div>
                      <div className="d-flex">
                        <div className="d-none d-md-block activity-type">
                          <FaHistory style={{height:"24px", width:"24px", color:"#eb6314"}}/>
                        </div>
                        <div className="activity-container">
                          <div className="activity-type-profile">
                    
                          </div>
                          <div className="activity">
                            <div className="row-center">
                              <div> <img src={man} style={{height:"24px"}}/> <span style={{fontWeight:"500", textTransform:"uppercase"}}>{data.fileOwner} </span></div>
                              <div> <span style={{fontStyle: "italic", fontWeight:"light"}} > {data.activityDesc} </span></div>
                            </div>
                            <div className="activity-file"> {data.fileName} </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProjectActivity;
