import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";

import "./IfcUploadPage.css";
import "../../../App.css";
import StickyHeader from "../../SideBar/StickyHeader";
import { useNavigate } from "react-router-dom";
import check from "../../../assets/images/check.png";
import uploading from "../../../assets/images/uploading.png";
import view_icon from "../../../assets/images/list-view.png";
import delete_icon from "../../../assets/images/delete-log.png";

function IfcUploadPage() {
  const [loadingIfc, setLoadingIfc] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate();

//create handleDeleteIfcClick function
  const handleDeleteIfcClick = (index) => {
    setUploadedFiles((prev) => [...prev.slice(0, index),...prev.slice(index + 1)]);
    Swal.fire({
      title: "Success!",
      text: "Model deleted successfully.",
      imageUrl: check,
      imageWidth: 100,
      imageHeight: 100,
      confirmButtonText: "OK",
      confirmButtonColor: "#0ABAA6",
    });
  };


  const handleIfcUpload = (file) => {
    if (file) {
      setLoadingIfc(true);
      try {
        const fileURL = URL.createObjectURL(file);

        setUploadedFiles((prev) => [
          ...prev,
          { name: file.name, url: fileURL },
        ]);

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
    const file = event.dataTransfer.files[0];
    handleIfcUpload(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent default to allow drop
  };

  const columns = [
    {
      name: "File Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => <span>{row.name}</span>,
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
         <img
         src={view_icon}
         title="View Model Details"
         alt="view"
         width="25"
         height="25"
         onClick={() =>
          navigate("/ifc-viewer", {
            state: { fileUrl: row.url, fileName: row.name },
          })
        }
         style={{ cursor: "pointer" }}
       />
        <img
            className="ml-3"
            src={delete_icon}
            title="Delete Branch"
            style={{ cursor: "pointer" }}
            onClick={() => handleDeleteIfcClick(uploadedFiles.indexOf(row))}

            alt="delete"
            width="25"
            height="25"
          />
       </>
      ),
    },
  ];

  return (
    <div className="container">
      <StickyHeader />
      <div className="row">
      <div className="col-lg-12 col-md-6 custom-content-container">
        <h3 className="title-page">IFC File Upload</h3>

        {/* Upload Box for IFC Files */}
        <center>
          <div
            className="upload-section"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <img height={70} src={uploading} alt="" />
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
          </div>
        </center>

        {/* DataTable for Uploaded Files */}
      </div>
      <div className="container-content">
        <DataTable
          columns={columns}
          data={uploadedFiles}
          pagination
          responsive
          // noDataComponent="No files uploaded"
          className="dataTables_wrapper"
        />
      </div>
    </div>
    </div>
  );
}

export default IfcUploadPage;
