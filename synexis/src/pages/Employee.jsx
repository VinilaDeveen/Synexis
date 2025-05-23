import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RecentActivities from '../components/RecentActivity';
import { 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader,
  ContentLoader, 
  ImageLoader
} from '../components/loaders';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { LuHistory } from "react-icons/lu";
import { Search, Plus, Menu } from 'lucide-react';
import { DataGrid } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';
import { employeeService } from '../services/employeeService';
import { recentActivityService } from '../services/recentActivityService';

const EmployeePage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();
  
  // State for recent activities panel and sidebar visibility
  const [recentActivities, setRecentActivities] = useState('');
  const [showActivities, setShowActivities] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });

  const [loading, setLoading] = useState(true);
  const isInitialLoad = useRef(true);

  // Fetch recent activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await recentActivityService.getAllEmployeeActivity();
        if (response && response.data) {
          setRecentActivities(response.data);
        }
      } catch (error) {
        if (isInitialLoad.current){
          console.error('Error fetching activities:', error);
          notifyError(`Failed to load recent activities: ${error.message || 'Unknown error'}`);
          isInitialLoad.current = false;
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch the activities
    fetchActivities();
  }, []);

  // Check screen size and set mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };

    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        // In a real app this would be an API call
        const response = await employeeService.getAll();
        if (response && response.data) {
            setEmployees(response.data);
        }
        setLoading(false);
      } catch (error) {
        if (isInitialLoad.current){
          console.error('Error fetching employees:', error);
          notifyError(`Failed to load employees: ${error.message || 'Unknown error'}`);
          isInitialLoad.current = false;
        }
        setLoading(false);
      }
    };

    // Fetch the employees
    fetchEmployees();
  }, []);

  // We need to check loading state before returning the full component
  if (loading) {
    return <FullPageLoader />;
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Toggle recent activities panel
  const toggleActivitiesPanel = () => {
    setShowActivities(!showActivities);
  };

  const closeActivitiesPanel = () => {
    setShowActivities(false);
  };

  // Define columns for the DataGrid
  const getColumns = () => {
    // Base columns that always show
    const baseColumns = [
      { 
        field: 'name', 
        headerName: 'Name', 
        flex: 0,
        width: 250,
        renderCell: renderNameCell,
        headerAlign: 'left',
        align: 'left',
        headerClassName: 'name-column-header',
      },
      { 
        field: 'actions', 
        headerName: 'Actions', 
        width: 120, 
        renderCell: renderActionsCell,
        sortable: false,
        filterable: false,
        headerAlign: 'left',
        align: 'left'
      },
    ];
    
    // Additional columns based on screen size
    const additionalColumns = [
      { 
        field: 'role', 
        headerName: 'Role', 
        width: 280,
        headerAlign: 'left',
        align: 'left'
      },
      { 
        field: 'phoneNumber', 
        headerName: 'Phone Number', 
        width: 150,
        headerAlign: 'left',
        align: 'left'
      },
      { 
        field: 'email', 
        headerName: 'Email', 
        flex: 1,
        minWidth: 200,
        headerAlign: 'left',
        align: 'left'
      },
    ];
    
    return isMobile 
      ? [baseColumns[0], additionalColumns[0], baseColumns[1]] 
      : [...baseColumns.slice(0, 1), ...additionalColumns, baseColumns[1]];
  };
  
  // Custom theme for DataGrid
  const customTheme = createTheme({
    components: {
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#E9EEF6',
              color: '#1e293b',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f1f5f9',
              paddingLeft: '8px 16px',
            },
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: 'none',
            },
            '& .MuiDataGrid-columnHeader:first-of-type .MuiDataGrid-columnHeaderTitleContainer': {
              paddingLeft: '10px',
              fontWeight: '600'
            },
          },
        },
      },
    },
  });
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleAddEmployee = () => {
    navigate('/addEmployee');
    notifyDefault('Add Employee page coming soon');
  };

  const handleEditEmployee = (id) => {
    navigate(`/editEmployee/${id}`);
    notifyDefault(`Edit Employee ID: ${id} page coming soon`);
  };

  const handleDeleteEmployee = (id) => {
    try {
      // Find the employee being deleted
      const employeeToDelete = employees.find(employee => employee.employeeId === id);
      const employeeName = employeeToDelete?.name || 'Employee';
      
      // Simulate API call for deletion
      // employeeService.delete(id);
      notifySuccess(`Employee "${employeeName}" successfully deleted`);
    } catch (error) {
      notifyError(`Error deleting employee: ${error.message || 'Unknown error'}`);
    }
  };

  const handleViewEmployee = (id) => {
    const employee = employees.find(employee => employee.employeeId === id);
    if (employee) {
      const employeeName = employee.employeeName;
      notifyDefault(`Viewing details for "${employeeName}"`);
    } else {
      notifyWarning('View details functionality coming soon');
    }
  };

  // Custom render components for DataGrid
  const renderNameCell = (params) => {
    const employee = employees.find(e => e.employeeId === params.row.id) || {};
    const isActive = employee.employeeStatus === 'ACTIVE';
    const displayName = params.value;

    return (
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <div className="mr-2">
          {loading ? (
            <ImageLoader />
          ) : (
            <img
              alt={`${employee.name} avatar`}
              src={`http://localhost:8080/api/synexis/employee/image/${employee.employeeId}?t=${new Date().getTime()}`}
              className="size-10 rounded-full border-2 border-slate-300"
            />
          )}
        </div>
        <div className={isMobile ? "block" : "hidden sm:block"}>
          <span className="text-black px-2 py-1 rounded-md mr-2 text-sm">{displayName}</span>
        </div>
      </div>
    );
  };
  
  // Custom render components for DataGrid
  const renderActionsCell = (params) => {
    return (
      <div className="flex gap-2 md:gap-4 mt-4">
        <div 
          className="text-[#3B50DF] hover:text-blue-900 cursor-pointer"
          onClick={() => handleEditEmployee(params.id)}
          title="Edit Employee"
        >
          <FaEdit size={isMobile ? 16 : 18} />
        </div>
        <div 
          className="text-[#3B50DF] hover:text-red-500 cursor-pointer"
          onClick={() => handleDeleteEmployee(params.id)}
          title="Delete Employee"
        >
          <MdDelete size={isMobile ? 16 : 18} />
        </div>
        <Link 
          to={`/employeeView/${params.id}`} 
          state={{ selectedEmployeeId: params.id }}
        >
          <div 
            className="text-[#3B50DF] hover:text-green-500 cursor-pointer"
            title="View Employee Details"
            onClick={() => handleViewEmployee(params.id)}
          >
            <FaEye size={isMobile ? 16 : 18} />
          </div>
        </Link>
      </div>
    );
  };

  // Filter employees based on search term
  const filteredEmployees = searchTerm.trim() === '' 
    ? employees 
    : employees.filter(employee => 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.role && employee.role.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  // Prepare data for DataGrid
  const rows = filteredEmployees.map(employee => ({
    id: employee.employeeId,
    name: employee.employeeName,
    role: employee.role,
    phoneNumber: employee.employeePhoneNumber,
    email: employee.employeeEmail,
    actions: employee.employeeId
  }));

  return (
    <div className="flex w-screen h-screen text-black bg-gray-100 overflow-hidden">
      {/* Mobile Menu Button */}
      {isMobile && !showSidebar && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md"
        >
          <Menu size={24} className="text-[#3B50DF]" />
        </button>
      )}
      
      {/* Sidebar - conditionally shown */}
      {showSidebar && (
        <div className={`${isMobile ? 'fixed z-40 h-full shadow-lg' : 'relative'}`}>
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
        {/* Header */}
        <div>
          <Navbar/>
        </div>

        {/* Content Area */}
        <div className="p-2 sm:p-4 md:p-6 flex-1 overflow-auto">
          {/* Toast notifications */}
          <ToastContainer className="mt-[70px]" />

          <h1 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4 pl-2">Employee</h1>

          {/* Employees Table Card */}
          <div className="bg-white rounded-lg shadow">
            {/* Search and Add Employee */}
            <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center w-full sm:w-auto">
                <div 
                  onClick={toggleActivitiesPanel}
                  className="cursor-pointer relative"
                >
                  <LuHistory size={20} className="text-[#3B50DF]" />
                </div>
                <div className="relative ml-2 flex-1 sm:w-64 md:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Type to search"
                    className="pl-10 bg-white w-full border-none pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              <button 
                onClick={handleAddEmployee}
                className="bg-[#3C50E0] hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-lg flex items-center justify-center sm:justify-start gap-2"
              >
                <Plus size={16} />
                <span>Add Employee</span>
              </button>
            </div>
            <hr />

            {/* DataGrid with ThemeProvider */}
            <div className="w-full p-2 md:p-4 overflow-x-auto">
              <ThemeProvider theme={customTheme}>
                <DataGrid 
                  rows={rows} 
                  columns={getColumns()} 
                  pagination
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[5]}
                  disableRowSelectionOnClick
                  autoHeight
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell:focus': {
                      outline: 'none',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: '#f8fafc',
                    },
                    '& .name-column-header .MuiDataGrid-columnHeaderTitleContainer': {
                      paddingLeft: '15px',
                      fontWeight: '600',
                    },
                    // Responsive font sizes
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                  }}
                />
              </ThemeProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Panel */}
      <RecentActivities
        isVisible={showActivities} 
        activities={recentActivities}
        onClose={closeActivitiesPanel}
      />
      
      {/* Overlay when mobile sidebar is open */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default EmployeePage;