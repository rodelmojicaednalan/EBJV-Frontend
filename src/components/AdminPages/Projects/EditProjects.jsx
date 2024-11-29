import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import check from "../../../assets/images/check.png";
import { FiChevronLeft } from 'react-icons/fi';
import StickyHeader from "../../SideBar/StickyHeader";
import { AuthContext } from "../../Authentication/authContext";
import upload_icon from "../../../assets/images/uploading.png";

function EditProject() {
  const { user } = useContext(AuthContext);
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectStatus, setProjectStatus] = useState("Active");
  const [projectOwner, setProjectOwner] = useState("");
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
        const { project_name, project_address, user_id, project_status } = response.data;
        const parsedFiles = JSON.parse(response.data.project_file)

        setProjectName(project_name);
        setProjectAddress(project_address);
        setProjectOwner(user_id);
        setProjectStatus(project_status);
        setExistingFiles(parsedFiles); 
        console.log(parsedFiles)// Assuming `project_files` is an array of file objects
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const updateProject = async (e) => {
    e.preventDefault();

    if (!projectName || !projectAddress || !projectOwner) {
      setError("All fields are required.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("project_name", projectName);
      formData.append("project_address", projectAddress);
      formData.append("user_id", projectOwner);
      formData.append("project_status", projectStatus);

      // Add new files to the form data
      projectFiles.forEach((file) => formData.append("project_file", file));
      existingFiles.forEach((file) => formData.append("project_file", file));


      await axiosInstance.put(`/update-project/${projectId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        title: "Project Updated",
        text: `${projectName} has been updated successfully.`,
        imageUrl: check,
        imageWidth: 100,
        imageHeight: 100,
        confirmButtonText: "OK",
        confirmButtonColor: "#0ABAA6",
      }).then(() => {
        navigate("/projects");
      });
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setProjectFiles((prev) => [...prev, ...files]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setProjectFiles((prev) => [...prev, ...files]);
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent default to allow drop
  };

  const renderFilePreviews = () => (
    <>
      <h4>Existing Files:</h4>
      {existingFiles.length > 0 ? (
        <ul>
          {existingFiles.map((file, index) => (
            <li key={index}>
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                {file}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No existing files</p>
      )}
      <h4>New Files:</h4>
      {projectFiles.length > 0 ? (
        <ul>
          {projectFiles.map((file, index) => (
            <li key={index}>{file}</li>
          ))}
        </ul>
      ) : (
        <p>No new files</p>
      )}
    </>
  );

  return (
    <div className="container">
      <StickyHeader />
      <a href="/projects" className="back-btn">
        <h3 className="title-page">
          <FiChevronLeft className="icon-left" /> Update Project
        </h3>
      </a>
      <div className="container-content">
        <form onSubmit={updateProject} className="add-branch-form">
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}
          <div className="d-flex justify-content-between ml-5 mr-5 pt-4 mt-3 add-branch-fields">
            <div className="form-group">
              <label>Project Name:</label>
              <input
                type="text"
                className="form-control"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Project Address:</label>
              <input
                type="text"
                className="form-control"
                value={projectAddress}
                onChange={(e) => setProjectAddress(e.target.value)}
              />
            </div>
            <div className="form-group status-field">
              <label>Status:</label>
              <br />
              <select
                className="branch-status"
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div
            className="upload-section"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <img height={70} src={upload_icon} alt="" />
            <p>Drag and drop IFC file here</p>
            <p>or</p>
            <input
              type="file"
              accept=".ifc"
              onChange={handleFileSelect}
              id="file-input"
              disabled={loadingIfc}
              style={{ display: "none" }}
            />
            <label htmlFor="file-input" className="upload-click">
              Browse Files
            </label>
            <div className="file-preview-section">
              {renderFilePreviews()}
            </div>
          </div>

          <button className="submit-btn mb-4 mt-4 submit-branch-btn" type="submit">
            UPDATE
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProject;
