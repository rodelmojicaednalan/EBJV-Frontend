// AccessRequest.jsx
import React, {useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Access.css'


const AccessRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();   

  const originalUrl = location.state?.from;

  useEffect(() => {
    if (originalUrl) {
      localStorage.setItem('originalUrl', originalUrl);
    }
  }, [originalUrl]);

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
