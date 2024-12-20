import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axiosInstance from '../../../../../axiosInstance.js';
import Swal from 'sweetalert2';
import { useNavigate, useParams, Link } from 'react-router-dom';
import check from '../../../../assets/images/check.png';
import StickyHeader from '../../../SideBar/StickyHeader';

import '../ProjectStyles.css';
import { FiChevronLeft } from 'react-icons/fi';
import { BiDotsVertical } from 'react-icons/bi';
import { IoGrid } from 'react-icons/io5';
import { FaThList } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import ProjectSidebar from '../ProjectFolderSidebar';

function ProjectExplorer() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [existingFiles, setExistingFiles] = useState([]); // Existing files

  const [viewType, setViewType] = useState('list');
  const [menuOpen, setMenuOpen] = useState(false);

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
  }, [projectId]);

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
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add file(s) to the project. Please try again.',
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
    }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to delete selected files.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

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
                        <div className="dropdown-menu">
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
    </div>
  );
}

export default ProjectExplorer;
