import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";
import DataTable from "react-data-table-component";
import '../ProjectStyles.css'
import {  FiEdit, FiMoreVertical } from "react-icons/fi";
import { FaCaretDown } from "react-icons/fa";
import { TbBoxOff, TbCubePlus  } from "react-icons/tb";
// import { RiAddLargeFill } from "react-icons/ri";
import ProjectSidebar from '../ProjectFolderSidebar';

import SidebarOffcanvas from '../MobileSidebar';
import useWindowWidth from './windowWidthHook.jsx'

import { Modal, Button, ToastContainer, Toast } from 'react-bootstrap';
import Select from 'react-select';

function ProjectReleases() {
  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [refreshKey, setRefreshKey] = useState(0); 

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [availableUsers, setAvailableUsers] = useState([]);
  const [projectGroups, setProjectGroups] = useState([]);
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});

  // Modal variable states 
  const [availableEmails, setAvailableEmails] = useState([]);
  const [showAddReleaseModal, setShowAddReleaseModal] = useState(false);
  const [releaseName, setReleaseName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [isNoteAdded, setIsNoteAdded] = useState(false);
  const [releaseNote, setReleaseNote] = useState("");

  // Custom toast messages
  const [toastPosition, setToastPosition] = useState('bottom-end')

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showDeleteSuccessToast, setShowDeleteSuccessToast] = useState(false);
  const [showDeleteErrorToast, setShowDeleteErrorToast] = useState(false);  

  const openSuccessToast = () => setShowSuccessToast(!showSuccessToast);
  const openErrorToast = () => setShowErrorToast(!showErrorToast);
  const openDeleteSuccessToast = () => setShowDeleteSuccessToast(!showDeleteSuccessToast);
  const openDeleteErrorToast = () => setShowDeleteErrorToast(!showDeleteErrorToast); 
  
  const [filteredReleases, setFilteredReleases] = useState([]);
  const dropdownRef = useRef(null);

  const toggleDropdown = (id) => {
    console.log("Toggling dropdown for ID:", id);
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const [releasesTable ,setReleasesTable] = useState([])
 
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project/${projectId}`);
        const { project_name, owner, project_releases } = response.data;
        setProjectName(project_name);
        setOwnerName(`${owner.first_name} ${owner.last_name}`);

        const formattedReleases = project_releases.map((release) => ({
          id: release.releaseId,
          releaseName: release.release_name,
          releaseOwner: release.release_owner,
          totalFiles: release.total_files || 0,
          dueDate: new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }).format(new Date(release.due_date)),
          recipients: JSON.parse(release.recipients).join(", "),
          releaseStatus: release.release_status,
          releaseNote: release.release_note,
          ownership: release.is_owner,
          lastModified: new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }).format(new Date(release.createdAt)),
        }));

        setReleasesTable(formattedReleases);
        setFilteredReleases(formattedReleases);
        // console.log(formattedReleases)
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    const fetchAvailableUsers = async () => {
      try {
        const [currentUserResponse,projectResponse, usersResponse] = await Promise.all([
          axiosInstance.get(`/user`),
          axiosInstance.get(`/project-contributors/${projectId}`),
          axiosInstance.get(`/users`),
        ]);

        const currentUser = currentUserResponse.data;
        const { contributors, groups } = projectResponse.data;
        const users = usersResponse.data;

        const contributorEmails = contributors.map((contributor) => contributor.email);
        const projectGroups = groups.map((group) => group.group_name);

        const formattedUsers = users
          .filter((user) => contributorEmails.includes(user.email))
          .map((user) => ({
            label: `${user.first_name} ${user.last_name}`,
            value: user.email,
          }));

        const formattedToAdd = users
          .filter((user) => 
          user.email !== currentUser.email && // Exclude current user
          contributorEmails.includes(user.email) 
          )
          .map((user) => ({
            label: `${user.first_name} ${user.last_name} (${user.email})`, // Label for dropdown
            value: user.email, // Value for dropdown
          }));
  
          setAvailableEmails(formattedToAdd);

        setProjectGroups(projectGroups);
        setAvailableUsers(formattedUsers);

      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchProjectDetails();
    fetchAvailableUsers();
  }, [projectId, refreshKey]);

  useEffect(() => {
    const generateFilters = () => {
      const ownershipOptions = ["Created by Me", "Shared with Me"];
      const userOptions = availableUsers.map((user) => user.label);
      // console.log(userOptions);
      const groupOptions = projectGroups;
      const statusOptions = Array.from(new Set(releasesTable.map((release) => release.releaseStatus)));
      const dueDateOptions = ["Today", "This Week", "Last Month"];

      const filters = [
        { type: "Owner", options: ownershipOptions },
        { type: "Users", options: userOptions },
        { type: "Groups", options: groupOptions },
        { type: "Status", options: statusOptions },
        { type: "Due Date", options: dueDateOptions },
      ];

      setFilters(filters);
    };

    generateFilters();
  }, [releasesTable, availableUsers, projectGroups]);
  

  useEffect(() => {
    let filteredData = [...releasesTable];
  
    Object.keys(selectedFilters).forEach((filterType) => {
      const selectedOptions = selectedFilters[filterType];
      if (selectedOptions.length > 0) {
        filteredData = filteredData.filter((release) => {
          switch (filterType) {
            case "Owner":
              return selectedOptions.includes(release.ownership ? "Created by Me" : "Shared with Me");
            case "Users":
              return selectedOptions.includes(release.releaseOwner);
            case "Groups":
              return selectedOptions.includes(release.group);
            case "Status":
              return selectedOptions.includes(release.releaseStatus);
            case "Due Date":
              { const dueDate = new Date(release.dueDate);
              const today = new Date();
              if (selectedOptions.includes("Today")) {
                return (
                  dueDate.getFullYear() === today.getFullYear() &&
                  dueDate.getMonth() === today.getMonth() &&
                  dueDate.getDate() === today.getDate()
                );
              }
              if (selectedOptions.includes("This Week")) {
                const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                return dueDate >= startOfWeek && dueDate <= endOfWeek;
              }
              if (selectedOptions.includes("Last Month")) {
                const lastMonth = new Date();
                lastMonth.setMonth(today.getMonth() - 1);
                return (
                  dueDate.getFullYear() === lastMonth.getFullYear() &&
                  dueDate.getMonth() === lastMonth.getMonth()
                );
              }
              return true; }
            default:
              return true;
          }
        });
      }
    });
  
    setFilteredReleases(filteredData);
  }, [selectedFilters, releasesTable]);
  

  const handleCheckboxChange = (filterType, option) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: prevFilters[filterType]?.includes(option)
        ? prevFilters[filterType].filter((item) => item !== option)
        : [...(prevFilters[filterType] || []), option],
    }));
  };

  // Render dropdown options
  const renderDropdown = (filter) => (
    <div className="filter-dropdown" id="release-filters" ref={dropdownRef}>
      {filter.options.map((option, index) => (
        <div key={index} className="dropdown-item">
          <input
            type="checkbox"
            id={`${filter.type}-${index}`}
            checked={selectedFilters[filter.type]?.includes(option) || false}
            onChange={() => handleCheckboxChange(filter.type, option)}
          />
          <label className="filter-label" htmlFor={`${filter.type}-${index}`}>{option}</label>
        </div>
      ))}
    </div>
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);


  const menuRef  = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        toggleDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Define columns for the table
  const sampleColumns = [
    {
      name: "Name",
      selector: (row) => row.releaseName,
      sortable: true,
    },
    {
      name: "Files",
      selector: (row) => row.totalFiles,
      sortable: true,
      hide: 'sm'
    },
    {
      name: "Due Date",
      selector: (row) => row.dueDate,
      sortable: true,
      // hide: 'sm'
    },
    {
      name: "Recipients",
      selector: (row) => row.recipients,
      sortable: true,
      hide: 'md'
    },
    {
      name: "Status",
      button: true,
      hide: 'md',
      cell: (row) => (
        <button className="draft-btn">
          <FiEdit size={18} color="#6A6976" /> {row.releaseStatus}
        </button>
      ),
    },
    {
      button: true,
      cell: (row) => (
        <div className="more-btn">
          <button
            className="dropdown-button"
            onClick={() => toggleDropdown(row.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FiMoreVertical size={24} color="#6A6976" />
          </button>
          {openDropdownId === row.id && (
            <div className="dropdown-menu" style={{marginLeft: "-110px", top: '-30px'}}  ref={menuRef}>
              <button onClick={() => alert(`Send clicked for ${row.name}`)}>
                Send
              </button>
              <button onClick={() => handleDeleteRelease(row.id)}>
                Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];


  const handleAddNewRelease = async () => {
    if (!releaseName || !dueDate || recipients.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }

    const recipientList = recipients.map((recipient) => recipient.value);

    try {
      await axiosInstance.post(`/create-release/${projectId}`, {
        releaseName,
        dueDate,
        recipients: recipientList,
        releaseNote,
      });
      // alert("The new release has been added successfully.");
      openSuccessToast();
      setRefreshKey((prevKey) => prevKey + 1);
      handleClose();
    } catch (error) {
      console.error(error);
      // alert("Failed to add the release. Please try again.");
    }
  };

  const handleClose = () => {
    setShowAddReleaseModal(false);
    setReleaseName("");
    setDueDate("");
    setRecipients([]);
    setReleaseNote("");
    setIsNoteAdded(false);
  };

  const handleShow = () => setShowAddReleaseModal(true);


  // const handleAddNewRelease = async () => {
  //   Swal.fire({
  //     title: 'Add New Release',
  //     html: `
  //       <div style="text-align: left;">
  //         <label for="release-name" style="display: block; margin-bottom: 5px;">Release Name</label>
  //         <input type="text" id="release-name" class="swal2-input" placeholder="Enter release name" style="margin-bottom: 15px; width:100%;">
          
  //         <label for="due-date" style="display: block; margin-bottom: 5px;">Due Date</label>
  //         <input type="date" id="due-date" class="swal2-input" placeholder="Select due date" style="margin-bottom: 15px; width:100%;">
          
  //         <label for="recipients" style="display: block; margin-bottom: 5px;">Recipients</label>
  //         <input type="text" id="recipients" class="swal2-input" placeholder="Enter recipients (comma-separated)" style="width:100%;">
          
  //         <div id="group-container" style="margin-top: 10px;">
  //           <button id="add-releaseNote-btn" type="button" class="btn btn-primary" style="margin-bottom: 10px;">Add a note?</button>
  //         </div>
  //       </div>
  //     `,
  //     confirmButtonText: 'Add Release',
  //     showCancelButton: true,
  //     customClass: {
  //       confirmButton: "btn btn-success rel-btn-success",
  //       cancelButton: "btn btn-danger rel-btn-danger"
  //     },
  //     didOpen: () => {
  //       const addNoteBtn = document.getElementById('add-releaseNote-btn');
  //       const groupContainer = document.getElementById('group-container');
  
  //       // Replace button with a text input when clicked
  //       addNoteBtn.addEventListener('click', () => {
  //         if (!document.getElementById('release-note')) {
  //           const textArea = document.createElement('textarea');
  //           textArea.id = 'release-note';
  //           textArea.className = 'swal2-input';
  //           textArea.placeholder = 'Write a note...';
  //           textArea.style = `
  //             margin-bottom: 10px; width: 100%; 
  //             white-space: pre-wrap; word-wrap: break-word;
  //             background-color: #FFF; color: black;
  //           `;
  //           groupContainer.appendChild(textArea);
  //           addNoteBtn.disabled = true; // Disable button after note addition
  //         }
  //       });
  //     },
  //     preConfirm: () => {
  //       const releaseName = document.getElementById('release-name').value.trim();
  //       const dueDate = document.getElementById('due-date').value.trim();
  //       const recipients = document.getElementById('recipients').value.trim();
  //       const releaseNote = document.getElementById('release-note')
  //         ? document.getElementById('release-note').value.trim()
  //         : null;

  //       if (!releaseName || !dueDate || !recipients) {
  //         Swal.showValidationMessage('Please fill in all required fields.');
  //         return null;
  //       }
  
  //       const recipientList = recipients.split(',').map((email) => email.trim());
  //       const invalidEmails = recipientList.filter(
  //         (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  //       );
  
  //       if (invalidEmails.length > 0) {
  //         Swal.showValidationMessage(
  //           `Invalid email(s): ${invalidEmails.join(', ')}`
  //         );
  //         return null;
  //       }
  
  //       return { releaseName, dueDate, recipients: recipientList, releaseNote };
  //     },
  //   }).then(async(result) => {
  //     if (result.isConfirmed) {
  //       const { releaseName, dueDate, recipients, releaseNote } = result.value;
  
  //       try {
  //         await axiosInstance.post(`/create-release/${projectId}`, {
  //           releaseName,
  //           dueDate,
  //           recipients,
  //           releaseNote,
  //         });
  //       Swal.fire('Success!', 'The new release has been added.', 'success');
  //       setRefreshKey((prevKey) => prevKey + 1);
  //       } catch (error){
  //         Swal.fire('Error!', 'Failed to add the release. Try again.', 'error');
  //       console.error(error);
  //       }
  //     }
  //   });
  // };

  const handleDeleteRelease = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      showCancelButton: true,
      icon: 'warning',
      confirmButtonColor: '#EC221F',
      cancelButtonColor: '#00000000',
      cancelTextColor: '#000000',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        container: 'custom-container',
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button',
        title: 'custom-swal-title',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/delete-release/${projectId}/${id}`);
          openDeleteSuccessToast();
          setRefreshKey((prevKey) => prevKey + 1);
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: error,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#EC221F',
            customClass: {
              confirmButton: 'custom-error-confirm-button',
              title: 'custom-swal-title',
            },
          });
        }
      }
    });
  };

  return (
    <div className="container">
      <StickyHeader />
      <h3 className="title-page" id="projectFolder-title">
        {ownerName}&apos;s {projectName} 
      </h3>
      <div className="container-content" id="project-folder-container">
      <div className="projectFolder-sidebar-container">
      {isMobile ? (
          <SidebarOffcanvas projectId={projectId} />
        ) : (
          <ProjectSidebar projectId={projectId} />
        )}
      </div>

        <div className="projectFolder-display">
        <div className="main"> 
                    <div className="container-fluid moduleFluid">
                    <div className="add-files-menu-container">
            <button
              id="addFiles-btn"
              className="btn addFiles-btn btn-primary"
              title="Add"
              onClick={handleShow}
            >
              <TbCubePlus/> 
            </button>
            </div>
                      <div className="project-content">

                      <div className="table-header d-flex justify-content-between align-items-center mb-3">
                        <div className="page-title">
                          <h2>Releases</h2>
                        </div>
                        <div className="button-group d-flex">
                          <button id="addbtn"className="btn btn-primary add-btn" title="Add New Release"   onClick={handleAddNewRelease}>
                              New
                          </button>
                        </div>
                      </div>
                      <div className="release-filters">
                        <div className="filter-container">
                        <div className="filters d-flex">
                        {filters.map((filter) => (
                          <div key={filter.type} className="filter-type mr-3" onClick={() => setActiveDropdown(filter.type)}>
                            {filter.type} <FaCaretDown />
                            {activeDropdown === filter.type && renderDropdown(filter)}
                          </div>
                        ))}
                        </div>
                        </div>
                      </div>  
                      <DataTable
                        className="dataTables_wrapperz mt-3"
                        columns={sampleColumns}
                        data={filteredReleases}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 20, 30]}
                        paginationComponentOptions={{
                          rowsPerPageText: 'Views displayed:',
                          rangeSeparatorText: 'out of',
                          noRowsPerPage: true, // Hide the rows per page dropdown
                        }}
                        responsive
                        noDataComponent={
                          <div className="noData mt-4">
                            <div className="circle">
                            <TbBoxOff size={65} color="#9a9a9c"/>
                            </div>
                            <div className="no-display-text mt-2">
                              No releases found.
                            </div>
                          </div>
                          }
                      />

                      </div>
                    </div>
                </div>
        </div>
        <Modal id="releaseAddModal" show={showAddReleaseModal} onHide={() => setShowAddReleaseModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Release</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-3">
          <div className="modal-form" style={{ marginBottom: "15px" }}>
          <label htmlFor="modal-releaseName" style={{ marginBottom: "5px", display: "block" }}>
            Enter release name:
          </label>
          <input
               type="text"
               id="modal-releaseName"
               placeholder="Enter release name"
               value={releaseName}
               onChange={(e) => setReleaseName(e.target.value)}
               required
          />
        </div>

        <div className="modal-form" style={{ marginBottom: "15px" }}>
          <label htmlFor="modal-dueDate" style={{ marginBottom: "5px", display: "block" }}>
            Enter release name:
          </label>
          <input
               type="date"
               id="modal-dueDate"
               value={dueDate}
               onChange={(e) => setDueDate(e.target.value)}
               required
          />
        </div>

          <div className="modal-form" style={{ marginBottom: "15px" }}>
          <label htmlFor="recipients" style={{ marginBottom: "5px", display: "block" }}>
            Choose recipient(s):
          </label>
          <Select
            id="recipients"
            options={availableEmails}
            isMulti
            onChange={(selectedOptions) => setRecipients(selectedOptions)}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>

        {isNoteAdded ? (
        <div className="modal-form" style={{ marginBottom: "15px" }}>
          <label htmlFor="release-note" style={{ marginBottom: "5px", display: "block" }}>
            Note/Message
          </label>
          <textarea
            id="release-note"
            placeholder="Write a note..."
            value={releaseNote}
            onChange={(e) => setReleaseNote(e.target.value)}
            style={{
              width: "100%",
              height: "80px",
              padding: "8px",
              resize: "none",
              backgroundColor: "#FFF",
              color: "black",
            }}
          ></textarea>
        </div>
          ) : (
            <Button
                variant="text"
                onClick={() => setIsNoteAdded(true)}
                className="p-0"
              >
                Add a note?
              </Button>
            )}
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="closeAdd"
            variant="secondary"
            onClick={() => setShowAddReleaseModal(false)}
          >
            Close
          </Button>
          <Button id="saveAdd" variant="primary" onClick={handleAddNewRelease}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

          {/* Create Release Messages */}
        <ToastContainer
          className="p-3"
          position={toastPosition}
          style={{ zIndex: 1046, position: 'fixed', maxWidth: '300px' }}
        >
        <Toast show={showSuccessToast} onClose={openSuccessToast} style={{backgroundColor: "#fec19db8"}} delay={5000} autohide>
          <Toast.Header className='justify-content-between' style={{backgroundColor: "#ee8a50b8"}}>
            <small > Project Release Created Successfully! </small>
          </Toast.Header>
          <Toast.Body style={{fontSize: '.785rem'}}>
            Review the details, share with your team, and proceed with deployment or distribution.
          </Toast.Body>
        </Toast>
        </ToastContainer>

        <ToastContainer
          className="p-3"
          position={toastPosition}
          style={{ zIndex: 1046, position: 'fixed', maxWidth: '300px' }}
        >
        <Toast show={showErrorToast} onClose={openErrorToast} style={{backgroundColor: "#e87d7d"}} delay={5000} autohide>
          <Toast.Header className='justify-content-between' style={{backgroundColor: "#e65e5e"}}>
            <small > Release Creation Unsuccessful </small>
          </Toast.Header>
          <Toast.Body style={{fontSize: '.785rem'}}>
            Please review the error details, check your configurations, and try again.
          </Toast.Body>
        </Toast>
        </ToastContainer>
          {/* End of Create Release Messages */}

          {/* Delete Toast Messages */}
        <ToastContainer
          className="p-3"
          position={toastPosition}
          style={{ zIndex: 1046, position: 'fixed', maxWidth: '300px' }}
        >
        <Toast show={showDeleteSuccessToast} onClose={openDeleteSuccessToast} style={{backgroundColor: "#fec19db8"}} delay={5000} autohide>
          <Toast.Header className='justify-content-between' style={{backgroundColor: "#ee8a50b8"}}>
            <small > Release Deleted Successfully! </small>
          </Toast.Header>
          <Toast.Body style={{fontSize: '.785rem'}}>
           The changes have been applied, and the item is no longer available.
          </Toast.Body>
        </Toast> 
        </ToastContainer>

        <ToastContainer
          className="p-3"
          position={toastPosition}
          style={{ zIndex: 1046, position: 'fixed', maxWidth: '300px' }}
        >
        <Toast show={showDeleteErrorToast} onClose={openDeleteErrorToast} style={{backgroundColor: "#e87d7d"}} delay={5000} autohide>
          <Toast.Header className='justify-content-between' style={{backgroundColor: "#e65e5e"}}>
            <small > Release Deletion Unsuccessful </small>
          </Toast.Header>
          <Toast.Body style={{fontSize: '.785rem'}}>
            Please review the error details, check your configurations, and try again.
          </Toast.Body>
        </Toast>
        </ToastContainer>
          {/* End of Delete Toast Messages */}

        
      </div>
    </div>
  );
}

export default ProjectReleases;
