import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import "../../../App.css";
import "font-awesome/css/font-awesome.min.css";
import view_icon from "../../../assets/images/view-details.png";
import edit_icon from "../../../assets/images/edit-details.png";
import delete_icon from "../../../assets/images/delete-log.png";
import userIcon from "../../../assets/images/engineer.png"
import check from "../../../assets/images/check.png";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import axiosInstance from "../../../../axiosInstance.js";
import { useLoader } from "../../Loaders/LoaderContext";
import "./UserList.css";
import useWindowWidth from "../Projects/ProjectFolderPages/windowWidthHook.jsx";

import { IoPersonAdd } from "react-icons/io5";

function UsersList() {
  const navigate = useNavigate();
  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");

  const { setLoading } = useLoader();
  useEffect(() => {
    // success login swal
    if (localStorage.getItem("loginSuccess") === "true") {
      // Swal.fire({
      //   title: "Login Successful",
      //   text: `Welcome`,
      //   imageUrl: check,
      //   imageWidth: 100,
      //   imageHeight: 100,
      //   confirmButtonText: "OK",
      //   confirmButtonColor: "#0ABAA6",
      // });

      localStorage.removeItem("loginSuccess");
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/users");
        setUsers(response.data);
        setFilteredUsers(response.data);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // console.log(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await axiosInstance.get("/roles");
        setRoles(response.data);
      } catch (error) {
        console.error(response.status.error);
      }
    };

    fetchUsers();
    fetchRoles();
  }, [navigate]);

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const response = await axiosInstance.get("/user"); // Adjust the endpoint if needed
        setLoggedInUser(response.data); // Assuming response contains user data
      } catch (error) {
        console.error("Error fetching logged-in user:", error);
      }
    };

    fetchLoggedInUser();
  }, []);


  useEffect(() => {
    // Filter users whenever the filter or search state changes
    const applyFilters = () => {
      if (!loggedInUser) return;

      let tempUsers = users.filter((user) => user.id !== loggedInUser.id);

      if (roleFilter) {
        tempUsers = tempUsers.filter(
          (user) =>
            user.roles?.map((r) => r.role_name).join(", ") === roleFilter
        );
      }

      if (search) {
        tempUsers = tempUsers.filter((user) =>
          `${user.first_name} ${user.last_name}`
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      }


      setFilteredUsers(tempUsers);
    };

    applyFilters();
  }, [filter, roleFilter, search, users, loggedInUser]);

  const handleViewClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleEditUserClick = (userId) => {
    navigate(`/edit-user/${userId}`);
  };

  const handleDeleteUserClick = async (userId) => {
    if (loggedInUser && userId === loggedInUser.id) {
      Swal.fire({
        icon: "error",
        title: "Cannot Delete Your Own Account",
        text: "You cannot delete your own account.",
      });
      return;
    }

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
          await axiosInstance.delete(`/delete-user/${userId}`);
          setUsers(users.filter((user) => user.id !== userId));
          setFilteredUsers(filteredUsers.filter((user) => user.id !== userId));
          Swal.fire({
            title: "Success!",
            text: "User has been deleted.",
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
            text: "There was an error deleting the user.",
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

  const columns = [
    {
      name: "Name",
      // width: "40%",
      selector: (row) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            className="profile-image"
            src={userIcon}
            alt={row.last_name}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              marginRight: "10px",
            }}
          />

          <div className="user-details">
            <span>
              {" "}
              {row.first_name} {row.last_name}
            </span>
            <span className="user-email-row">{row.email}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    //  {
    //   name: "Email",
    //   // width: "25%",
    //    selector: (row) => row.email || "N/A",
    //    sortable: true,
    //  },
     {
       name: "Username",
      //  width: "15%",
       selector: (row) => row.username || "N/A",
       sortable: true,
       hide: 'sm'
     },
    {
      name: "Role",
      // width: "15%",
      selector: (row) => row.roles?.map((r) => r.role_name).join(", ") || "N/A",
      sortable: true,
      hide: 'sm'
    },
    {
      name: "Action",
      // width: "15%",
      selector: (row) => (
        <div>
          <img
            src={view_icon}
            title="View User Details"
            alt="view"
            width="20"
            height="20"
            onClick={() =>
              handleViewClick({
                name: `${row.first_name} ${row.last_name}`,
                email: row.email,
                username: row.username,
                branch:
                  row.branches?.map((r) => r.branch_name).join(", ") || "N/A",
                role: row.roles?.map((r) => r.role_name).join(", ") || "N/A",
                profileImage: userIcon,
              })
            }
            style={{ cursor: "pointer" }}
          />
          <img
            className="ml-2"
            src={edit_icon}
            title="Edit User Details"
            onClick={() => handleEditUserClick(row.id)}
            alt="edit"
            width="20"
            height="20"
            style={{ cursor: "pointer" }}
          />
          {loggedInUser && row.id !== loggedInUser.id && (
            <img
              className="ml-2"
              src={delete_icon}
              title="Delete User"
              alt="delete"
              width="20"
              height="20"
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
          {/* <h3 className="title-page">Client Management</h3> */}

          <div className="top-filter">
            <input
              id="search-bar"
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => navigate("/add-new-user")}
              id="addUser-button"
              className={`btn btn-primary float-end ${isMobile ? 'mobile-add-user-btn' : 'add-user-btn'}`}
            >
             {isMobile? <IoPersonAdd/> : <span> Add User </span>}
            </button>
          </div>

          <div className="container-content mb-5" id="userlist-container">
            <DataTable
              className="dataTables_wrapper"
              columns={columns}
              data={filteredUsers}
              pagination={filteredUsers.length >= 20}
              paginationPerPage={20}
              paginationRowsPerPageOptions={[20, 30]}
              responsive
            />
          </div>
        </div>
      </div>

      {selectedUser && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Acccount Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="profile-container">
              <div className="profile-image">
                <img src={selectedUser.profileImage} alt={selectedUser.name} />
              </div>
              <div className="profile-details">
                <h2>{selectedUser.name}</h2>
                <div className="user-details">
                  <div>
                    Username:<p>{selectedUser.username}</p>
                  </div>
                  <div>
                    Role: <p>{selectedUser.role}</p>
                  </div>
                  <div>
                    Email:
                    <p className="email-text">{selectedUser.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}

export default UsersList;
