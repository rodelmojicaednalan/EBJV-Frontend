import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../axiosInstance.js';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import check from '../../../assets/images/check.png';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { FiChevronLeft } from 'react-icons/fi';
import StickyHeader from '../../SideBar/StickyHeader';
import './EditUser.css';

const animatedComponents = makeAnimated();

function EditUser() {
  const { userId } = useParams();
  const [last_name, setLastname] = useState('');
  const [first_name, setFirstname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role_name, setRoleName] = useState('');
  const [role, setRoles] = useState([]);
  const [email, setEmail] = useState('');
  const [sex, setSex] = useState('');
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
          setSex(userData.sex);
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
      !sex ||
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
          sex,
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
      setSex('');
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
    <div className="container">
      <StickyHeader />
      <a href="/userlist" className="back-btn">
        <h3 className="title-page">
          <FiChevronLeft className="icon-left" />
          Update User
        </h3>
      </a>
      <div className="container-content">
        <form onSubmit={editUser} className="add-user-form">
          <div
            style={{
              position: 'relative',
              textAlign: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {error && (
              <div
                className="alert alert-danger"
                style={{
                  position: 'absolute',
                  left: '25%',
                  top: '-10px',
                  width: '50%',
                  padding: '4px',
                }}
              >
                {error}
              </div>
            )}
          </div>

          <div className="row ml-5 mr-5 pt-4 mt-3 add-user-fields">
            <div className="col-md-4 form-group">
              <label className="asd">Last Name:</label>
              <input
                type="text"
                className="form-control"
                value={last_name}
                onChange={(e) => setLastname(e.target.value)}
              />
            </div>
            <div className="col-md-4 form-group">
              <label>First Name:</label>
              <input
                type="text"
                className="form-control"
                value={first_name}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </div>
            <div className="col-md-4 form-group">
              <label>Sex:</label>
              <select
                className="form-control"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="row ml-5 mr-5 add-user-fields">
            <div className="col-md-4 form-group">
              <label>Username:</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="col-md-4 form-group">
              <label>Password:</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="col-md-4 form-group">
              <label>Confirm Password:</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="row ml-5 mr-5 add-user-fields">
            <div className="col-md-6 form-group">
              <label>Role:</label>
              <select
                className="form-control"
                value={role_name}
                onChange={(e) => setRoleName(e.target.value)}
              >
                <option value="">Select Role</option>
                {role.map((role) => (
                  <option key={role.id} value={role.role_name}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 form-group">
              <label>Email:</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            className="btn btn-primary submit-btn mb-4 mt-5"
            type="submit"
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditUser;
