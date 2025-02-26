import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';
import rme_login_image from '../../assets/images/ebjv-logo.png';
import formheaderImage from '../../assets/images/ebjvLogo-transparent.png';
import axiosInstance from '../../../axiosInstance.js';
// import Swal from 'sweetalert2'
// import close from "../../assets/images/close.png";

import useWindowWidth from '../AdminPages/Projects/ProjectFolderPages/windowWidthHook.jsx';

function Login() {
  const windowWidthHook = useWindowWidth();
  const isTabMobile = windowWidthHook <= 768;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState({ value: '', isShow: false });
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosInstance.post('/login', {
        username,
        password,
      });

      const { user, accessToken, refreshToken, roleName } =
        response.data;

      document.cookie = `role_name=${roleName}; Path=/;`;
      document.cookie = `accessToken=${accessToken}; Path=/;`;
      document.cookie = `refreshToken=${refreshToken}; Path=/; `;

      if (rememberMe) {
        document.cookie = `rememberUsername=${username}; Path=/; Secure;`;
        document.cookie = `rememberPassword=${btoa(
          password
        )}; Path=/; Secure;`; // Encode the password
      } else {
        // Clear stored credentials if "Remember Me" is not checked
        document.cookie = `rememberUsername=; Path=/; Max-Age=0;`;
        document.cookie = `rememberPassword=; Path=/; Max-Age=0;`;
      }

      localStorage.setItem('loginSuccess', 'true');

      const redirectTo =
        location.state?.from ||
        localStorage.getItem('originalUrl') ||
        '/projects';

      // Clear the stored URL
      localStorage.removeItem('originalUrl');

      navigate(redirectTo);
    } catch (error) {
      console.error('Login error:', error);
      alert('Invalid login, please try again.');
    }
  };

  return (
    <div className="login-container-wrapper">
      <div className="d-flex align-items-center justify-content-around custom-login">
        <div className="d-flex ">
          <div className=" login-leftCol">
            {/* <div className="header-title mt-5">
                        <h1>EBJV Construction <br></br> Modelling Portal</h1>
                        <br />

                    </div> */}
            <div className="bg-image">
              <img
                className="img-fluid login_image"
                src={rme_login_image}
                alt="Login"
              />
            </div>
          </div>
        </div>

        <div className="d-flex login-form-body mb-5">
          {isTabMobile ? (
            <div className="form-header d-flex justify-content-center mb-2">
              <img src={formheaderImage} className="header-image" />
            </div>
          ) : (
            ''
          )}

          <div className="">
            <div
              className="card p-4 login-form-wrap"
              style={{ width: '450px' }}
            >
              <h2 className="text-center">Enter the Workspace</h2>
              <label className="text-center">
                {' '}
                Manage, Build, and Innovate with Ease.{' '}
              </label>
              {error.value !== '' && error.isShow && (
                <div className="alert alert-danger">
                  {error.value}
                  <div
                    className="close-quick-alert"
                    onClick={() =>
                      setError({ ...error, isShow: false })
                    }
                  ></div>
                </div>
              )}
              <form onSubmit={login}>
                <label htmlFor="username">Username</label>
                <br />
                <div className="form-group mb-3 ">
                  <input
                    type="text"
                    id="username"
                    className="form-control-lg w-100 mb-2"
                    value={username}
                    // placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <label htmlFor="password">Password</label>
                <br />
                <div className="form-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="form-control-lg w-100"
                    value={password}
                    // placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="form-group group-field-password">
                  <div className="d-flex flex-row align-items-center">
                    <input
                      type="checkbox"
                      id="showPassword"
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                    />{' '}
                    &nbsp;
                    <label id="showPassLabel" htmlFor="showPassword">
                      Show Password
                    </label>
                  </div>

                  <div className="d-flex flex-row align-items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />{' '}
                    &nbsp;
                    <label id="rememberMeLabel" htmlFor="rememberMe">
                      Remember Me
                    </label>
                  </div>
                </div>
                <div className="form-group group-field-password mb-0">
                  <a
                    style={{ cursor: 'pointer' }}
                    className="forgot-password-btn float-end"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="d-flex justify-content-left mt-1">
                  <button type="submit" className="mt-2 custom-btn">
                    Login
                  </button>
                </div>
                <div className="request-btn mt-3 d-flex justify-content-center">
                  <a
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/request-access-form')}
                  >
                    Don&apos;t have an account?{' '}
                    <strong> Send a request </strong>
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
