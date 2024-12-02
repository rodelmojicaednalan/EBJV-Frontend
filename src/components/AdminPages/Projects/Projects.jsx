// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import "../../../App.css";
import "font-awesome/css/font-awesome.min.css";
import view_icon from "../../../assets/images/list-view.png";
import edit_icon from "../../../assets/images/edit-details.png";
import view_model from "../../../assets/images/view-model.png";
import delete_icon from "../../../assets/images/delete-log.png";
import check from "../../../assets/images/check.png";

import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import axiosInstance from "../../../../axiosInstance.js";
import { useLoader } from "../../Loaders/LoaderContext";
import StickyHeader from "../../SideBar/StickyHeader";

function Projects() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState(null);
  const [selectedprojectId, setSelectedprojectId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const { setLoading } = useLoader();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // Check user's role
        const userResponse = await axiosInstance.get("/user");
        const userRole = userResponse.data?.roles?.map(role => role.role_name);// Assuming `role` is returned from the API
        let response;
        if (userRole == 'Admin') {
          // Fetch all projects for Admin
          response = await axiosInstance.get("/projects");
        } else {
          // Fetch only client's projects
          response = await axiosInstance.get("/my-projects");
        }

        const formattedData = response.data.data.map((project) => {
          const parsedFiles = JSON.parse(project.project_file);
          return {
            id: project.id,
            project_name: project.project_name,
            project_address: formatAddress(project.project_address),
            project_owner: `${project.user.first_name} ${project.user.last_name}`,
            project_file: parsedFiles,
            project_status: project.project_status,
          };
        });

        setData(formattedData);
        setFilteredData(formattedData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    const formatAddress = (address) => {
      return address
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .join(", ");
    };

    fetchProjects();
  }, [navigate])

  //filter Projects
  useEffect(() => {
    const results = data.filter(
      (project) =>
        (selectedprojectId ? project.id === parseInt(selectedprojectId) : true) &&
        (project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredData(results);
  }, [searchTerm, data, selectedprojectId]);

  const handleprojectSelect = (e) => {
    setSelectedprojectId(e.target.value);
    console.log("Selected project ID:", e.target.value);
  };

  //modal view
  const handleViewClick = (project) => {
    setSelectedProjects(project);
    setShowModal(true);
  };
  //close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleEditprojectClick = (projectId) => {
    navigate(`/edit-project/${projectId}`);
  };

  //handle deleting of project
  const handleDeleteprojectClick = async (projectId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      showCancelButton: true,
      icon: "warning",
      confirmButtonColor: "#EC221F",
      cancelButtonColor: "#00000000",
      cancelTextColor: "#000000",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        container: "custom-container",
        confirmButton: "custom-confirm-button",
        cancelButton: "custom-cancel-button",
        title: "custom-swal-title",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/delete-project/${projectId}`);
          setData(data.filter((project) => project.id !== projectId));
          Swal.fire({
            title: "Success!",
            text: "project has been deleted.",
            imageUrl: check,
            imageWidth: 100,
            imageHeight: 100,
            confirmButtonText: "OK",
            confirmButtonColor: "#0ABAA6",
            customClass: {
              confirmButton: "custom-success-confirm-button",
              title: "custom-swal-title",
            },
          });
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "There was an error deleting the project.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#EC221F",
            customClass: {
              confirmButton: "custom-error-confirm-button",
              title: "custom-swal-title",
            },
          });
        }
      }
    });
  };

  //table columns
  const columns = [
    {
      name: "Project Name",
      selector: (row) => row.project_name,
      sortable: true,
    },
    {
      name: "Project Address",
      selector: (row) => row.project_address,
      sortable: true,
    },
    {
      name: "Project Status",
      selector: (row) => (
        <span
          style={{
            color: row.project_status === "Active" ? "green" : "red",
            marginLeft: 0,
          }}
        >
          {row.project_status}
        </span>
      ),
      sortable: false,
    },
    {
      name: "Project Owner",
      selector: (row) => row.project_owner,
      sortable: true,
    },

    {
      name: "Action",
      selector: (row) => (
        <div>
          <img
            src={view_icon}
            title="View Project Details"
            alt="view"
            width="25"
            height="25"
            onClick={() => handleViewClick(row)}
            style={{ cursor: "pointer" }}
          />
          <img
            className="ml-3"
            src={edit_icon}
            title="Edit project Details"
            onClick={() => handleEditprojectClick(row.id)}
            style={{ cursor: "pointer" }}
            alt="edit"
            width="25"
            height="25"
          />

      {row.project_file && row.project_file.length > 0 && (
        <img
          className="ml-3"
          src={view_model}
          title="View IFC Model"
          alt="view_ifc"
          width="25"
          height="25"
          onClick={() =>
            navigate("/ifc-viewer", {
              state: { fileUrl: row.project_file[0], fileName: row.project_name },
            })
          }
          style={{ cursor: "pointer" }}
        />
      )}

          <img
            className="ml-3"
            src={delete_icon}
            title="Delete project"
            style={{ cursor: "pointer" }}
            onClick={() => handleDeleteprojectClick(row.id)}
            alt="delete"
            width="25"
            height="25"
          />
        </div>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="container">
      <StickyHeader/>
      <div className="row">
        <div className="col-lg-12 col-md-6 custom-content-container">
          <h3 className="title-page">Projects</h3>
          <div className="top-filter">
            <input
              id="search-bar"
              type="text"
              placeholder="Search Project"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => navigate("/add-project")}
              className="btn btn-primary float-end add-user-btn"
            >
              {/* <i className="fa fa-plus"></i>  */}
              Add New Project
            </button>
          </div>
          <div className="container-content">
            <DataTable
              className="dataTables_wrapper"
              columns={columns}
              data={filteredData}
              pagination
              paginationPerPage={20}
              paginationRowsPerPageOptions={[20, 30]}
            />
          </div>
          
        </div>
      </div>

      {selectedProjects && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Project Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="project-container">
              <h2>{selectedProjects.project_name}</h2>
              <h5>Full Address:</h5>
              <p>{selectedProjects.project_address}</p>
              <h5>Status</h5>
              <p>{selectedProjects.project_status}</p>
              <h5>Uploaded Model File Name:</h5>
              <p>{selectedProjects.project_file}</p>
            </div>
          </Modal.Body>
          {/* <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer> */}
        </Modal>
      )}
    </div>
  );
}

export default Projects;
