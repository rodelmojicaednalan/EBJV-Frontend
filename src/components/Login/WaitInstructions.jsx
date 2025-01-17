// WaitInstructions.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Access.css'

const WaitInstructions = () => {

  return (
    <div className="access-request-page">
        <div className="access-request-page-header">
            
        </div>
        <div className="access-request-card">
            <div className="access-request-card-header">
                <h2> Thank You for Your Request.</h2>
            </div>
            <div className="access-request-card-body">
                <p>&quot;We&apos;ve received your request for account access. Please check your email from time-to-time for further instructions. This may take a while.&quot;</p>
            </div>
        <div className="access-request-card-footer">
            <span className='request-footer-span'> 
            <p className="mb-0"> If you do not receive an email within 24 hours, please contact us at: </p>
            <a style={{color: "#eb6314"}} 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=chris.pieri@ebjv.com.au"
              target="_blank"
              rel="noopener noreferrer"
            className="email-link">chris.pieri@ebjv.com.au
            </a>. 
            </span>
        </div>
        </div>
        <div className="access-request-page-footer">
            <p> © EBJV</p>
        </div>
    </div>
  
  );
};

export default WaitInstructions;
