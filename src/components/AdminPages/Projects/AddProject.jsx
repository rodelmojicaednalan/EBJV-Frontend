import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import check from "../../../assets/images/check.png";
import { FiChevronLeft } from 'react-icons/fi';
import StickyHeader from "../../SideBar/StickyHeader";



function AddNewProject() {
  const [branch, setBranch] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState(""); // Changed to be a dropdown for Australian states
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("Australia"); // Set default country to Australia
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [status, setStatus] = useState("Closed");

  const [error, setError] = useState("");
  const navigate = useNavigate();

  // list of countries
  const australianStates = [
    "New South Wales",
    "Victoria",
    "Queensland",
    "Western Australia",
    "South Australia",
    "Tasmania",
    "Australian Capital Territory",
    "Northern Territory",
  ];

  const addBranch = async (e) => {
    e.preventDefault();

    const branchAddress = `${addressLine1}, ${addressLine2}, ${city}, ${state}, ${zipCode}, ${country}`;

    const operatingHours = {
      open: openTime,
      close: closeTime,
    };

    const newBranchData = {
      branch_name: branch,
      branch_address: branchAddress,
      operating_hours: operatingHours,
      status: status,
    };

    if (!branch || !city || !state || !zipCode || !country || !openTime || !closeTime) {
      setError("All fields are required.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (openTime >= closeTime) {
      setError("Invalid operating hours. Open time should be before close time.");
      setTimeout(() => setError(""), 3000)
      return;
    }

    try {
      await axiosInstance.post("/create-branch", newBranchData);

      setError("");
      setBranch("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setZipCode("");
      setCountry("");
      setOpenTime("");
      setCloseTime("");
      setStatus("");
      Swal.fire({
        title: "Branch Added Successfully",
        text: `${branch} has been added to the system.`,
        imageUrl: check,
        imageWidth: 100,
        imageHeight: 100,
        confirmButtonText: "OK",
        confirmButtonColor: "#0ABAA6",
      }).then(() => {
        navigate("/projects");
      });
    } catch (error) {
      console.error("Error adding branch:", error);
    }
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
        <form onSubmit={addBranch} className="add-branch-form">
          <div style={{ position: "relative", textAlign: "center", justifyContent: "center", alignItems: "center" }}>
            {error && <div className="alert alert-danger" style={{ position: "absolute", left: "25%", top: "-10px", width: "50%", padding: "4px" }}>{error}</div>}
          </div>
          <div className="d-flex justify-content-between ml-5 mr-5 pt-4 mt-3 add-branch-fields">
            <div className="form-group">
              <label>Project Name:</label>
              <input
                type="text"
                className="form-control"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Project Owner:</label>
              <input
                type="text"
                className="form-control"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Project Details:</label>
              <input
                type="text"
                className="form-control"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
            </div>
          </div>

     
          <div className="d-flex justify-content-between ml-5 add-branch-fields">
            <div className="form-group status-field">
              <label>Status:</label>
              <br />
              <select
                className="branch-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="For Review">For Review</option>
              </select>
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
