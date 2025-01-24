import React from "react";
import "./PasswordReset.css";
import email_icon from "../../assets/images/ebjvMail.png";
import { useLocation, useNavigate } from "react-router-dom";

function CheckEmail() {
  const location = useLocation();
  const email = location.state?.email || "your email";
  const navigate = useNavigate();

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-icon">
          <img src={email_icon} alt="lock" />
        </div>
        <h2>Check your email</h2>
        <p>We sent a password reset link to</p>
        <p className="user-email">{email}</p>
        <div className="forgot-password-form">
          <a className="reset-password-btn" href="https://www.gmail.com/">
           Open Email
          </a>{" "}
        </div>
        <a href="/" className="back-to-login">
          ← Back to log in
        </a>
      </div>
    </div>
  );
}

export default CheckEmail;
