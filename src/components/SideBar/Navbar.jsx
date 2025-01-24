import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import ebjvLogo from '../../assets/images/ebjv-logo-whitebg.png'
import './Navbar.css'
import { BsPersonCircle } from "react-icons/bs";
import { FaUsers } from "react-icons/fa6";
import { FaUsersCog } from "react-icons/fa";
import { GrProjects } from "react-icons/gr";
import { BiLogOut } from "react-icons/bi";

import Swal from "sweetalert2";
import axiosInstance from "../../../axiosInstance.js";
import { AuthContext } from "../Authentication/authContext";
function NewNavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const isProjectFolderPath = location.pathname.includes('/project-folder');
    const isRequestFormPath = location.pathname.includes('/request-access-form');
    const { logout } = useContext(AuthContext);

    const handleLogout = async () => {
        // e.preventDefault();
        Swal.fire({
          title: "Log Out!",
          text: "Do you really want to log out?",
          showCancelButton: true,
          icon: "warning",
          confirmButtonColor: "#EC221F",
          cancelButtonColor: "#00000000",
          cancelTextColor: "#000000",
          confirmButtonText: "Yes",
          customClass: {
            container: "custom-container",
            confirmButton: "custom-confirm-button",
            cancelButton: "custom-cancel-button",
            title: "custom-swal-title",
          },
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await axiosInstance.post(`/logout`);
              logout();
              navigate("/login");
            } catch {}
          }
        });
      };

  return (
    <Navbar collapseOnSelect expand="lg" className="custom-navbar sticky-top" id="mynav">
      <Container className="navbar-container d-flex flex-row ">

      <Navbar.Brand href="/projects" className="navbar-logo-container">
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
              onClick={handleLogout}>
                <span className="mr-3"> <BiLogOut /> Logout </span> 
            </Nav.Link>
            {/* <NavDropdown title="Link" id="navbarScrollingDropdown" className="custom-dropdown">
              <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action4">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action5">
                Something else here
              </NavDropdown.Item>
            </NavDropdown> */}
          </Nav>
        )}
          {/* <Nav className="mr-4">
            <NavDropdown
              title={<BsPersonCircle size={40} color="#eb6314" />}
              id="avatarDropdown"
              align="end"
              className="avatar-dropdown"
            >
              <NavDropdown.Item href="/my-profile">My Profile</NavDropdown.Item>
              <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="/logout">Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav> */}
        </Navbar.Collapse>

      </Container>
    </Navbar>
  );
}

export default NewNavBar;