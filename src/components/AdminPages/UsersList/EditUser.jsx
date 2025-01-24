import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../axiosInstance.js';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import check from '../../../assets/images/check.png';
import { FaCircleArrowLeft } from "react-icons/fa6";
import './EditUser.css';

function EditUser() {
  const { userId } = useParams();
  const [last_name, setLastname] = useState('');
  const [first_name, setFirstname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role_name, setRoleName] = useState('');
  const [role, setRoles] = useState([]);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Fetch roles
    const fetchRoles = async () => {
      try {
        const response = await axiosInstance.get('/roles');
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();

    const fetchUserData = async () => {
      if (userId) {
        try {
          const response = await axiosInstance.get(`/user/${userId}`);
          const userData = response.data;
          setLastname(userData.last_name);
          setFirstname(userData.first_name);
          setConfirmPassword(userData.password);
          setEmail(userData.email);
          setPassword(userData.password);
          setUsername(userData.username);
          setRoleName(
            userData.roles?.map((r) => r.role_name).join(', ')
          );
        } catch (error) {
          console.error(
            'Error fetching user data:',
            error.response ? error.response.data : error.message
          );
        }
      }
    };

    fetchUserData();
  }, [userId]);

  const validateForm = () => {
    if (
      !last_name ||
      !first_name ||
      !password ||
      !confirmPassword ||
      !email ||
      !username ||
      !role_name
    ) {
      return 'All fields are required.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return 'Invalid email format.';
    }
    return '';
  };

  const editUser = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setTimeout(() => {
        setError('');
      }, 3000);

      return;
    }

    try {
      const response = await axiosInstance.put(
        `/update-user/${userId}`,
        {
          last_name,
          first_name,
          password,
          email,
          username,
          role_name,
        }
      );

      // setSuccessMessage("User added successfully!");
      setError('');
      setLastname('');
      setFirstname('');
      setPassword('');
      setConfirmPassword('');
      setEmail('');
      setUsername('');
      setRoleName('');
      Swal.fire({
        title: 'User Updated Successfully',
        text: `The user ${first_name} ${last_name} has been updated.`,
        imageUrl: check,
        imageWidth: 100,
        imageHeight: 100,
        confirmButtonText: 'OK',
        confirmButtonColor: '#0ABAA6',
      }).then(() => {
        // Redirect to user list
        navigate('/userlist');
      });
    } catch (error) {
      setError('Failed to add user. Please try again.');
    }
  };

  return (
     <div className="addUser-form-page pb-5">
          <a onClick={() => navigate("/userlist")} className="back-btn">
            <h3 className="m-3">
              <FaCircleArrowLeft size={30} className="icon-left" /> Go back
            </h3>
          </a>
     
            <form onSubmit={editUser} className="">
            <div className="addUser-form-container">
            <div className="addUser-form-header">
                <h4 className="addUser-form-title">Edit User Form</h4>
              </div>
    
              <div className="addUser-form-body">
                <div className="form-body">
                          
                <div className="form-group">
                    <label htmlFor="roleName">Role:</label>
                    <div id="roleName" className="d-flex justify-content-around">
                      {role.map((role) => (
                        <div key={role.id} className="form-check">
                          <input
                            type="radio"
                            id={`role-${role.id}`}
                            name="roleName"
                            value={role.role_name}
                            checked={role_name === role.role_name}
                            onChange={(e) => setRoleName(e.target.value)}
                            className="form-check-input"
                            required
                          />
                          <label htmlFor={`role-${role.id}`} className="form-check-label">
                            {role.role_name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
    
                  <div className="form-group-multiple mb-3">
                    <div className="form-group">
                      <label htmlFor="lastName">Surname:</label>
                      <input
                        type="text"
                        id="lastName"
                        className="form-control"
                        value={last_name}
                        onChange={(e) => setLastname(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="firstName">First Name:</label>
                      <input
                        type="text"
                        id="firstName"
                        className="form-control"
                        value={first_name}
                        onChange={(e) => setFirstname(e.target.value)}
                        required
                      />
                    </div>
                  </div>
    
                  <div className="form-group-multiple mb-3">
                    <div className="form-group">
                      <label htmlFor="userName">Username:</label>
                      <input
                        type="text"
                        id="userName"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email:</label>
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
    
                  <div className="form-group-multiple mb-3">
                    <div className="form-group">
                      <label htmlFor="password">Password:</label>
                      <input
                        type="password"
                        id="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm Password:</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
    
                <div className="access-btn-group">
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

export default EditUser;
