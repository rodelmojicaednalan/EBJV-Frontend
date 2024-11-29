import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import check from "../../../assets/images/check.png";
import { FiChevronLeft } from 'react-icons/fi';
import StickyHeader from "../../SideBar/StickyHeader";
import upload_icon from "../../../assets/images/uploading.png";
import { AuthContext } from "../../Authentication/authContext";
import { useLoader } from "../../Loaders/LoaderContext";

function AddNewProject() {
  const { user } = useContext(AuthContext);
  const [loadingIfc, setLoadingIfc] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectStatus, setProjectStatus] = useState("Active");
  const [projectOwner, setProjectOwner] = useState("");
  const [projectFiles, setProjectFiles] = useState([])

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setLoading } = useLoader();

  useEffect(() => {
    if (user && user.id) {
      setProjectOwner(user.id);
      setLoading(false); // Automatically set the projectOwner to the logged-in user's ID
    } else {
      setLoading(true);
    }
  }, [user]);

  const addProject = async (e) => {
    e.preventDefault();
    if (!projectName || !projectAddress || !projectOwner || !projectFiles) {
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
      projectFiles.forEach((file) => formData.append("project_file", file));
  
      await axiosInstance.post("/create-project", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      setError("");
      setProjectName("");
      setProjectAddress("");
      setProjectOwner("");
      setProjectFiles([]);
      Swal.fire({
        title: "Project Added Successfully",
        text: `${projectName} has been added to the system.`,
        imageUrl: check,
        imageWidth: 100,
        imageHeight: 100,
        confirmButtonText: "OK",
        confirmButtonColor: "#0ABAA6",
      }).then(() => {
        navigate("/projects");
      });
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const handleIfcUpload = (file) => {

    if (!file.name.endsWith(".ifc")) {
    Swal.fire("Error", "Only IFC files are allowed.", "error");
    return;
  }

    if (file) {
      setLoadingIfc(true);
      try {
        setProjectFiles((prev) => [...prev, file]); // Store the raw File object
        Swal.fire({
          title: "Success!",
          text: "Model uploaded successfully.",
          imageUrl: check,
          imageWidth: 100,
          imageHeight: 100,
          confirmButtonText: "OK",
          confirmButtonColor: "#0ABAA6",
        });
      } catch (error) {
        console.error("Error loading IFC file:", error);
        Swal.fire("Error", "Failed to load IFC file", "error");
      } finally {
        setLoadingIfc(false);
      }
    }
  };
  

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    handleIfcUpload(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    files.forEach((file) => handleIfcUpload(file));
  };
  

  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent default to allow drop
  };

  const renderFilePreviews = () => {
    if (projectFiles.length === 0) return <p>No files selected</p>;
    return (
      <ul>
        {projectFiles.map((file, index) => (
          <li key={index}>{file.name}</li> // File.name comes from File object
        ))}
      </ul>
    );
  };
  

  return (
    <div className="container">
      <StickyHeader/>
      <a href="/projects" className="back-btn">
        <h3 className="title-page">
          <FiChevronLeft className="icon-left" /> Add New Project
        </h3>
      </a>
      <div className="container-content">
        <form onSubmit={addProject} className="add-branch-form">
          <div style={{ position: "relative", textAlign: "center", justifyContent: "center", alignItems: "center" }}>
            {error && <div className="alert alert-danger" style={{ position: "absolute", left: "25%", top: "-10px", width: "50%", padding: "4px" }}>{error}</div>}
          </div>
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

          <div className="d-flex justify-content-between ml-5">
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
              <h4>Selected IFC File:</h4>
              {renderFilePreviews()}
            </div>
          </div>
          </div>

          <button className="submit-btn mb-4 mt-4 submit-branch-btn" type="submit">
            CREATE
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddNewProject;
