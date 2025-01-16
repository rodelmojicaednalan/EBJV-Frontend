import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import check from "../../../../assets/images/check.png";
import StickyHeader from "../../../SideBar/StickyHeader";
import DataTable from "react-data-table-component";
import '../ProjectStyles.css'
import {  FiEdit, FiMoreVertical } from "react-icons/fi";
import { FaCaretDown, FaFilter  } from "react-icons/fa";
import { TbBoxOff, TbCubePlus  } from "react-icons/tb";
// import { RiAddLargeFill } from "react-icons/ri";
import ProjectSidebar from '../ProjectFolderSidebar';
import { LiaTimesSolid } from "react-icons/lia";

import SidebarOffcanvas from '../MobileSidebar';
import useWindowWidth from './windowWidthHook.jsx'
import Offcanvas from 'react-bootstrap/Offcanvas';

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
  const [activeOffcanvasDropdown, setActiveOffcanvasDropdown] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [availableUsers, setAvailableUsers] = useState([]);
  const [projectGroups, setProjectGroups] = useState([]);
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});

  // Modal variable states 
  const [availableEmails, setAvailableEmails] = useState([]);
  const [showAddReleaseModal, setShowAddReleaseModal] = useState(false);
  const [showEditReleaseModal, setShowEditReleaseModal] = useState(false);
  const [releaseName, setReleaseName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [isNoteAdded, setIsNoteAdded] = useState(false);
  const [releaseNote, setReleaseNote] = useState("");
  const [isUnsavedChanges, setIsUnsavedChanges] = useState(false);

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

    const [showCanvas, setShowCanvas] = useState(false);
    const handleCloseCanvas = () => setShowCanvas(false);
    const handleShowCanvas = () => setShowCanvas(true);
  
  const [filteredReleases, setFilteredReleases] = useState([]);
  const dropdownRef = useRef({});
  const offcanvasDropdownRef = useRef(null);

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
      const dueDateOptions = ["Today", "This Week", "Next Week", "Last Month"];

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
                endOfWeek.setDate(startOfWeek.getDate() + 7 );
                return dueDate >= startOfWeek && dueDate <= endOfWeek;
              }
              if (selectedOptions.includes("Next Week")){
                const nextWeekStart = new Date(today);
                nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
                const nextWeekEnd = new Date(nextWeekStart);
                nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

                return dueDate >= nextWeekStart && dueDate <= nextWeekEnd;
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
    <div className="filter-dropdown" id="release-filters" ref={(el) => (dropdownRef.current[filter.type] = el)}>
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

  const renderOffcanvasDropdown = (filter) => (
    <div className="offcanvas-filter-dropdown" id="offcanvas-release-filters" ref={offcanvasDropdownRef} >
      {filter.options.map((option, index) => (
        <div key={index} className="offcanvas-dropdown-item">
          <input
            type="checkbox"
            id={`offcanvas-${filter.type}-${index}`}
            checked={selectedFilters[filter.type]?.includes(option) || false}
            onChange={() => handleCheckboxChange(filter.type, option)}
          />
          <label className="filter-label" htmlFor={`${filter.type}-${index}`}>{option}</label>
        </div>
      ))}
    </div>
  );

  // test 
  useEffect(() => {
    const handleOutsideClick = (event) => {
      const isClickInsideAnyDropdown = Object.values(dropdownRef.current).some(
        (ref) => ref && ref.contains(event.target)
      );
      if (!isClickInsideAnyDropdown) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Close dropdown when clicking outside
  // useEffect(() => {
  //   const handleOutsideClick = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setActiveDropdown(null);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleOutsideClick);
  //   return () => {
  //     document.removeEventListener("mousedown", handleOutsideClick);
  //   };
  // }, []);

  // offcanvas dropdown click events 
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (offcanvasDropdownRef.current && !offcanvasDropdownRef.current.contains(event.target)) {
        setActiveOffcanvasDropdown(null);
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
            <div id="release-dropdown-menu" className="dropdown-menu"  ref={menuRef}>
              <button onClick={() => alert(`Send clicked for ${row.name}`)}>
                Send
              </button>
              <button onClick={handleShowEdit}>
                Edit
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

      openSuccessToast();
      setRefreshKey((prevKey) => prevKey + 1);
      handleClose();
    } catch (error) {
      console.error(error);
      openErrorToast();
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
  const handleShowEdit = () => setShowEditReleaseModal(true);

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

const [openSecondaryFilter, setOpenSecondaryFilter] = useState(false);
  const handleSecondaryFilterToggle = () => {
    setOpenSecondaryFilter((prevState) =>!prevState);
    handleShowCanvas();
  };
const handleEditRelease = async (id) => {
  if (!releaseName || !dueDate || recipients.length === 0) {
    alert("Please fill in all required fields.");
    return;
  }

  const recipientList = recipients.map((recipient) => recipient.value);

  try {
    await axiosInstance.post(`/edit-release/${projectId}/${id}`, {
      releaseName,
      dueDate,
      recipients: recipientList,
      releaseNote,
    });
    openSuccessToast();
    setRefreshKey((prevKey) => prevKey + 1);
    handleClose();
  } catch (error) {
    console.error(error);
  }
}

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
                          <button id="addbtn"className="btn btn-primary add-btn" title="Add New Release"   onClick={handleShow}>
                              New
                          </button>
                        </div>
                      </div>
                      <div className="release-filters">
                        <div className="filter-container">
                        <div className="filters d-flex" id="release-filters">
                        {filters.map((filter) => (
                          <div key={filter.type} className="filter-type mr-3" onClick={() => setActiveDropdown(filter.type)}>
                            {filter.type} <FaCaretDown />
                            {activeDropdown === filter.type && renderDropdown(filter)}
                          </div> 
                        ))}
                        </div>
                        <div className="d-flex float-end mb-2">
                            <button className="btn float-end filter-btn-icon" onClick={handleSecondaryFilterToggle} > <FaFilter/> </button>
                        </div>
                        {openSecondaryFilter && (
                          <Offcanvas 
                          show={showCanvas} 
                          onHide={handleCloseCanvas} 
                          placement="end" 
                          className="offcanvas"
                          id="release-offcanvas"
                        >
                        <Offcanvas.Header className="offcanvas-head">
                          <Offcanvas.Title>
                          <div className="offcanvas-header d-flex justify-content-between align-items-center">
                            <div className="file-title">
                                <h5> Filters </h5>
                            </div>
                            <div className="offcanvas-button-group">
                              <button
                                className="offcanvas-btn"
                                title="Close"
                                onClick={handleCloseCanvas}
                              >
                                <LiaTimesSolid size={18} />
                              </button>
                            </div>
                          </div>
                          </Offcanvas.Title>
                        </Offcanvas.Header>
                          <Offcanvas.Body className="offcanvas-body">
                            <div className="releaseFilter-offcanvas-body">
                              <div className="offcanvas-filters">
                              {filters.map((filter) => (
                                <div key={filter.type} className="filter-type mr-3" onClick={() => setActiveOffcanvasDropdown(filter.type)}>
                                  <span>  {filter.type} <FaCaretDown  className="float-end"/> </span>   
                                  {activeOffcanvasDropdown === filter.type && renderOffcanvasDropdown(filter)}
                                </div> 
                              ))}
                              </div>
                            </div>
                           <div className="offcanvas-footer d-xl-none">
                            <div className="d-flex justify-content-center">
                              <button className="btn reset-filter-btn" onClick={() => setSelectedFilters([])}>
                                  Reset Filters
                              </button>
                            </div>  
                          </div> 
                          </Offcanvas.Body>
                        </Offcanvas>
                        )}
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
        {/* Add Release Modal */}
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
            Enter due date:
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
            onClick={handleClose}
          >
            Close
          </Button>
          <Button id="saveAdd" variant="primary" onClick={handleAddNewRelease}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
      {/* End of Add Release Modal */}


      {/* Edit Release Modal */}
      <Modal id="releaseEditModal" show={showEditReleaseModal} onHide={() => setShowEditReleaseModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Release</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-3">
          <div className="modal-form" style={{ marginBottom: "15px" }}>
          <label htmlFor="modal-releaseName" style={{ marginBottom: "5px", display: "block" }}>
            Enter new release name:
          </label>
          <input
               type="text"
               id="modal-releaseName"
               placeholder="Edit..."
               value={releaseName}
               onChange={(e) => setReleaseName(e.target.value)}
               required
          />
        </div>

        <div className="modal-form" style={{ marginBottom: "15px" }}>
          <label htmlFor="modal-dueDate" style={{ marginBottom: "5px", display: "block" }}>
            Enter new due date:
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
            Write New Note/Message
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
            onClick={() => setShowEditReleaseModal(false)}
          >
            Close
          </Button>
          <Button id="saveAdd" variant="primary" onClick={handleEditRelease}>
            Edit
          </Button>
        </Modal.Footer>
      </Modal>
      {/* End of Edit Release Modal */}
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
