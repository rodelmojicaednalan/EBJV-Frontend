// AccessRequest.jsx
import React, {useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Access.css'
import axiosInstance from '../../../axiosInstance';
import { getCookie } from '../Authentication/getCookie'
const AccessRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();   

  const originalUrl = location.state?.from;


  useEffect(() => {
    if (originalUrl) {
      localStorage.setItem('originalUrl', originalUrl);
    }

    const storedUsername = getCookie('rememberUsername');
    const storedPassword = getCookie('rememberPassword');

    if (storedUsername && storedPassword) {
      // Automatically log the user in
      const autoLogin = async () => {
        try {
          const response = await axiosInstance.post('/login', {
            username: storedUsername,
            password: atob(storedPassword), // Decode the stored password
          });

          const { accessToken, refreshToken, roleName } = response.data;

          // Save tokens and role name in cookies
          document.cookie = `role_name=${roleName}; Path=/;`;
          document.cookie = `accessToken=${accessToken}; Path=/;`;
          document.cookie = `refreshToken=${refreshToken}; Path=/;`;

          // Redirect to the original URL or fallback to projects
          const redirectTo = originalUrl || '/projects';
          navigate(redirectTo);
        } catch (error) {
          console.error('Auto-login failed:', error);
          // Handle failed auto-login (e.g., prompt the user to log in manually)
        }
      };

      autoLogin();
    }

  }, [originalUrl, navigate]);

  const handleLogin = () => {
    navigate('/', { state: { from: originalUrl } });
  };

  return (
    <div className="access-request-page">
        <div className="access-request-page-header">
            
        </div>
        <div className="access-request-card">
            <div className="access-request-card-header">
                <h2> ⚠ Access Prohibited ⚠ </h2>
            </div>
            <div className="access-request-card-body">
                <p>You do not have permission to access this resource.</p>
                <p>Please log in to your account to continue.</p>
                <p>If you do not have an account, you can click the &apos;Request Access&apos; button below.</p>

                <div className="access-btn-group">
                    <div className="access-btn-group-item">
                        <button className="btn btn-primary login-btn" onClick={handleLogin}>Log In</button>
                    </div>
                    <div className="access-btn-group-item">
                        <button className="btn btn-secondary req-acc-btn" onClick={() => navigate('/request-access-form')}>Request Access</button>
                    </div>
                </div> 

                <div className="access-request-card-footer">
                    <span className='request-footer-span'> 
                    <p className="mb-0"> If you have further inquiries with this matter, please contact us at: </p>
                    <a style={{color: "#eb6314"}} href="mailto:chris.pieri@ebjv.com.au" className="email-link">chris.pieri@ebjv.com.au</a>. 
                    </span>
                </div>
            </div>
        </div>
        <div className="access-request-page-footer">
            <p> © EBJV</p>
        </div>
    </div>
  
  );
};

export default AccessRequest;
