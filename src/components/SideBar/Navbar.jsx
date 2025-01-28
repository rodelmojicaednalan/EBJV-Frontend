import React, { useContext, useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button'
import ebjvLogo from '../../assets/images/ebjv-logo-whitebg.png'
import './Navbar.css'
import { CgProfile } from "react-icons/cg";
import { BsPersonCircle } from "react-icons/bs";
import { FaUsers } from "react-icons/fa6";
import { FaUsersCog } from "react-icons/fa";
import { GrProjects } from "react-icons/gr";
import { BiLogOut } from "react-icons/bi";

import axiosInstance from "../../../axiosInstance.js";
import { AuthContext } from "../Authentication/authContext";
function NewNavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const isProjectFolderPath = location.pathname.includes('/project-folder');
    const isRequestFormPath = location.pathname.includes('/request-access-form');
    const { logout } = useContext(AuthContext);
    const [displayMenu, setDisplayMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const dropdownRef = useRef(null);
    const profileIconRef = useRef(null);
  
    useEffect(() => {
      const handleOutsideClick = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target) &&
          profileIconRef.current &&
          !profileIconRef.current.contains(event.target)
        ) {
          setDisplayMenu(false);
        }
      };
  
      document.addEventListener("mousedown", handleOutsideClick);
  
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, []);

    const handleLogout = async () => {
      try {
        await axiosInstance.post(`/logout`);
        logout();
        navigate("/login");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };
  
    const handleClose = () => setShowLogoutModal(false);
    const handleShow = () => setShowLogoutModal(true);

  return (
    <>
    <Navbar collapseOnSelect expand="lg" className="custom-navbar sticky-top" id="mynav">
      <Container className="navbar-container d-flex flex-row ">

      <Navbar.Brand onClick={() => navigate('/projects')} className="navbar-logo-container">
            <img
              alt="EBJV LOGO"
              src={ebjvLogo}
              width="120vh"
              height="auto"
              className="d-inline-block align-top ml-4"
            />{' '}
            {/* <strong> EBJV </strong> */}
          </Navbar.Brand>
          
          {!isProjectFolderPath && !isRequestFormPath &&(
          <Navbar.Toggle aria-controls="responsive-navbar-nav" className='mr-3' />
          )}


        <Navbar.Collapse id="responsive-navbar-nav">
        {!isProjectFolderPath && !isRequestFormPath && (
          <Nav className="ml-auto">
            <Nav.Link 
              onClick={() => navigate('/userlist')}
              className={location.pathname === "/userlist" ? "active-link" : ""}>
               <span> <FaUsers className="custom-nav-icon"/> Users </span>
            </Nav.Link>
            <Nav.Link 
              onClick={() => navigate('/user-management')}
              className={location.pathname === "/user-management" ? "active-link" : ""}>
              <span> <FaUsersCog className="custom-nav-icon"/> Roles </span>
            </Nav.Link>

            <Nav.Link 
              onClick={() => navigate('/projects')}
              className={location.pathname === "/projects" ? "active-link" : ""}>
                <span> <GrProjects className="custom-nav-icon"/> Projects </span> 
            </Nav.Link>
            <Nav.Link 
              // onClick={()( => navigate('/my-profile')}
              ref={profileIconRef}
              onClick={() => setDisplayMenu(!displayMenu)}
              className={location.pathname === "/my-profile" ? "active-link" : ""}
              style={{marginRight: '15px'}}>
                <span> <BsPersonCircle className="custom-nav-icon" size={24}/>  </span> 
            </Nav.Link>
          </Nav>
        )}
        </Navbar.Collapse>

      </Container>
      {displayMenu && (
      <div className="nav-dropdown-menu" ref={dropdownRef}>
      <div className="nav-dropdown-item" 
      onClick={() => navigate('/my-profile')}
      >
       <span> <CgProfile size={20}/> My Profile </span> 
        </div>
      <div className="nav-dropdown-item" 
      onClick={handleShow}
      >
      <span> <BiLogOut size={20}/> Logout </span> 
      </div>
      </div>
    )}
    </Navbar>
  
  <Modal show={showLogoutModal} onHide={handleClose} centered>
  <Modal.Header closeButton>
    <Modal.Title>Confirm Logout</Modal.Title>
  </Modal.Header>
  <Modal.Body>Logging out will end your current session. Do you want to continue?</Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleClose}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleLogout}>
      Log Out
    </Button>
  </Modal.Footer>
</Modal>
</>
  );
}

export default NewNavBar;