import React, { useState, useEffect } from "react";
import { /*useLocation*/ useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../../../../axiosInstance.js";
import check from "../../../assets/images/check.png";
import { FaCircleArrowLeft } from "react-icons/fa6";
import '../UsersList/EditUser.css'

function EditUserRole() {
  //const location = useLocation();
  //const { roleData } = location.state || {};

  const navigate = useNavigate();
  const { roleId } = useParams();

  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchRoleData = async () => {
      if (roleId) {
        try {
          const response = await axiosInstance.get(`/role/${roleId}`);
          const roleInfo = response.data; 
      
          setRole(roleInfo.role_name);
          setDescription(roleInfo.role_description);
        
        } catch (error) {
          console.error(
            "Error fetching role data:",
            error.response ? error.response.data : error.message
          );
        }
      }
    };
    fetchRoleData();
  }, [roleId]);

  const updateUserRole = async (e) => {
    e.preventDefault();

    const updatedRoleData = {
      role_name: role,
     role_description: description,
    };

    try {
      const roleResponse = await axiosInstance.put(
        `/update-role/${roleId}`,
        updatedRoleData
      );
      if (roleResponse && roleResponse.data) {
        Swal.fire({
          title: "Role Updated Successfully",
          text: `The role has been updated!`,
          imageUrl: check,
        imageWidth: 100,  
        imageHeight: 100, 
          confirmButtonText: "OK",
          confirmButtonColor: "#0ABAA6",
        }).then(() => {
          navigate("/user-management");
        });
      } else {
        console.error("Unexpected response structure:", roleResponse);
      }
    } catch (error) {
      console.error("Error updating role or assigning permissions:", error);
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

      <form onSubmit={updateUserRole} className="">
        <div className="addUser-form-container">
        <div className="addUser-form-header">
            <h4 className="addUser-form-title">Edit Role</h4>
          </div>

          <div className="addUser-form-body">
            <div className="form-body">
              <div className="form-group">
                <label>New Role Name:</label>
                <input
                  type="text"
                  className="form-control "
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role Description:</label>
                <textarea
                  className="form-control "
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  Save Changes
                </button>
              </div>
            </div>

          </div>
          </div>
        </form>
    </div>
  );
}


export default EditUserRole;
