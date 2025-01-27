import React, { useState, useEffect } from "react";
import profileAvatar from "../../../assets/images/engineer.png";
import axiosInstance from "../../../../axiosInstance.js";
import Swal from "sweetalert2";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import close from "../../../assets/images/close.png";
import check from "../../../assets/images/check.png";
import "./ProfileStyles.css";

function MyProfile() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [projects, setProjects] = useState([]);
  const [showProjectsModal, setShowProjectsModal] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axiosInstance.get("/user");
        const { username, email, first_name, last_name, roles, projects } = response.data;
        const role = roles.length > 0 ? roles[0].role_name : "No Role";

        setProjects(projects);
        setUsername(username);
        setEmail(email);
        setFirstName(first_name);
        setLastName(last_name);
        setRole(role);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: "Password Mismatch",
        text: "New password and confirm password do not match.",
        imageUrl: close,
        imageWidth: 100,
        imageHeight: 100,
        confirmButtonText: "OK",
        confirmButtonColor: "#EC221F",
      });
      return;
    }

    if (newPassword && newPassword.length < 8) {
      Swal.fire({
        title: "Invalid Password",
        text: "Password must be at least 8 characters long.",
        imageUrl: close,
        imageWidth: 100,
        imageHeight: 100,
        confirmButtonText: "OK",
        confirmButtonColor: "#EC221F",
      });
      return;
    }

    if (!oldPassword) {
      Swal.fire({
        title: "Old Password Required",
        text: "Please enter your old password before making changes.",
        imageUrl: close,
        imageWidth: 100,
        imageHeight: 100,
        confirmButtonText: "OK",
        confirmButtonColor: "#EC221F",
      });
      return;
    }

    try {
      await axiosInstance.put("/update-profile", {
        username,
        email,
        oldPassword,
        newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Swal.fire({
        title: "Profile Updated",
        text: "Your profile has been updated successfully.",
        imageUrl: check,
        imageWidth: 100,
        imageHeight: 100,
        confirmButtonText: "OK",
        confirmButtonColor: "#0ABAA6",
      });
    } catch (error) {
      Swal.fire({
        title: "Update Failed",
        text: error.response?.data?.message || "Something went wrong. Please try again later.",
        imageUrl: close,
        imageWidth: 100,
        imageHeight: 100,
        confirmButtonText: "OK",
        confirmButtonColor: "#EC221F",
      });
    }
  };

  const handleShowProjectsModal = () => setShowProjectsModal(true);
  const handleCloseProjectsModal = () => setShowProjectsModal(false);

  const visibleProjects = projects.slice(0, 5);

  return (
    <div className="custom-profile-container">
      <div className="profile-update">
        <h2>User Information</h2>
        <form onSubmit={handleProfileUpdate}>
          <div className="form-group">
            <label>User Name</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <h2>Change Password</h2>
          <div className="form-group">
            <label>Old Password</label>
            <input
              type="password"
              className="form-control"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button className="submit-btn" type="submit">
            Update Profile
          </button>
        </form>
      </div>

      <div className="profile-user">
        <img src={profileAvatar} alt="Profile Avatar" />
        <h5>{`${first_name} ${last_name}`}</h5>
        <h6>Role: {role}</h6>
        <h6>Projects:</h6>
        <ul className="project-list">
          {visibleProjects.map((project, index) => (
            <li key={index}>{project}</li>
          ))}
        </ul>
        {projects.length > 10 && (
          <button className="view-all-btn" onClick={handleShowProjectsModal}>
            View All Projects
          </button>
        )}
      </div>

      <Modal show={showProjectsModal} onHide={handleCloseProjectsModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>All Projects</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="modal-project-list">
            {projects.map((project, index) => (
              <li key={index}>{project}</li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseProjectsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MyProfile;
