import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader,
  ContentLoader 
} from '../components/loaders';
import { useState, useEffect, useRef } from 'react';
import { Menu, Search } from 'lucide-react';
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdOutlineClose } from "react-icons/md";
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { inquiryService } from '../services/inquiryService';
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';

const InquiryViewPage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLogLoading, setActivityLogLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [loading, setLoading] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const isInitialLoad = useRef(true);
  const isInitialLoad1 = useRef(true);
  
  // For accessing route parameters and state
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the selectedInquiryId from state or from URL parameter
  const selectedInquiryId = location.state?.selectedInquiryId || id;

  // State for inquiries
  const [inquiries, setInquiries] = useState([]);

  // Add this useEffect to fetch activity logs
    useEffect(() => {
      const fetchActivityLogs = async () => {
        if (!selectedInquiryId) return;
        
        try {
          setActivityLogLoading(true);
          const response = await inquiryService.getInquiryActivityLogs(selectedInquiryId);
          
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
      if (activeTab === 'activity' && selectedInquiryId) {
        fetchActivityLogs();
      }
    }, [selectedInquiryId, activeTab]);
  
  // Fetch inquiries list data
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const response = await inquiryService.getSideDrop();
        if (response && response.data) {
          setInquiries(response.data);
        }
      } catch (error) {
        if (isInitialLoad.current) {
          console.error('Error fetching inquiries:', error);
          notifyError('Failed to load inquiries');
          isInitialLoad.current = false
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  // Fetch selected inquiry by ID when selectedInquiryId changes
  useEffect(() => {
    const fetchInquiryById = async (id) => {
      if (!id) return;
      
      try {
        setInquiryLoading(true);
        const response = await inquiryService.getById(id);
        if (response && response.data) {
          setSelectedInquiry(response.data);
        } else {
          notifyWarning('Inquiry not found');
        }
      } catch (error) {
        if (isInitialLoad1.current) {
          console.error('Error fetching inquiry details:', error);
          notifyError('Failed to load inquiry details');
          isInitialLoad1.current = false;
        }
      } finally {
        setInquiryLoading(false);
      }
    };

    if (selectedInquiryId) {
      fetchInquiryById(selectedInquiryId);
    } else if (inquiries.length > 0 && !selectedInquiry) {
      // Default to first inquiry if none selected
      handleInquirySelect(inquiries[0]);
    }
  }, [selectedInquiryId, inquiries]);

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

  // Handle inquiry selection and update URL
  const handleInquirySelect = (inquiry) => {
    navigate(`/inquiryView/${inquiry.inquiryId}`, { 
      state: { selectedInquiryId: inquiry.inquiryId },
      replace: true 
    });
    // The useEffect hook with selectedInquiryId dependency will trigger
    // the API call to fetch the inquiry details
  };

  // Filter inquiries based on search term
  const filteredInquiries = searchTerm.trim() === '' 
    ? inquiries 
    : inquiries.filter(inquiry => 
        inquiry.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.inquiryType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.projectType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.salesPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.inquiryId?.toString().includes(searchTerm)
      );


  // Handle back to inquiries
  const handleBackToInquiries = () => {
    navigate('/inquiry');
  };

  const handleEditInquiry = () => {
    navigate(`/editinquiry/${selectedInquiryId}`);
  };

  const handleDeleteInquiry = async () => {
    if (!selectedInquiryId) return;

    try {
      setLoading(true);
      await inquiryService.delete(selectedInquiryId);
      notifySuccess(`Inquiry "${selectedInquiry.projectName}" successfully deleted`);
      
      // After deletion, navigate back to inquiries list
      navigate('/inquiry');
    } catch (error) {
      notifyError(`Error deleting inquiry: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Get inquiry status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          {/* Inquiry List Panel */}
          <div className="w-[300px] h-full shadow-md bg-white flex flex-col">
            <div className="p-4 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400 ml-2" />
              </div>
              <input
                type="text"
                placeholder="Type to search"
                className="pl-10 bg-white w-full border border-gray-200 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Inquiry List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className='flex justify-center items-center h-32'>
                  <InlineLoader/>
                </div>
              ) : filteredInquiries.length > 0 ? (
                filteredInquiries.map((inquiry) => (
                  <div 
                    key={inquiry.inquiryId}
                    onClick={() => handleInquirySelect(inquiry)}
                    className={`p-3 mb-2 cursor-pointer rounded-lg ${selectedInquiryId == inquiry.inquiryId ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{inquiry.projectName}</span>
                      <span className="text-xs text-gray-500">({inquiry.quotationNumber})</span>
                      <div className="mt-1">
                        <span className="bg-[#3119C3] text-white text-xs px-2 py-1 rounded-md">
                          {inquiry.inquiryType}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No inquiries found
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            {selectedInquiry ? (
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-semibold">
                    {selectedInquiry.projectName}
                  </h1>
                  <div className="flex text-[#3B50DF]">
                    <div 
                      className="bg-gray-100 rounded cursor-pointer p-2" 
                      title="Edit Inquiry"
                      onClick={handleEditInquiry}
                    >
                      <FaEdit size={18}/>
                    </div>
                    <div 
                      className="bg-gray-100 rounded cursor-pointer p-2" 
                      title="Delete Inquiry"
                      onClick={handleDeleteInquiry}
                    >
                      <MdDelete size={18} />
                    </div>
                    <div 
                      className="bg-gray-100 rounded cursor-pointer p-2" 
                      title="Close/Back to Inquiries"
                      onClick={handleBackToInquiries}
                    >
                      <MdOutlineClose size={18} />
                    </div>
                  </div>
                </div>

                {/* Inquiry Content with Loading State */}
                {inquiryLoading ? (
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
                        <div>
                          {/* General Information */}
                          <div className="mb-8">
                            <h2 className="text-lg font-medium mb-4">General Information</h2>
                            <div className="space-y-3">
                              <div className="flex">
                                <span className="w-32 text-gray-400">Project Name</span>
                                <span>{selectedInquiry.projectName}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 text-gray-400">Customer</span>
                                <span>{selectedInquiry.customerName}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 text-gray-400">Inquiry Type</span>
                                <span>{selectedInquiry.inquiryType}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 text-gray-400">Project Type</span>
                                <span>{selectedInquiry.projectType}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 text-gray-400">Sales Person</span>
                                <span>{selectedInquiry.salesPersonName}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 text-gray-400">Estimator</span>
                                <span>{selectedInquiry.estimatorName}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 text-gray-400">Return Date</span>
                                <span>{selectedInquiry.projectReturnDate}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 text-gray-400">Status</span>
                                <span className={`px-2 py-1 rounded-md text-xs ${getStatusColor(selectedInquiry.inquiryStatus)}`}>
                                  {selectedInquiry.inquiryStatus || 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Notes Section */}
                          {selectedInquiry.notes && (
                            <div className="mt-8">
                              <h2 className="text-lg font-medium mb-4">Notes</h2>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700">{selectedInquiry.notes}</p>
                              </div>
                            </div>
                          )}
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
                  {loading ? <ContentLoader/> : 'Select an inquiry to view details'}
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

export default InquiryViewPage;