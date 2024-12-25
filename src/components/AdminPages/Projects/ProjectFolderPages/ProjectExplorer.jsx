import React, { useState, useEffect, useRef } from 'react';
import DataTable from 'react-data-table-component';
import axiosInstance from '../../../../../axiosInstance.js';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import StickyHeader from '../../../SideBar/StickyHeader';

import '../ProjectStyles.css';
import { BiDotsVertical, BiSolidEditAlt } from 'react-icons/bi';
import { LiaTimesSolid } from "react-icons/lia";
import { IoMdDownload, IoMdPersonAdd  } from "react-icons/io";
import { IoGrid } from 'react-icons/io5';
import { FaThList } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import ProjectSidebar from '../ProjectFolderSidebar';
import Offcanvas from 'react-bootstrap/Offcanvas';

function ProjectExplorer() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [existingFiles, setExistingFiles] = useState([]); // Existing files

  const [viewType, setViewType] = useState('list');
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 
  const [offcanvasMenuOpen, setOffcanvasMenuOpen] = useState(false);

  const handleOCMenuToggle = () => {
    setOffcanvasMenuOpen(!offcanvasMenuOpen);
  };

  const handleOCMenuOptionClick = (option) => {
    setOffcanvasMenuOpen(false);
    Swal.fire(`Function to ${option}`);
  }

  const [explorerTable, setExplorerTable] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuOptionClick = (option) => {
    setMenuOpen(false);
    Swal.fire(`Function to: ${option}`);
  };

  const [showCanvas, setShowCanvas] = useState(false);
  const handleCloseCanvas = () => setShowCanvas(false);
  const handleShowCanvas = () => setShowCanvas(true);

  const [selectedRow, setSelectedRow] = useState(null); // State to hold the selected row details

