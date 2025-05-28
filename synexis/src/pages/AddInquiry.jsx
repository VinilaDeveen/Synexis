import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  FullPageLoader, 
  ButtonLoader
} from '../components/loaders';
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';
import { useState, useEffect, useRef } from 'react';
import { inquiryService } from '../services/inquiryService';
import { useNavigate, useParams } from 'react-router-dom';

const AddInquiriesPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const { id } = useParams(); // Get the inquiry ID from URL if editing
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    salesPerson: '',
    estimator: '',
    customer: '',
    projectName: '',
    inquiryType: '',
    projectType: '',
    projectReturnDate: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isInitialLoad = useRef(true);

  // Inquiry Type options
  const inquiryTypeOptions = [
    { value: 'GENERAL', label: 'General' },
    { value: 'TENDER', label: 'Tender' }
  ];

  // Project Type options
  const projectTypeOptions = [
    { value: 'MECHANICAL', label: 'Mechanical' },
    { value: 'ELECTROMECHANICAL', label: 'Mechanical+Electrical' },
    { value: 'SERVICE', label: 'Service' },
    { value: 'PROJECT', label: 'Project' }
  ];

  // Helper function to convert date from "DD-MMM-YYYY" to "YYYY-MM-DD"
  const convertDateToInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      console.log('Converting date to input:', dateString); // Debug log
      
      // Handle different possible formats
      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        
        // Check if it's already in YYYY-MM-DD format
        if (parts[0].length === 4 && parts.length === 3) {
          return dateString; // Already in correct format
        }
        
        // Parse "15-June-2025" or "15-Jun-2025" format
        const [day, month, year] = parts;
        const monthNames = {
          'January': '01', 'Jan': '01', 'February': '02', 'Feb': '02', 
          'March': '03', 'Mar': '03', 'April': '04', 'Apr': '04',
          'May': '05', 'June': '06', 'Jun': '06', 'July': '07', 'Jul': '07',
          'August': '08', 'Aug': '08', 'September': '09', 'Sep': '09',
          'October': '10', 'Oct': '10', 'November': '11', 'Nov': '11', 
          'December': '12', 'Dec': '12'
        };
        
        const monthNumber = monthNames[month];
        if (!monthNumber) {
          console.error('Unknown month:', month);
          return '';
        }
        
        const paddedDay = day.padStart(2, '0');
        const result = `${year}-${monthNumber}-${paddedDay}`;
        console.log('Converted result:', result); // Debug log
        return result;
      }
      
      // Try to parse as a regular date string
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      return '';
    } catch (error) {
      console.error('Error converting date:', error);
      return '';
    }
  };

  // Helper function to convert date from "YYYY-MM-DD" to "DD-MMM-YYYY"
  const convertDateFromInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      console.log('Converting date from input:', dateString); // Debug log
      
      const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return dateString;
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      const result = `${day}-${month}-${year}`;
      console.log('Converted result:', result); // Debug log
      return result;
    } catch (error) {
      console.error('Error converting date from input:', error);
      return dateString;
    }
  };

  // If in edit mode, fetch the inquiry details
  useEffect(() => {
    if (isEditMode) {
      const fetchInquiryDetails = async () => {
        setLoading(true);
        try {
          const response = await inquiryService.getById(id);
          const inquiryData = response.data;
          
          console.log('Fetched inquiry data:', inquiryData); // Debug log
          
          setFormData({
            salesPerson: inquiryData.salesPersonName || '',
            estimator: inquiryData.estimatorName || '',
            customer: inquiryData.customerName || '',
            projectName: inquiryData.projectName || '',
            inquiryType: inquiryData.inquiryType || '',
            projectType: inquiryData.projectType || '',
            projectReturnDate: convertDateToInput(inquiryData.projectReturnDate)
          });
        } catch (err) {
          console.error('Error fetching inquiry:', err); // Debug log
          notifyError('Failed to load inquiry details. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchInquiryDetails();
    }
  }, [id, isEditMode]);
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    console.log('Input change:', id, value); // Debug log
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare the data with proper date format for API
      const submitData = {
        ...formData,
        projectReturnDate: convertDateFromInput(formData.projectReturnDate)
      };

      console.log('Submit data:', submitData); // Debug log

      if (isEditMode) {
        await inquiryService.update(id, submitData);
        notifySuccess('Inquiry updated successfully!');
      } else {
        await inquiryService.create(submitData);
        notifySuccess('New inquiry created successfully!');
      }
      // Redirect to inquiries list page after successful operation
      navigate('/estimation/inquiry');
    } catch (err) {
      console.error('Error saving inquiry:', err);
      isEditMode 
          ? notifyError('Failed to update inquiry. Please try again.') 
          : notifyError('Failed to create inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/estimation/inquiry');
  };

  if (loading && isEditMode) {
    return <FullPageLoader />;
  }

  return (
    <div className="flex w-screen h-screen text-black bg-gray-100" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: ' #3B50DF #D9D9D9'}}>
      {/* Sidebar */}
      <div className="">
        <div className=""><Sidebar/></div>
      </div>

      {/* Main Content */}
      <div className="flex w-screen flex-col">
        {/* Header */}
        <div>
          <Navbar/>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1">

          {/* Toast notifications */}
          <ToastContainer className="mt-[70px]" />

          <h1 className="text-2xl font-semibold mb-4">
            {isEditMode ? 'Update Inquiry' : 'New Inquiry'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Add/Edit Inquiry Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-3 gap-6">
                {/* First Row */}
                <div>
                  <label htmlFor="salesPerson" className="block mb-2">Sales Person</label>
                  <input 
                    type="text" 
                    id="salesPerson"
                    value={formData.salesPerson}
                    onChange={handleInputChange}
                    className="p-2 bg-[#E3F0FF] w-full rounded"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="estimator" className="block mb-2">Estimator</label>
                  <input 
                    type="text" 
                    id="estimator"
                    value={formData.estimator}
                    onChange={handleInputChange}
                    className="p-2 bg-[#E3F0FF] w-full rounded"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="customer" className="block mb-2">Customer</label>
                  <input 
                    type="text" 
                    id="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    className="p-2 bg-[#E3F0FF] w-full rounded"
                    required
                  />
                </div>

                {/* Second Row */}
                <div>
                  <label htmlFor="projectName" className="block mb-2">Project Name</label>
                  <input 
                    type="text" 
                    id="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    className="p-2 bg-[#E3F0FF] w-full rounded"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="inquiryType" className="block mb-2">Inquiry Type</label>
                  <select
                    id="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="p-2 bg-[#E3F0FF] w-full rounded"
                    required
                  >
                    <option value="">Select Inquiry Type</option>
                    {inquiryTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="projectType" className="block mb-2">Project Type</label>
                  <select
                    id="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="p-2 bg-[#E3F0FF] w-full rounded"
                    required
                  >
                    <option value="">Select Project Type</option>
                    {projectTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Third Row - Fixed Date Input */}
                <div className="col-span-1">
                  <label htmlFor="projectReturnDate" className="block mb-2">Project Return Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      id="projectReturnDate"
                      name="projectReturnDate"
                      value={formData.projectReturnDate}
                      onChange={handleInputChange}
                      className="p-2 bg-[#E3F0FF] w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      style={{ colorScheme: 'light' }} // Ensures date picker is visible
                    />
                    {/* Removed the calendar icon as it might interfere with native date picker */}
                  </div>
                </div>
              </div>
            </div>
            <div className='flex justify-end mt-4'>
              <button 
                type="submit"
                disabled={submitting}
                className='bg-[#3C50E0] text-white px-6 py-2 rounded mr-4 hover:bg-blue-700 disabled:bg-blue-400'
              >
                {submitting ? <ButtonLoader text={isEditMode ? "Updating..." : "Saving..."} /> : isEditMode ? 'Update' : 'Save'}
              </button>
              <button 
                type="button"
                onClick={handleCancel}
                className='bg-gray-100 text-black border border-[#3B50DF] px-4 py-2 rounded hover:bg-gray-200'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInquiriesPage;