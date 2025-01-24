import React, { useState } from "react";
import "./PasswordReset.css";
import password_icon from "../../assets/images/resetPassword.png";
import { useNavigate , useParams } from "react-router-dom";
import axiosInstance from "../../../axiosInstance.js";

// Mock data
const users = [
  { email: "test@example.com", password: "123456" },
];

function ResetPassword() {
  const [email, setEmail] = useState("test@example.com"); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(true);
  const navigate = useNavigate();
  const { passwordToken } = useParams();

  const handleResetPassword = async (e) => {
    e.preventDefault(); 
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setHasError(true);
      return;
    }
  

    try {
      const response = await axiosInstance.post("/confirm-reset-password", {
        token : passwordToken , 
        newPassword : password
       });
       setHasError(false);
      setMessage("Password reset successful!");
      setTimeout(() => navigate("/login"), 2000);
      console.log("No Redirect");
    } catch (error) {
      setMessage("Password reset request is not found.");
      setHasError(true);
    }


  };

  const handleHideAlert = async (e) => {
    setMessage("");
    setHasError(false);
  }
  
  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-icon">
          <img src={password_icon} alt="lock" />
        </div>
        <h2>Reset your password</h2>
          {message && <p className={`alert ${hasError ? "message alert-danger" : "message alert-success"}`}>
            {message} 
            {hasError &&  <div className={"close-quick-alert"} onClick={handleHideAlert}></div>}
          </p>}
        <form className="forgot-password-form" onSubmit={handleResetPassword}>
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            // placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            // placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="reset-password-btn">
            Reset Password
          </button>
        </form>
        <a href="/" className="back-to-login">
          ← Back to log in
        </a>
      </div>
    </div>
  );
}

export default ResetPassword;