// Handle row click
  const handleRowClick = (row) => {
    setSelectedRow(row); // Set the clicked row's data
    handleShowCanvas(); // Show the Offcanvas
  };

  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/project/${projectId}`
        );
        const {
          project_name,
          owner,
          files,
          createdAt,
          updatedAt,
          project_file,
        } = response.data;

        setProjectName(project_name);
        setOwnerName(`${owner.first_name} ${owner.last_name}`);
        setExistingFiles(project_file);

        const formattedFiles = files.map((file) => ({
          fileName: file.fileName, // Assuming the file object has this key
          fileSize: `${(file.fileSize / (1024 * 1024)).toFixed(
            2
          )} MB`, // Convert bytes to KB
          fileOwner: `${owner.first_name} ${owner.last_name}`,
          created: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }).format(new Date(createdAt)),
          lastModified: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }).format(new Date(updatedAt)), // Format updatedAt
        }));

        setExplorerTable(formattedFiles);
        console.log(files)
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    fetchProjectDetails();
  }, [projectId, refreshKey]);

  // Define columns for the table
  const explorerColumn = [
    {
      name: " ",
      cell: (row, index) => (
        <label className="del-checkbox">
          <input
            type="checkbox"
            onChange={(e) => {
              const checked = e.target.checked;
              setSelectedFiles((prev) =>
                checked ? [...prev, index] : prev.filter((i) => i !== index)
              );
            }}
            checked={selectedFiles.includes(index)}
          />
          <div className="del-checkmark" />
        </label>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: 'File Name',
      width: '30%',
      selector: (row) => row.fileName,
      sortable: true,
    },
    {
      name: 'File Owner',
      width: '20%',
      selector: (row) => row.fileOwner,
      sortable: true,
    },
    {
      name: 'Last Modified',
      width: '20%',
      selector: (row) => row.lastModified,
      sortable: true,
    },
    {
      name: 'File Size',
      selector: (row) => row.fileSize,
      sortable: true,
    },
    {
      name: 'Tags',
      selector: (row) => '',
      sortable: true,
    },
  ];
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFiles, setNewFiles] = useState([]);

  const handleAddNewFile = async () => {
    try {
      const formData = new FormData();
      newFiles.forEach((file) => {
        formData.append('project_file', file); 
      });
      

      await axiosInstance.post(`/upload-ifc-files/${projectId}`, formData,{
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Swal.fire({
        title: 'Success!',
        text: 'File(s) has been added successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
      });

      setShowAddModal(false);
      setNewFiles({ file: null });
      setRefreshKey((prevKey) => prevKey + 1);
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleDeleteFiles = async () => {
    try {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!.",
      showCancelButton: true,
      icon: 'warning',
      confirmButtonColor: "#EC221F",
      cancelButtonColor: "#00000000",
      cancelTextColor: "#000000",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        container: "custom-container",
        confirmButton: "custom-confirm-button",
        cancelButton: "custom-cancel-button",
        title: "custom-swal-title",
      },
    })

    if (result.isConfirmed){
    const filesToDelete = selectedFiles.map(index => explorerTable[index]);
    for (const file of filesToDelete) {
      await axiosInstance.delete(`/delete-file/${projectId}/${file.fileName}`);
    }
    setExplorerTable(prev =>
      prev.filter((_, index) => !selectedFiles.includes(index))
    );
      setSelectedFiles([]); // Clear selected files
      Swal.fire({
        title: "Deleted!",
        text: "Selected files have been deleted.",
        icon: "success",
        confirmButtonText: "OK",
      });
      setRefreshKey((prevKey) => prevKey + 1);
    }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };


  const handleShare = async () => {
    document.querySelector(".offcanvas").setAttribute("aria-hidden", "true");
    // Optionally add inert to prevent focusability
    document.querySelector(".offcanvas").setAttribute("inert", "true");
    Swal.fire({
      title: 'Share Data',
      html: `
        <div style="text-align: left;">
          <label for="share-with" style="display: block; margin-bottom: 5px;">Share With</label>
          <select id="share-with" class="swal2-input" style="margin-bottom: 15px; width:100%;">
            <option value="" disabled selected>Select an option</option>
            <option value="Specific People">Specific people in the project</option>
            <option value="Signed In Users">Signed in users with the link</option>
            <option value="Anyone">Anyone with the link</option>
          </select>
          
          <label for="recipients" style="display: block; margin-bottom: 5px;">People/Groups</label>
          <input type="text" id="recipients" class="swal2-input" placeholder="Enter names or groups..." style="margin-bottom: 15px; width:100%;">
  
          <label for="release-note" style="display: block; margin-bottom: 5px;">Note/Message</label>
          <textarea id="release-note" class="swal2-input" placeholder="Write a note..." style="
            margin-bottom: 10px; width: 100%; 
            white-space: pre-wrap; word-wrap: break-word;
            background-color: #FFF; color: black;
          "></textarea>
        </div>
      `,
      confirmButtonText: 'Share',
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success rel-btn-success",
        cancelButton: "btn btn-danger rel-btn-danger"
      },
      preConfirm: () => {
        const shareWith = document.getElementById('share-with').value.trim();
        const recipients = document.getElementById('recipients').value.trim();
        const releaseNote = document.getElementById('release-note').value.trim();
  
        if (!shareWith || !recipients) {
          Swal.showValidationMessage('Please fill in all required fields.');
          return null;
        }
  
        const recipientList = recipients.split(',').map((name) => name.trim());
  
        if (recipientList.length === 0) {
          Swal.showValidationMessage('Please enter at least one recipient.');
          return null;
        }
  
        return { shareWith, recipients: recipientList, releaseNote };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        document.querySelector(".offcanvas").removeAttribute("aria-hidden");
        document.querySelector(".offcanvas").removeAttribute("inert");
        const { shareWith, recipients, releaseNote } = result.value;
        return console.log("success", shareWith, recipients, releaseNote)
        
        // try {
        //   await axiosInstance.post(`/share-data/${projectId}`, {
        //     shareWith,
        //     recipients,
        //     releaseNote,
        //   });
        //   Swal.fire('Success!', 'The new release has been added.', 'success');
        // } catch (error) {
        //   Swal.fire('Error!', 'Failed to add the release. Try again.', 'error');
        //   console.error(error);
        // }
        
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // If the user cancels, restore focus and remove inert attributes
        document.querySelector(".offcanvas").removeAttribute("aria-hidden");
        document.querySelector(".offcanvas").removeAttribute("inert");
        document.querySelector(".offcanvas button").focus();
      }
    });
  };

  const menuRef  = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setOffcanvasMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);


  return (
    <div className="container">
      <StickyHeader />
      <h3 className="title-page" id="projectFolder-title">
        {ownerName}'s {projectName}
      </h3>
      <div
        className="container-content"
        id="project-folder-container"
      >
        <div className="projectFolder-sidebar-container">
          <ProjectSidebar projectId={projectId} />
        </div>

        <div className="projectFolder-display">
          <div className="main">
            <div className="container-fluid moduleFluid">
              <div className="project-content">
                <div className="table-header d-flex justify-content-between align-items-center mb-3">
                  <div className="page-title">
                    <h2>Explorer</h2>
                  </div>
                  <div className="button-group d-flex">
                  
                    <button
                      className={`btn btn-icon grid-view-btn ${
                        viewType === 'grid' ? 'active' : ''
                      }`}
                      title="Grid View"
                      onClick={() => setViewType('grid')}
                    >
                      <IoGrid />
                    </button>
                    <button
                      className={`btn btn-icon list-view-btn ${
                        viewType === 'list' ? 'active' : ''
                      }`}
                      title="List View"
                      onClick={() => setViewType('list')}
                    >
                      <FaThList />
                    </button>
                    <div className="menu-btn-container position-relative">
                      <button
                        className="btn btn-icon menu-btn"
                        title="Menu"
                        onClick={handleMenuToggle}
                      >
                        <BiDotsVertical />
                      </button>
                      {menuOpen && (
                        <div className="dropdown-menu" ref={menuRef}>
                          <div
                            className="dropdown-item"
                            onClick={() =>
                              handleMenuOptionClick('Export to Excel')
                            }
                          >
                            Export to Excel
                          </div>
                          <div
                            className="dropdown-item"
                            onClick={() =>
                              handleMenuOptionClick('Checkin')
                            }
                          >
                            Checkin Files
                          </div>
                          <div
                            className="dropdown-item"
                            onClick={() =>
                              handleMenuOptionClick('Checkout')
                            }
                          >
                            Checkout Files
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      id="addbtn"
                      className="btn btn-primary add-btn"
                      title="Add"
                      onClick={() => setShowAddModal(true)}
                    >
                      + Add
                    </button>
                  </div>
                </div>
        
                <button
                  onClick={() => handleDeleteFiles(projectId)}
                  id="deleteUploadedfilesbtn"
                  className="btn btn-danger"
                  disabled={selectedFiles.length === 0} // Disable button when no files are selected
                >
                  Delete Files
                </button>

                <div className={`project-display ${viewType}`}>
                  {viewType === 'grid' ? (
                    <div className="grid-view">
                      {explorerTable.map((row, index) => (
                        <div key={index} className="grid-item">
                          <h5>{row.fileName}</h5>
                          <p>Owner: {row.fileOwner}</p>
                          <p>Modified: {row.lastModified}</p>
                          <p>Size: {row.fileSize}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <DataTable
                      className="dataTables_wrapperz mt-3"
                      id="explorer-table"
                      columns={explorerColumn}
                      data={explorerTable}
                      onRowClicked={handleRowClick}
                      responsive
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload New IFC Files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-3">
              <label htmlFor="projectFile" className="form-label">
                You can select more than one file at a time.
              </label>
              <input
                type="file"
                name="projectFiles"
                accept=".ifc"
                multiple
                className="form-control"
                id="projectFile"
                onChange={(e) => {
                  const filesArray = Array.from(e.target.files);
                  setNewFiles(filesArray);
                }}
              />
              {newFiles && newFiles.length > 0 && (
                <div className="mt-2">
                  <h6>Selected Files:</h6>
                  <ul>
                    {newFiles.map((file, index) => (
                      <li style={{listStyle: "none"}}key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="closeAdd"
            variant="secondary"
            onClick={() => setShowAddModal(false)}
          >
            Close
          </Button>
          <Button id="saveAdd" variant="primary" onClick={handleAddNewFile}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>

      <Offcanvas 
        show={showCanvas} 
        onHide={handleCloseCanvas} 
        placement="end" 
        //backdrop="static"
        className="offcanvas"
        id="explorer-offcanvas"

      >
      <Offcanvas.Header className="offcanvas-head">
        <Offcanvas.Title>
        <div className="offcanvas-header d-flex justify-content-between align-items-center">
          <span className="file-title">
            {selectedRow ? selectedRow.fileName : "File Details"}
          </span>
          <div className="offcanvas-button-group">
            <button className="offcanvas-btn" title="Edit">
              <BiSolidEditAlt size={18} />
            </button>
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
        <div className="offcanvas-button-group2 mb-3 flex-wrap">
              <label htmlFor="buttons">  </label>
              <button className="btn mr-4 ml-1"
                      onClick={() =>
                        navigate(`/ifc-viewer/${projectId}`, {
                          state: {
                            fileUrl: selectedRow.fileName
                          },
                        })
                      }
                      style={{fontSize: "12px"}}>
                View 
              </button>
              <button className="btn mr-1" onClick={handleShare}><IoMdPersonAdd size={20}/></button>
              <button className="btn mr-1"><IoMdDownload size={20}/></button>
              <button className="btn " onClick={handleOCMenuToggle}><BiDotsVertical size={20}/></button>  
              {offcanvasMenuOpen && (
                        <div className="dropdown-menu" id="offcanvas-dropdown" ref={menuRef}>
                           <div className="dropdown-item"
                                onClick={() => handleOCMenuOptionClick('Add Tags')}>
                            Add Tags
                          </div>
                          <div className="dropdown-item"
                                onClick={() => handleOCMenuOptionClick('Generate QR Code')}>
                           Generate QR Code
                          </div>
                           <div className="dropdown-item"
                                onClick={() => handleOCMenuOptionClick('Checkin')}>
                            Checkin Files
                          </div>
                          <div className="dropdown-item"
                               onClick={() => handleOCMenuOptionClick('Checkout')}>
                            Checkout Files
                          </div>
                          <div className="dropdown-item"
                               onClick={() => handleOCMenuOptionClick('Export to Excel')}>
                            Export to Excel
                          </div>
                        </div>
                      )}            
          </div>

        {selectedRow && (
          <div style={{fontSize: "12px"}}>
            <p><strong>Details: </strong></p>
              <label style={{margin: "0", fontWeight: "300"}}>File Size:</label>
                <p>{selectedRow.fileSize}</p>
              <label style={{margin: "0", fontWeight: "300"}}>Date Created:</label>
                <p>{selectedRow.created} by {selectedRow.fileOwner}</p>
              <label style={{margin: "0", fontWeight: "300"}}>Last Modified:</label>
                <p>{selectedRow.lastModified} by {selectedRow.fileOwner}</p>
          </div>
        )}
        </Offcanvas.Body>
      </Offcanvas>

    </div>
  );
}

export default ProjectExplorer;
