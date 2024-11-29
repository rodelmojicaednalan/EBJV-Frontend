import React, { useState, useEffect } from "react";
import { /*useLocation*/ useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../../../../axiosInstance.js";
import check from "../../../assets/images/check.png";
import { FiChevronLeft } from 'react-icons/fi';
import StickyHeader from "../../SideBar/StickyHeader";



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
    <div className="container">
      <StickyHeader/>
       <a href="/user-management" className="back-btn">
        <h3 className="title-page">
          <FiChevronLeft className="icon-left" /> Update Role
        </h3>
      </a>
      <div className="container-content">
        <form onSubmit={updateUserRole}>
          <div className="form-group ml-5 mt-3">
            <label>Role Name:</label>
            <input
              type="text"
              className="form-control col-lg-3"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Enter new role name"
            />
          </div>
          <div className="form-group ml-5 mt-3">
            <label>Role Description:</label>
            <textarea
              type="text"
              className="form-control col-lg-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter new description for this role"
            />
          </div>
          <button className="submit-btn mb-4 mt-4" type="submit">
            UPDATE
          </button>
        </form>
      </div>
    </div>
  );
}


export default EditUserRole;
