// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import "../../../App.css";
import "font-awesome/css/font-awesome.min.css";
import view_icon from "../../../assets/images/list-view.png";
import edit_icon from "../../../assets/images/edit-details.png";
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
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const { setLoading } = useLoader();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/branches");
        const formattedData = response.data.map((branch) => {
          const parsedOperatingHours = JSON.parse(branch.operating_hours); // Parse first

          return {
            id: branch.id,
            branch_name: branch.branch_name,
            address: formatAddress(branch.branch_address),
            operating_hours: parsedOperatingHours,
            status: getBranchStatus({
              ...branch,
              operating_hours: parsedOperatingHours,
            }), // Pass parsed data here
          };
        });
        setData(formattedData);
        setFilteredData(formattedData);
      } catch (error) {
        console.error("Error fetching Projects:", error);
      } finally {
        setLoading(false);
      }
    };

    const formatAddress = (address) => {
      return address
        .split(",") // Split the address into parts based on commas
        .map((part) => part.trim()) // Remove extra spaces from each part
        .filter((part) => part.length > 0) // Filter out empty parts
        .join(", "); // Join the remaining parts back together with a comma
    };

    fetchProjects();
  }, [navigate]);

  //filter Projects
  useEffect(() => {
    const results = data.filter(
      (branch) =>
        (selectedBranchId ? branch.id === parseInt(selectedBranchId) : true) &&
        (branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          branch.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredData(results);
  }, [searchTerm, data, selectedBranchId]);

  const handleBranchSelect = (e) => {
    setSelectedBranchId(e.target.value);
    console.log("Selected Branch ID:", e.target.value);
  };

  const getBranchStatus = (branch) => {
    if (!branch.operating_hours || typeof branch.operating_hours !== "object") {
      return "Undefined";
    }
    const currentTime = new Date();
    const options = {
      timeZone: "Australia/Sydney",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const formatter = new Intl.DateTimeFormat([], options);
    const [hours, minutes, seconds] = formatter.format(currentTime).split(":");
    const currentSeconds =
      parseInt(hours, 10) * 3600 +
      parseInt(minutes, 10) * 60 +
      parseInt(seconds, 10);

    const openTime = branch.operating_hours.open.split(":");
    const closeTime = branch.operating_hours.close.split(":");

    const openSeconds =
      parseInt(openTime[0], 10) * 3600 +
      parseInt(openTime[1], 10) * 60 +
      parseInt(openTime[2] || 0, 10);
    let closeSeconds =
      parseInt(closeTime[0], 10) * 3600 +
      parseInt(closeTime[1], 10) * 60 +
      parseInt(closeTime[2] || 0, 10);

    if (closeSeconds < openSeconds) {
      closeSeconds += 24 * 3600;
    }

    return currentSeconds >= openSeconds && currentSeconds <= closeSeconds
      ? "Open"
      : "Closed";
  };

  //modal view
  const handleViewClick = (branch) => {
    setSelectedProjects(branch);
    setShowModal(true);
  };
  //close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleEditBranchClick = (branchId) => {
    navigate(`/edit-project/${branchId}`);
  };

  //handle deleting of branch
  const handleDeleteBranchClick = async (branchId) => {
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
          await axiosInstance.delete(`/delete-branch/${branchId}`);
          setData(data.filter((branch) => branch.id !== branchId));
          Swal.fire({
            title: "Success!",
            text: "Branch has been deleted.",
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
            text: "There was an error deleting the branch.",
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
      name: "Branch",
      selector: (row) => row.branch_name,
      sortable: true,
    },
    {
      name: "Address",
      selector: (row) => row.address,
      sortable: true,
    },
    {
      name: "Operating Hours",
      selector: (row) => {
        if (typeof row.operating_hours === "object") {
          return `${row.operating_hours.open} - ${row.operating_hours.close}`;
        }
        return row.operating_hours;
      },
      sortable: false,
    },
    {
      name: "Status",
      selector: (row) => (
        <span
          style={{
            color: row.status === "Open" ? "green" : "red",
            marginLeft: 0,
          }}
        >
          {row.status}
        </span>
      ),
      sortable: false,
    },

    {
      name: "Action",
      selector: (row) => (
        <div>
          <img
            src={view_icon}
            title="View Branch Details"
            alt="view"
            width="25"
            height="25"
            onClick={() => handleViewClick(row)}
            style={{ cursor: "pointer" }}
          />
          <img
            className="ml-3"
            src={edit_icon}
            title="Edit Branch Details"
            onClick={() => handleEditBranchClick(row.id)}
            style={{ cursor: "pointer" }}
            alt="edit"
            width="25"
            height="25"
          />

          <img
            className="ml-3"
            src={delete_icon}
            title="Delete Branch"
            style={{ cursor: "pointer" }}
            onClick={() => handleDeleteBranchClick(row.id)}
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
            <select
              name="filter"
              id="filter"
              onChange={handleBranchSelect}
              value={selectedBranchId}
            >
              <option value="">All Projects</option>
              {data.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
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
            <Modal.Title>Branch Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="branch-container">
              <h2>{selectedProjects.branch_name}</h2>
              <h5>Full Address:</h5>
              <p>{selectedProjects.address}</p>
              <h5>Operating Hours</h5>
              <p>
                Open: {selectedProjects.operating_hours?.open} - Close:{" "}
                {selectedProjects.operating_hours?.close}
              </p>
              <h5>Status</h5>
              <p>{selectedProjects.status}</p>
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
