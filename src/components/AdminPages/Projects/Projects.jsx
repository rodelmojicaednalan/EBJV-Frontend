// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useContext } from 'react';
import DataTable from 'react-data-table-component';
import '../../../App.css';
import 'font-awesome/css/font-awesome.min.css';
import view_icon from '../../../assets/images/view-project-folder.png';
import view_model from '../../../assets/images/view-model.png';
import delete_icon from '../../../assets/images/delete-log.png';
import check from '../../../assets/images/check.png';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Toast, ToastContainer } from 'react-bootstrap';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../axiosInstance.js';
import { useLoader } from '../../Loaders/LoaderContext';
import { AuthContext } from '../../Authentication/authContext';
import useWindowWidth from './ProjectFolderPages/windowWidthHook.jsx';
import { TbCubePlus } from 'react-icons/tb';
import { BsFolderSymlink, BsFolderMinus  } from "react-icons/bs";
import { FaSearch } from 'react-icons/fa'



import * as WEBIFC from 'web-ifc';
import * as BUI from '@thatopen/ui';
import * as OBC from '@thatopen/components';
import { FragmentsGroup } from '@thatopen/fragments';

function Projects() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const is320 = windowWidthHook <= 320;
  const [data, setData] = useState([]);
  const [selectedprojectId, setSelectedprojectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const { setLoading } = useLoader();
  const [projectOwner, setProjectOwner] = useState('');
  const [projectLocation, setProjectLocation] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);


   const [toastPosition, setToastPosition] = useState('bottom-end')
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const openSuccessToast = () => setShowSuccessToast(!showSuccessToast);
    const openErrorToast = () => setShowErrorToast(!showErrorToast);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    projectName: '',
    location: '',
    file: null,
    properties: null,
  });

  // console.log(newProject.file)

  const [roleCheck, setRoleCheck] = useState([]);
  const [fragFile, setFragFile] = useState(null);
  const [propertiesJSON, setPropertiesJSON] = useState('');
  const [components] = useState(() => new OBC.Components());

  useEffect(() => {
    if (!newProject.file) return;
  
    Swal.fire({
      title: "Converting IFC File...",
      text: "Please wait.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  
    const initFragments = async () => {
      try {
        const fragments = components.get(OBC.FragmentsManager);
        const fragmentIfcLoader = components.get(OBC.IfcLoader);
  
        // ✅ Ensure the WASM module is loaded first
        await fragmentIfcLoader.setup();
  
        fragments.onFragmentsLoaded.add(async (model) => {
          try {
            const group = Array.from(fragments.groups.values())[0];
            const data = fragments.export(group);
            const file_name = newProject.file.name.split('.')[0];
            const dateID = Date.now();
  
            setFragFile(new File([new Blob([data])], `${dateID}-${file_name}.frag`));
  
            const properties = group.getLocalProperties();
            if (properties) {
              setPropertiesJSON(
                new File([JSON.stringify(properties)], `${dateID}-${file_name}.json`)
              );
            }
  
            // ✅ Close Swal Loader on Success
            Swal.fire({
              title: "IFC File Converted Successfully!", // Only header
              icon: "success", // Success icon
              confirmButtonText: "Continue", // Custom button text
              customClass: {
                confirmButton: "btn btn-primary", // Apply custom CSS class
              },
            });
  
          } catch (error) {
            console.error("Error processing IFC:", error);
  
            // Show error message if conversion fails
            Swal.fire("Error!", "Failed to convert IFC file. Try again.", "error");
          }
        });
      } catch (error) {
        console.error("Error initializing Fragments:", error);
        Swal.fire("Error!", "Failed to initialize IFC Loader.", "error");
      }
    };
  
    initFragments();
  }, [components, newProject.file]);
  
  const loadIfc = async (file) => {
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const buffer = new Uint8Array(data);
      const fragmentIfcLoader = components.get(OBC.IfcLoader);
      
      // ✅ Ensure the IFC Loader is properly initialized
      await fragmentIfcLoader.setup();
      
      await fragmentIfcLoader.load(buffer);
    } catch (error) {
      console.error("Error loading IFC:", error);
    }
  };
  
  useEffect(() => {
    if (newProject.file) {
      loadIfc(newProject.file);
    }
  }, [newProject.file]);
  

  useEffect(() => {
    if (user && user.id) {
      setProjectOwner(user.id);
      setLoading(false); // Automatically set the projectOwner to the logged-in user's ID
    } else {
      setLoading(true);
    }
  }, [user]);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userResponse = await axiosInstance.get('/user');
        const userRole = userResponse.data?.roles?.map(
          (role) => role.role_name
        );
        setRoleCheck(userRole); // State update happens asynchronously
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, []); // Runs once on component mount

  useEffect(() => {
    if (!roleCheck) return; // Ensure roleCheck is available before proceeding

    const fetchProjects = async () => {
      setLoading(true);
      try {
        let response;
        const hasAdminRole = roleCheck.some((role) =>
          ['Superadmin'].includes(role)
        );

        if (hasAdminRole) {
          response = await axiosInstance.get('/projects');
        } else {
          response = await axiosInstance.get('/my-projects');
        }

        const formattedData = response.data.data.map((project) => {
          const parsedFiles = JSON.parse(project.project_file);
          return {
            id: project.id,
            project_name: project.project_name,
            project_owner: `${project.owner.first_name} ${project.owner.last_name}`,
            project_location: project.location,
            project_file: parsedFiles,
          };
        });

        setData(formattedData);
        setFilteredData(formattedData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    setTimeout(() => {
      fetchProjects();
    }, 500);
  }, [roleCheck, refreshKey]); // Run

  //filter Projects
  useEffect(() => {
    const results = data.filter(
      (project) =>
        (selectedprojectId
          ? project.id === parseInt(selectedprojectId)
          : true) &&
        project.project_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredData(results);
  }, [searchTerm, data, selectedprojectId]);

  const handleViewProjectFolder = (projectId) => {
    navigate(`/project-folder/${projectId}/data/project-explorer`);
  };

  // add project
  const handleAddNewProject = async () => {
    try {
      // Show Swal Loader while uploading
      Swal.fire({
        title: "Uploading Project...",
        text: "Please wait.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      if (!fragFile) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
  
      const formData = new FormData();
      formData.append("project_name", newProject.projectName);
      formData.append("user_id", projectOwner);
      formData.append("project_location", projectLocation);
      if (fragFile) {
        formData.append("project_file", newProject.file)
        formData.append("project_file", fragFile);
        formData.append("properties", propertiesJSON);
      } else {
        console.warn("No frag file available");
      }
  
      await axiosInstance.post("/create-project", formData);
  
      // ✅ Close Swal loader & show success message
      Swal.fire({
        title: "Project Uploaded Successfully!",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "btn btn-primary",
        },
      });
  
      setShowAddModal(false);
      openSuccessToast();
      setNewProject({ title: "", location: "", file: null });
      setRefreshKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error("Upload failed:", error);
  
      // ❌ Close Swal loader & show error message
      Swal.fire({
        title: "Upload Failed!",
        text: "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonText: "Retry",
        customClass: {
          confirmButton: "btn btn-danger",
        },
      });
  
      openErrorToast();
    }
  };
  

  //handle deleting of project
  const handleDeleteprojectClick = async (projectId) => {
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
          await axiosInstance.delete(`/delete-project/${projectId}`);
          setData(data.filter((project) => project.id !== projectId));
          Swal.fire({
            title: 'Success!',
            text: 'Project has been deleted.',
            imageUrl: check,
            imageWidth: 100,
            imageHeight: 100,
            confirmButtonText: 'OK',
            confirmButtonColor: '#0ABAA6',
            customClass: {
              confirmButton: 'custom-success-confirm-button',
              title: 'custom-swal-title',
            },
          });
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

  //table columns
  const columns = [
    {
      name: 'Project Name',
      width: '60%',
      selector: (row) => row.project_name,
      sortable: true,
    },
    { // ✅ Conditionally include the column
      name: 'Owner',
      selector: (row) => row.project_owner,
      sortable: true,
      hide: 'md'
    },
    {
      name: 'Action',
      selector: (row) => (
        <div>
          {/* <img
            className="project-folder-icon"
            src={view_icon}
            title="Open Project Folder"
            alt="Open Project Folder"
            width="25"
            height="25"
            onClick={() => handleViewProjectFolder(row.id)}
            style={{ cursor: 'pointer' }}
          /> */}
          <BsFolderSymlink
            color="rgba(30, 30, 30, .7)"
            size={24}
            title='Open Project Folder' 
            onClick={() => handleViewProjectFolder(row.id)}
            style={{ cursor: 'pointer' }}
          />
          {/* {row.project_file && row.project_file.length > 0 && (
            <img
              className="ifc-viewer-icon ml-3"
              src={view_model}
              title="View IFC Model"
              alt="view_ifc"
              width="25"
              height="25"
              onClick={() =>
                navigate(
                  `/ifc-viewer/${row.id}/${row.project_file[0]}`,
                  {
                    state: {
                      fileUrl: row.project_file.filter(
                        (item) => item !== ''
                      ),
                      fileName: row.project_name,
                    },
                  }
                )
              }
              style={{ cursor: 'pointer' }}
            />
          )} */}
          {roleCheck.some((role) =>
            ['Admin', 'Superadmin'].includes(role)
          ) && (
            // <img
            //   className="delete-project-icon ml-3"
            //   src={delete_icon}
            //   title="Delete project"
            //   style={{ cursor: 'pointer' }}
            //   onClick={() => handleDeleteprojectClick(row.id)}
            //   alt="delete"
            //   width="25"
            //   height="25"
            // />
            <BsFolderMinus
              color='rgba(225,12,0, .7)'
              className="ml-3"
              title='Delete Project Folder'
              style={{ cursor: 'pointer' }}
              onClick={() => handleDeleteprojectClick(row.id)}
              size={22}
            />

          )}
       
        </div>
      ),
      sortable: false,
    },
  ];

  const locationOptions = [
    { value: 'North America', label: 'North America' },
    { value: 'Europe', label: 'Europe' },
    { value: 'Asia', label: 'Asia' },
    { value: 'Australia', label: 'Australia' },
  ];

  return (
    <div className="container">
      {/* <StickyHeader /> */}
      {/* <BackToTopButton/> */}
      <div className="row">
        <div
          className="col-lg-12 col-md-6 custom-content-container"
          id="projectList-container"
        >
          {/* <h3 className="title-page">Projects</h3> */}
          <div className="top-filter">
            <input
              id="search-bar"
              type="text"
              placeholder="Search Project"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {roleCheck.some((role) =>
              ['Admin', 'Superadmin'].includes(role)
            ) && (
              <button
                onClick={() => setShowAddModal(true)}
                className={`btn btn-primary float-end ${
                  isMobile ? 'mobile-add-user-btn' : 'add-user-btn'
                }`}
                id="add-new-project-btn"
              >
                {/* <i className="fa fa-plus"></i>  */}
                {isMobile ? <TbCubePlus /> : <span>Add Project</span>}
                {/* Add Project */}
              </button>
            )}
          </div>
          <div className="container-content">
            <DataTable
              className="dataTables_wrapper"
              columns={columns}
              data={filteredData}
              pagination={filteredData.length >= 20}
              paginationPerPage={20}
              paginationRowsPerPageOptions={[20, 30]}
            />
          </div>
        </div>
      </div>
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        centered
        backdrop="static"

      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="projectName" className="form-label">
                Project Name
              </label>
              <input
                type="text"
                className="form-control"
                id="projectName"
                value={newProject.projectName}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    projectName: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-3">
              <label htmlFor="projectLocation" className="form-label">
                Location
              </label>
              <Select
                id="projectLocation"
                options={locationOptions}
                onChange={(selectedOptions) =>
                  setProjectLocation(selectedOptions?.value || null)
                }
                name="location"
                className="basic-single"
                classNamePrefix="select"
              />
              {/* <select
                className="form-select"
                id="projectLocation"
                value={newProject.location}
                defaultValue="North America"
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    location: e.target.value,
                  })
                }
              > 
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="Australia">Australia</option>
              </select>*/}
            </div>
            <div className="mb-3">
              <label htmlFor="projectFile" className="form-label">
                Upload File
              </label>
              <input
                type="file"
                accept=".ifc"
                className="form-control"
                id="projectFile"
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    file: e.target.files[0],
                  })
                }
              />
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
          <Button
            id="saveAdd"
            variant="primary"
            onClick={handleAddNewProject}
          >
            Save Project
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer className="p-3" position={toastPosition}>
                <Toast className="success-toast-container" show={showSuccessToast} onClose={openSuccessToast} delay={5000} autohide>
                  <Toast.Header className='success-toast-header justify-content-between'>
                 <span> Project Added Successfully! </span>   
                  </Toast.Header>
                  <Toast.Body className="success-toast-body">
                    Enter the project folder to start exploring
                  </Toast.Body>
                </Toast>
              </ToastContainer>
      
              <ToastContainer className="p-3" position={toastPosition}>
                <Toast className="error-toast-container" show={showErrorToast} onClose={openErrorToast} delay={5000} autohide>
                  <Toast.Header className='error-toast-header justify-content-between'>
                  <span> Project Creation Failed </span>
                  </Toast.Header>
                  <Toast.Body className="error-toast-body">
                    Please review the error details, check your configurations, and try again.
                  </Toast.Body>
                </Toast>
              </ToastContainer>
    </div>
  );
}

export default Projects;
