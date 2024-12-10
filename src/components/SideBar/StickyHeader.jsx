import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import man from "../../assets/images/man.png";
import woman from "../../assets/images/woman.png";
import axiosInstance from "../../../axiosInstance.js";

const StickyHeader = () => {
  const navigate = useNavigate();
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [sex, setSex] = useState("");
  const [email, setEmail] = useState("");

  // Fetch current user details
  const fetchUserDetails = async () => {
    try {
      const response = await axiosInstance.get("/user");
      const { first_name, last_name, email, sex } = response.data;
      setFirstName(first_name);
      setLastName(last_name);
      setEmail(email);
      setSex(sex);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []); // Empty dependency array to run only once after the component mounts

  return (
    <div className="sticky-header-container">
      <div className="sticky-header">
        
        <div className="profile" onClick={() => navigate("/my-profile")}>
          <img
            src={sex === "Male" ? man : woman}
            className="profile_avatar"
            alt="Profile Avatar"
          />
          <div>
            <span>
              <h5 className="ellipsis">
                {first_name} {last_name}
              </h5>
            </span>
            <span>
              <p className="email-text ellipsis">{email}</p>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyHeader;
