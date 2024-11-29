import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import '../../../App.css';
import '../../../Custom.css';
import 'font-awesome/css/font-awesome.min.css';
import man from '../../../assets/images/man.png';
import check from "../../../assets/images/check.png";

import woman from '../../../assets/images/woman.png';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../../../../axiosInstance.js';
import Swal from 'sweetalert2'; 
import delete_icon from "../../../assets/images/delete-log.png";
import { useLoader } from "../../Loaders/LoaderContext";
import { formatInTimeZone } from 'date-fns-tz';
import StickyHeader from '../../SideBar/StickyHeader';



function StaffLogs() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedLogs, setSelectedLogs] = useState([]); // To handle mass delete
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const { setLoading } = useLoader();


  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/staffLogs');
        const formattedData = response.data.map(staff_logs => ({
          id: staff_logs?.id,
          name: `${staff_logs?.user?.first_name || 'N/A'} ${staff_logs?.user?.last_name || ''}`,
          sex: staff_logs?.user?.sex || 'N/A',
          date: staff_logs?.createdAt ? new Date(staff_logs.createdAt).toLocaleString() : 'N/A',
          role: staff_logs?.user?.roles?.[0]?.role_name || 'N/A',
          action: staff_logs?.action === 'logout' ? 'Logged Out' :
                  staff_logs?.action === 'login' ? 'Logged In' : staff_logs?.action || 'Unknown Action',
          // sex: staff_logs?.user?.sex || 'N/A'
        }));
        
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching staff logs:', error);
      }
      finally {
        setLoading(false);
      }
    };


    fetchLogs();
  }, [navigate]);

  const handleDeleteLog = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won’t be able to revert this!",
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
      });

      if (result.isConfirmed) {
        await axiosInstance.delete(`/delete-log/${id}`);
        setData(data.filter(log => log.id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'The staff log has been deleted.',
          imageUrl: check,
          imageWidth: 100,
          imageHeight: 100,
          confirmButtonText: 'OK',
          confirmButtonColor: '#26303A',
        });
      }

    } catch (error) {
      console.error('Error deleting staff log:', error);
      Swal.fire('Error!', 'Failed to delete the staff log.', 'error');
    }
  };

  const handleMassDelete = async () => {
    if (selectedLogs.length === 0) return;
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
      });

      if (result.isConfirmed) {
        await axiosInstance.post('/mass-delete-logs', { ids: selectedLogs });
        setData(data.filter(log => !selectedLogs.includes(log.id)));
        setSelectedLogs([]); // Clear selection
        Swal.fire({
          title: 'Deleted!',
          text: 'Selected staff logs have been deleted.',
          imageUrl: check,
          imageWidth: 100,
          imageHeight: 100,
          confirmButtonText: 'OK',
          confirmButtonColor: '#0ABAA6',
        });
      }
    } catch (error) {
      console.error('Error deleting staff logs:', error);
      Swal.fire('Error!', 'Failed to delete the selected staff logs.', 'error');
    }
  };

  const columns = [
    {
      name: "Select",
      cell: (row) => (
        <label className="del-checkbox">
        <input
          type="checkbox"
          onChange={(e) => {
            const checked = e.target.checked;
            setSelectedLogs(prev =>
              checked ? [...prev, row.id] : prev.filter(id => id !== row.id)
            );
          }}
          checked={selectedLogs.includes(row.id)}
        />
        <div className="del-checkmark" />
        </label>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true
    },
    {
      name: "Name",
      selector: row => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img className='profile-image'
            src={row.sex === 'Male' ? man : woman}
            alt={row.name}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              marginRight: '10px'
            }}
          />
          {row.name}
        </div>
      ),
      sortable: true
    },
    {
      name: "Date",
      selector: (row) => {
        const date = new Date(row.date);
        const options = { timeZone: "Australia/Sydney" };
        
        // Extract parts of the date separately
        const month = date.toLocaleString("en-AU", { month: "short", ...options }); // 'Oct'
        const day = date.toLocaleString("en-AU", { day: "numeric", ...options });   // '10'
        const year = date.toLocaleString("en-AU", { year: "numeric", ...options }); // '2024'
        const time = date.toLocaleString("en-AU", { 
          hour: "numeric", 
          minute: "2-digit", 
          hour12: true, 
          ...options 
        });  // '12:27 PM'
    
        // Return the formatted string
        return `${month} ${day}, ${year} ${time}`;
      },
    },
    


    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true
    },
    // {
    //   name: "Branch",
    //   selector: (row) => row.branch,
    //   sortable: true
    // },
    {
      name: "Action",
      selector: (row) => row.action,
      sortable: true
    },
    {
      name: "Delete",
      button: true,
      cell: (row) => (
        <img
          className="ml-3"
          src={delete_icon}
          title="Delete Log"
          style={{ cursor: "pointer" }}
          onClick={() => handleDeleteLog(row.id)}
          alt="delete"
          width="25"
          height="25"
        />
      )
    }

  ];

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const response = await axiosInstance.get("/user");
        setLoggedInUser(response.data);
      } catch (error) {
        console.error("Error fetching logged-in user:", error);
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await axiosInstance.get("/roles");
        setRoles(response.data);
      } catch (error) {
        console.error(response.status.error);
      }
    }

    fetchLoggedInUser();
    fetchRoles();
  }, []);



  const filteredData = data
    .filter(item => {
      // Apply branch-based filtering
      if (roleFilter) {
        return item.role.includes(roleFilter); // Match branch name to selected branch
      }
      return true;
    })
    .filter(item => {
      // Apply search-based filtering
      return item.name.toLowerCase().includes(search.toLowerCase());
    });

  return (
    <div className="container">
    <StickyHeader/>
      <div className="row">
        <div className="col-lg-12 col-md-6">
          <h3 className="title-page">Activity Logs </h3>
          <div className='top-filter'>
            <select
              name="filter"
              className="mr-4"
              id="filter"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.role_name}>
                  {role.role_name}
                </option>
              ))}
            </select>
            <input
              id='search-bar'
              type="text"
              placeholder='Search'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="container-content">
            <button
              className="btn btn-danger mb-3"
              id="massDelete-btn"
              onClick={handleMassDelete}
              disabled={selectedLogs.length === 0}
            >
              Delete Selected
            </button>
            <DataTable
              className="dataTables_wrapper"
              columns={columns}
              data={filteredData}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffLogs;