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
import { Modal, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../axiosInstance.js';
import { useLoader } from '../../Loaders/LoaderContext';
import StickyHeader from '../../SideBar/StickyHeader';
import { AuthContext } from '../../Authentication/authContext';

function Projects() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selectedprojectId, setSelectedprojectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const { setLoading } = useLoader();
  const [projectOwner, setProjectOwner] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  
  const [refreshKey, setRefreshKey] = useState(0); 

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    projectName: '',
    location: '',
    file: null,
  });

  const [roleCheck, setRoleCheck] = useState("");

  useEffect(() => {
    if (user && user.id) {
      setProjectOwner(user.id);
      setLoading(false); // Automatically set the projectOwner to the logged-in user's ID
    } else {
      setLoading(true);
    }
  }, [user]);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // Check user's role
        const userResponse = await axiosInstance.get('/user');
        const userRole = userResponse.data?.roles?.map(
          (role) => role.role_name
        ); // Assuming `role` is returned from the API
        setRoleCheck(userRole);
        let response;
       
        if (userRole == 'Admin') {
          // Fetch all projects for Admin
          response = await axiosInstance.get('/projects');
        } else {
          // Fetch only client's projects
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

    fetchProjects();
  }, [navigate, refreshKey]);

  //filter Projects
  useEffect(() => {
    const results = data.filter(
      (project) =>
        (selectedprojectId
          ? project.id === parseInt(selectedprojectId)
          : true) &&
        (project.project_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          project.address
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );
    setFilteredData(results);
  }, [searchTerm, data, selectedprojectId]);

  const handleViewProjectFolder = (projectId) => {
    navigate(`/project-folder/${projectId}/data/project-explorer`);
  };

  // add project
  const handleAddNewProject = async () => {
    try {
      const formData = new FormData();
      formData.append('project_name', newProject.projectName);
      formData.append('user_id', projectOwner);
      formData.append('project_location', projectLocation /*newProject.location*/);
      formData.append('project_file', newProject.file);

      await axiosInstance.post('/create-project', formData);

      Swal.fire({
        title: 'Success!',
        text: 'Project has been added successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
      });

      setShowAddModal(false);
      setNewProject({ title: '', location: '', file: null });
      setRefreshKey((prevKey) => prevKey + 1);
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add the project. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
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
            text: 'project has been deleted.',
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
            text: 'There was an error deleting the project.',
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
      width: '40%',
      selector: (row) => row.project_name,
      sortable: true,
    },
    {
      name: 'Project Owner',
      width: '35%',
      selector: (row) => row.project_owner,
      sortable: true,
    },

    {
      name: 'Action',
      selector: (row) => (
        <div>
          <img
            src={view_icon}
            title="Open Project Folder"
            alt="view"
            width="25"
            height="25"
            onClick={() => handleViewProjectFolder(row.id)}
            style={{ cursor: 'pointer' }}
          />
          {row.project_file && row.project_file.length > 0 && (
            <img
              className="ifc-viewer-icon ml-3"
              src={view_model}
              title="View IFC Model"
              alt="view_ifc"
              width="25"
              height="25"
              onClick={() =>
                navigate(`/ifc-viewer/${row.id}`, {
                  state: {
                    fileUrl: row.project_file.filter(
                      (item) => item !== ''
                    ),
                    fileName: row.project_name,
                  },
                })
              }
              style={{ cursor: 'pointer' }}
            />
          )}
          {roleCheck == "Admin" && (
          <img
            className="delete-project-icon ml-3"
            src={delete_icon}
            title="Delete project"
            style={{ cursor: 'pointer' }}
            onClick={() => handleDeleteprojectClick(row.id)}
            alt="delete"
            width="25"
            height="25"
          />
          )}
        </div>
      ),
      sortable: false,
    },
  ];

  const locationOptions = [
    {"value": "North America", "label": "North America"},
    {"value": "Europe", "label": "Europe"},
    {"value": "Asia", "label": "Asia"},
    {"value": "Australia", "label": "Australia"}
  ]
  console.log(projectLocation)
  return (
    <div className="container">
      <StickyHeader />
      <div className="row">
        <div className="col-lg-12 col-md-6 custom-content-container">
          <h3 className="title-page">Projects</h3>
          <div className="top-filter">
            <input
              id="search-bar"
              type="text"
              placeholder="Search Project"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {roleCheck == "Admin" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary float-end add-user-btn"
              id='add-new-project-btn'
            >
              {/* <i className="fa fa-plus"></i>  */}
              Add New Project
            </button>
              )}
          </div>
          <div className="container-content">
            <DataTable
              className="dataTables_wrapper"
              columns={columns}
              data={filteredData}
              pagination
              paginationPerPage={20}
              paginationRowsPerPageOptions={[20, 30]}
            />
          </div>
        </div>
      </div>
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
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
                onChange={(selectedOptions) => setProjectLocation(selectedOptions?.value || null)}
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
    </div>
  );
}

export default Projects;
