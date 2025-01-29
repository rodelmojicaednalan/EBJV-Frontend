import React, { useState } from "react";
import axiosInstance from "../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import check from "../../../assets/images/check.png";
import { FaCircleArrowLeft } from "react-icons/fa6";
import '../UsersList/EditUser.css'

function AddNewRole() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [roleDescription, setRoleDescription] = useState("");

  const defaultPermissions = [
    { permission_name: "Generate Ticket", permission_id: 1 },
    { permission_name: "View Ticket History", permission_id: 4 },
    { permission_name: "Manage Account", permission_id: 7 },
  ];

  const addUserRole = async (e) => {
    e.preventDefault();

    const roleData = {
      role_name: role,
      role_description: roleDescription,
    };

    try {
      // Create the role first
      const roleResponse = await axiosInstance.post("/create-role", roleData);
      const { message } = roleResponse.data;

      if (roleResponse && roleResponse.data) {
        const newRoleId = parseInt(message.split(": ")[1]);

        for (const permission of defaultPermissions) {
          await axiosInstance.post("/create-rolePermission", {
            role_id: newRoleId,
            permission_id: permission.permission_id,
          });
        }

        console.log("All selected permissions assigned successfully.");
      }

      // Success alert
      Swal.fire({
        title: "Role Added Successfully",
        text: `New Role added!`,
        imageUrl: check,
        imageWidth: 100,
        imageHeight: 100,
        confirmButtonText: "OK",
        confirmButtonColor: "#0ABAA6",
      }).then(() => {
        navigate("/user-management");
      });
    } catch (error) {
      console.error("Error creating role or assigning permissions:", error);
      if (error.response) {
        console.error("Server responded with an error:", error.response);
      } else if (error.request) {
        console.error("No response received from server:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
    }
  };

  return (
    <div className="addUser-form-page pb-5">
       <a onClick={() => navigate("/user-management")} className="back-btn">
          <h3 className="m-3">
            <FaCircleArrowLeft size={30} className="icon-left" /> Go back
          </h3>
        </a>

      <form onSubmit={addUserRole} className="">
        <div className="addUser-form-container">
        <div className="addUser-form-header">
            <h4 className="addUser-form-title">Add New Role</h4>
          </div>

          <div className="addUser-form-body">
            <div className="form-body">

      
              <div className="form-group">
                <label>New Role Name:</label>
                <input
                  type="text"
                  className="form-control col-lg-3"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role Description:</label>
                <textarea
                  className="form-control col-lg-3"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  required
                />
              </div>

            </div>

            <div className="access-btn-group mt-3">
              <div className="access-btn-group-item">
                <button
                  type="submit"
                  className="btn btn-primary login-btn"
                >
                  Add Role
                </button>
              </div>
            </div>

          </div>
          </div>
        </form>

    </div>
  );
}

export default AddNewRole;
