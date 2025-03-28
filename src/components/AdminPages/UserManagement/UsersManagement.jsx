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
import { MdManageAccounts } from "react-icons/md";
import { FaCircleInfo } from "react-icons/fa6";
import { RiEditCircleFill } from "react-icons/ri";
import { TiDelete } from "react-icons/ti";

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
        role_description: roleData.role_description,
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
      hide: 'sm'
    },
    {
      name: "Action",
      selector: (row) => (
        <div>
          <FaCircleInfo
            color="rgba(30, 30, 30, .5)"
            title="View Role Details"
            size={20} // Sets width & height
            style={{ cursor: "pointer" }}
            onClick={() => handleViewRoleDetails(row.id)}
          />
          <RiEditCircleFill
            color="rgba(30, 30, 30, .7)"
            className="ml-2"
            title="Edit Role"
            onClick={() => navigate(`/edit-user-role/${row.id}`)}
            size={22}
            style={{ cursor: "pointer" }}
          />
          {row.role_name !== "Admin" && row.role_name !== "Client" && row.role_name !== "Superadmin" && (
          <TiDelete
                  color='rgba(225,12,0, .7)'
            onClick={() => handleDeleteUserClick(row.id)}
            style={{ cursor: "pointer" }}
            size={28}
            title="Delete User"
            className="ml-1"
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
                className={`btn btn-primary float-end ${
                  isMobile ? 'mobile-add-user-btn' : 'add-user-btn'
                }`}
                id="add-new-project-btn"
              >
                {/* <i className="fa fa-plus"></i>  */}
                {isMobile ? <MdManageAccounts /> : <span> Add a role </span>}
                {/* Add Project */}
              </button>
            <br></br>
          </div>
          <div style={{ height: "20px" }}></div>
          <div className="container-content">
            <DataTable
              id="role-table"
              className="dataTables_wrapper"
              columns={columns}
              data={roles}
              responsive
            />
          </div>
        </div>
      </div>

      {selectedUserRole && (
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title> {selectedUserRole.role_name} Permissions </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label className="modal-role-desc">{selectedUserRole.role_description}</label> <br/>
            <label> Permissions: </label>
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
