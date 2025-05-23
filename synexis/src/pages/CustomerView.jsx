import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader,
  ContentLoader 
} from '../components/loaders';
import { useState, useEffect, useRef } from 'react';
import { Menu, Search, FileText, Download, Eye } from 'lucide-react';
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdOutlineClose } from "react-icons/md";
import { createTheme } from '@mui/material/styles';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';

const CustomerView = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLogLoading, setActivityLogLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [loading, setLoading] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const isInitialLoad = useRef(true);
  const isInitialLoad1 = useRef(true);
  
  // For accessing route parameters and state
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the selectedCustomerId from state or from URL parameter
  const selectedCustomerId = location.state?.selectedCustomerId || id;

  // State for customers
  const [customers, setCustomers] = useState([]);

  // Add this useEffect to fetch activity logs
    useEffect(() => {
      const fetchActivityLogs = async () => {
        if (!selectedCustomerId) return;
        
        try {
          setActivityLogLoading(true);
          const response = await customerService.getCustomerActivityLogs(selectedCustomerId);
          
          if (response && response.data) {
            setActivityLogs(response.data);
          }
        } catch (error) {
          console.error('Error fetching activity logs:', error);
          notifyError('Failed to load activity logs');
        } finally {
          setActivityLogLoading(false);
        }
      };
      
      // Only fetch logs when activity tab is active and we have a unit selected
      if (activeTab === 'activity' && selectedCustomerId) {
        fetchActivityLogs();
      }
    }, [selectedCustomerId, activeTab]);
  
  // Fetch customers list data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        // Fixed: Changed from getAll() to getCustomerList()
        const response = await customerService.getSideDrop();
        if (response && response.data) {
          setCustomers(response.data);
        }
      } catch (error) {
        if (isInitialLoad.current) {
          console.error('Error fetching customers:', error);
          notifyError('Failed to load customers');
          isInitialLoad.current = false
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch selected customer by ID when selectedCustomerId changes
  useEffect(() => {
    const fetchCustomerById = async (id) => {
      if (!id) return;
      
      try {
        setCustomerLoading(true);
        const response = await customerService.getById(id);
        if (response && response.data) {
          setSelectedCustomer(response.data);
        } else {
          notifyWarning('Customer not found');
        }
      } catch (error) {
        if (isInitialLoad1.current) {
          console.error('Error fetching customer details:', error);
          notifyError('Failed to load customer details');
          isInitialLoad1.current = false;
        }
      } finally {
        setCustomerLoading(false);
      }
    };

    if (selectedCustomerId) {
      fetchCustomerById(selectedCustomerId);
    } else if (customers.length > 0 && !selectedCustomer) {
      // Default to first customer if none selected
      handleCustomerSelect(customers[0]);
    }
  }, [selectedCustomerId, customers]);

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

  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle customer selection and update URL
  const handleCustomerSelect = (customer) => {
    navigate(`/customerView/${customer.customerId}`, { 
      state: { selectedCustomerId: customer.customerId },
      replace: true 
    });
    // The useEffect hook with selectedCustomerId dependency will trigger
    // the API call to fetch the customer details
  };

  // Filter customers based on search term - Fixed field names
  const filteredCustomers = searchTerm.trim() === '' 
    ? customers 
    : customers.filter(customer => 
        customer.customerFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerPhoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Handle back to customers
  const handleBackToCustomers = () => {
    navigate('/customer');
  };

  const handleEditToCustomer = () => {
    navigate(`/editCustomer/${selectedCustomerId}`);
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomerId) return;

    try {
      setLoading(true);
      await customerService.delete(selectedCustomerId);
      notifySuccess(`Customer "${selectedCustomer.customerFirstName} ${selectedCustomer.customerLastName}" successfully deleted`);
      
      // After deletion, navigate back to customers list
      navigate('/customer');
    } catch (error) {
      notifyError(`Error deleting customer: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle document view/download
  const handleDocumentAction = (url, fileName, action = 'view') => {
    if (!url) {
      notifyWarning(`${fileName} not available`);
      return;
    }

    if (action === 'view') {
      // In a real app, this would open the document in a new tab or modal
      window.open(url, '_blank');
    } else if (action === 'download') {
      // In a real app, this would trigger a download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex w-screen h-screen text-black bg-gray-100 overflow-hidden" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: ' #3B50DF #D9D9D9'
    }}>

      {/* Toast notifications */}
      <ToastContainer className="mt-[70px]" />

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

        <div className="flex flex-1 mt-1 overflow-hidden">
          {/* Customer List Panel */}
          <div className="w-[300px] h-full shadow-md bg-white flex flex-col">
            <div className="p-4 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400 ml-2" />
              </div>
              <input
                type="text"
                placeholder="Type to search customers"
                className="pl-10 bg-white w-full border border-gray-200 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Customer List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className='flex justify-center items-center h-32'>
                  <InlineLoader/>
                </div>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <div 
                    key={customer.customerId}
                    onClick={() => handleCustomerSelect(customer)}
                    className={`p-3 mb-2 cursor-pointer rounded-lg border ${selectedCustomerId == customer.customerId ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className='w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 bg-[#3C50E0]'>
                          {customer.customerFirstName?.charAt(0)}{customer.customerLastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {customer.customerFirstName} {customer.customerLastName}
                          </div>
                          <div className="text-xs text-gray-500">{customer.customerEmail}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No customers found
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            {selectedCustomer ? (
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-semibold">
                    {selectedCustomer.customerFirstName} {selectedCustomer.customerLastName}
                  </h1>
                  <div className="flex gap-2 text-[#3B50DF]">
                    <div 
                      className="bg-gray-100 rounded cursor-pointer p-2 hover:bg-gray-200" 
                      title="Edit Customer"
                      onClick={handleEditToCustomer}
                    >
                      <FaEdit size={18}/>
                    </div>
                    <div 
                      className="bg-gray-100 rounded cursor-pointer p-2 hover:bg-gray-200" 
                      title="Delete Customer"
                      onClick={handleDeleteCustomer}
                    >
                      <MdDelete size={18} />
                    </div>
                    <div 
                      className="bg-gray-100 rounded cursor-pointer p-2 hover:bg-gray-200" 
                      title="Close/Back to Customers"
                      onClick={handleBackToCustomers}
                    >
                      <MdOutlineClose size={18} />
                    </div>
                  </div>
                </div>

                {/* Customer Content with Loading State */}
                {customerLoading ? (
                  <ContentLoader/>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Tabs */}
                    <div className="flex">
                      <button 
                        className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'overview' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                        onClick={() => setActiveTab('overview')}
                      >
                        Overview
                      </button>
                      <button 
                        className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'activity' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                        onClick={() => setActiveTab('activity')}
                      >
                        Activity Log
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                      {activeTab === 'overview' ? (
                        <div className='max-h-[calc(100vh-270px)] overflow-y-auto' style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: ' #3B50DF #D9D9D9'
                        }}>
                          {/* Personal Information */}
                          <div className="mb-8">
                            <h2 className="text-lg font-medium mb-4">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Prefix</span>
                                  <span>{selectedCustomer.customerPrefix || 'Not provided'}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Full Name</span>
                                  <span>{selectedCustomer.customerFirstName} {selectedCustomer.customerLastName}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Phone</span>
                                  <span>{selectedCustomer.customerPhoneNumber || 'Not provided'}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Email</span>
                                  <span>{selectedCustomer.customerEmail}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Address Information */}
                          <div className="mb-8">
                            <h2 className="text-lg font-medium mb-4">Address Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Line 1</span>
                                  <span>{selectedCustomer.addressLine1 || 'Not provided'}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Line 2</span>
                                  <span>{selectedCustomer.addressLine2 || 'Not provided'}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">City</span>
                                  <span>{selectedCustomer.city || 'Not provided'}</span>
                                </div>
                                <div className="flex">
                                  <span className="w-32 text-gray-400">Zip Code</span>
                                  <span>{selectedCustomer.zipCode || 'Not provided'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Customer Documents */}
                          <div>
                            <h2 className="text-lg font-medium mb-4">Customer Documents</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* BRC Document */}
                              <div className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center">
                                    <FileText className="w-5 h-5 text-blue-500 mr-2" />
                                    <span className="font-medium">Business Registration Certificate (BRC)</span>
                                  </div>
                                </div>
                                {selectedCustomer.brcdocUrl ? (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleDocumentAction(selectedCustomer.brcdocUrl, 'BRC_Document.pdf', 'view')}
                                      className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </button>
                                    <button
                                      onClick={() => handleDocumentAction(selectedCustomer.brcdocUrl, 'BRC_Document.pdf', 'download')}
                                      className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    >
                                      <Download className="w-4 h-4 mr-1" />
                                      Download
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">Not uploaded</span>
                                )}
                              </div>

                              {/* VAT Document */}
                              <div className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center">
                                    <FileText className="w-5 h-5 text-green-500 mr-2" />
                                    <span className="font-medium">VAT Registration</span>
                                  </div>
                                </div>
                                {selectedCustomer.vatdocUrl ? (
                                  <div className="flex mt-8 gap-2">
                                    <button
                                      onClick={() => handleDocumentAction(selectedCustomer.vatdocUrl, 'VAT_Document.pdf', 'view')}
                                      className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </button>
                                    <button
                                      onClick={() => handleDocumentAction(selectedCustomer.vatdocUrl, 'VAT_Document.pdf', 'download')}
                                      className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    >
                                      <Download className="w-4 h-4 mr-1" />
                                      Download
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">Not uploaded</span>
                                )}
                              </div>

                              {/* SVAT Document */}
                              <div className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center">
                                    <FileText className="w-5 h-5 text-purple-500 mr-2" />
                                    <span className="font-medium">SVAT Registration</span>
                                  </div>
                                </div>
                                {selectedCustomer.svatdocUrl ? (
                                  <div className="flex mt-8 gap-2">
                                    <button
                                      onClick={() => handleDocumentAction(selectedCustomer.svatdocUrl, 'SVAT_Document.pdf', 'view')}
                                      className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </button>
                                    <button
                                      onClick={() => handleDocumentAction(selectedCustomer.svatdocUrl, 'SVAT_Document.pdf', 'download')}
                                      className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    >
                                      <Download className="w-4 h-4 mr-1" />
                                      Download
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">Not uploaded</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="max-h-[calc(100vh-260px)] overflow-y-auto" style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#3B50DF #D9D9D9'
                        }}>
                          <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
                          {activityLogLoading ? (
                            <div className="flex justify-center items-center h-32">
                              <InlineLoader />
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {activityLogs && activityLogs.length > 0 ? (
                                activityLogs.map((activity, index) => (
                                  <div key={`activity-${index}`} className="border-l-2 border-blue-500 pl-4 py-2">
                                    <p className="text-sm text-gray-500">{activity.actLogTimestamp}</p>
                                    <p>{activity.actLogAction} {activity.actLogPerformedBy}</p>
                                    {activity.actLogDetails && <p className="text-sm text-gray-600">{activity.actLogDetails}</p>}
                                  </div>
                                ))
                              ) : (
                                <div className="border-l-2 border-blue-500 pl-4 py-2">
                                  <p className="text-sm text-gray-500">No activity records found</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">
                  {loading ? <ContentLoader/> : 'Select a customer to view details'}
                </div>
              </div>
            )}
          </div>
        </div>
        
      </div>

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

export default CustomerView;