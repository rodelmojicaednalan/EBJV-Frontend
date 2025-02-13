import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import "../../../App.css";
import "font-awesome/css/font-awesome.min.css";
import view_icon from "../../../assets/images/list-view.png";
import edit_icon from "../../../assets/images/edit-details.png";
import delete_icon from "../../../assets/images/delete-log.png";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import axiosInstance from "../../../../axiosInstance.js";
import check from "../../../assets/images/check.png";
import { useLoader } from "../../Loaders/LoaderContext";
import useWindowWidth from "../Projects/ProjectFolderPages/windowWidthHook.jsx";
function UserRoleManagement() {
  const navigate = useNavigate();
  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const [selectedUserRole, setSelectedUserRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { setLoading } = useLoader();

  // Get all roles
  useEffect(() => {
    setLoading(true);
    const fetchRoles = async () => {
      try {
        const response = await axiosInstance.get("/roles");
        setRoles(response.data);
        // console.log(response.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const fetchRoleDetails = async (roleId) => {
    try {
      const response = await axiosInstance.get(`/role/${roleId}`);
      const roleData = response.data;
      setSelectedUserRole({
        role_name: roleData.role_name,
        permissions: roleData.permissions,
      });
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching role details:", error);
    }
  };

  const handleDeleteUserClick = async (roleId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!.",
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
          await axiosInstance.delete(`/delete-role/${roleId}`);
          setRoles(roles.filter((role) => role.id !== roleId));
          Swal.fire({
            title: "Success!",
            text: "Role has been deleted.",
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
            text: "There was an error deleting the role.",
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
  const handleViewRoleDetails = (roleId) => {
    fetchRoleDetails(roleId);
  };
  // Modal view
  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Table columns
  const columns = [
    {
      name: "Role",
      selector: (row) => row.role_name,
      sortable: true,
    },
    {
      name: "Role Description",
      selector: (row) => row.role_description,
      sortable: true,
    },
    {
      name: "Action",
      selector: (row) => (
        <div>
          <img
            src={view_icon}
            title="View Role Details"
            alt="view"
            width="25"
            height="25"
            onClick={() => handleViewRoleDetails(row.id)}
            style={{ cursor: "pointer" }}
          />
          <img
            className="ml-3"
            src={edit_icon}
            title="Edit Role"
            onClick={() => navigate(`/edit-user-role/${row.id}`)}
            alt="edit"
            width="25"
            height="25"
            style={{ cursor: "pointer" }}
          />
          {row.role_name !== "Admin" && row.role_name !== "Client" && row.role_name !== "Superadmin" && (
            <img
              className="ml-3"
              src={delete_icon}
              title="Delete Role"
              alt="delete"
              width="25"
              height="25"
              onClick={() => handleDeleteUserClick(row.id)}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="container">
      {/* <StickyHeader /> */}
      <div className="row">
        <div className="col-lg-12 col-md-6 custom-content-container">
          {/* <h3 className="title-page">User Role Management</h3> */}
          <div className="top-filter">
            <button
              onClick={() => navigate("/add-new-role")}
              className="btn btn-primary float-start add-user-btn"
            >
              Add New Role
            </button>
            <br></br>
          </div>
          <div style={{ height: "20px" }}></div>
          <div className="container-content">
            <DataTable
              className="dataTables_wrapper"
              columns={columns}
              data={roles}
            />
          </div>
        </div>
      </div>

      {selectedUserRole && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Role Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h2>{selectedUserRole.role_name} Permissions</h2>
             {selectedUserRole.permissions
              .map((permission, index) => (
                <p key={index}>{permission.permission_name}</p>
              ))} 
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}

export default UserRoleManagement;
