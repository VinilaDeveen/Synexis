import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader,
  ContentLoader 
} from '../components/loaders';
import { IoMdImage } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { IoMdInformationCircle } from "react-icons/io";
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTooltip from '../hooks/useTooltip';
import { brandService } from '../services/brandService';
import Select from 'react-select';
import { getNames } from 'country-list';
import 'country-flag-icons/3x2/flags.css'; 

const AddBrandPage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const { id } = useParams(); // Get the brand ID from URL if editing
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    description: '',
    websiteUrl: '',
    image: null,
    brandId: null,
    imageUrl: null // Separate field to store the URL for display
  });


  const [originalImageFile, setOriginalImageFile] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Add a specific state for submit button loading
  const [error, setError] = useState('');
  const isInitialLoad = useRef(true);

  const convertImageUrlToFile = async (imageUrl, brandId, filename = 'brand-image.jpg') => {
    try {
      const response = await fetch(`http://localhost:8080/api/synexis/brand/image/${brandId}`);
      const blob = await response.blob();
      
      // Create a File object from the blob
      const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
      return file;
    } catch (error) {
      console.error('Error converting image URL to File:', error);
      return null;
    }
  };

  // Move the custom tooltip hooks inside the component
  const brandCountryTooltip = useTooltip(
    () => <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem esse error accusantium aut est? Velit distinctio suscipit ex obcaecati voluptatem sunt quisquam, est optio, itaque iste nobis ducimus totam eos.</div>,
    'right'
  );

  const brandImageTooltip = useTooltip(
    () => <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem esse error accusantium aut est? Velit distinctio suscipit ex obcaecati voluptatem sunt quisquam, est optio, itaque iste nobis ducimus totam eos.</div>,
    'right'
  );

  const brandWebURLTooltip = useTooltip(
    () => <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem esse error accusantium aut est? Velit distinctio suscipit ex obcaecati voluptatem sunt quisquam, est optio, itaque iste nobis ducimus totam eos.</div>,
    'right'
  );

  // If in edit mode, fetch the brand details
  useEffect(() => {
    if (isEditMode) {
      const fetchBrandDetails = async () => {
        setLoading(true);
        try {
          const response = await brandService.getById(id);
          const brandData = response.data;
          
          // First set the basic form data
          setFormData({
            name: brandData.brandName,
            country: brandData.brandCountry,
            description: brandData.brandDescription,
            websiteUrl: brandData.brandWebsite,
            image: null,
            brandId: brandData.brandId,
            imageUrl: brandData.brandImageUrl
          });

          // If there's an existing image, convert it to File object
          if (brandData.brandImageUrl && brandData.brandId) {
            const imageFile = await convertImageUrlToFile(
              brandData.brandImageUrl, 
              brandData.brandId,
              `brand-${brandData.brandId}-image.jpg`
            );
            
            if (imageFile) {
              setOriginalImageFile(imageFile);
              setFormData(prev => ({
                ...prev,
                image: imageFile // Set the converted File as the default image
              }));
            }
          }
          
        } catch (err) {
          if (isInitialLoad.current) {
            notifyError('Failed to load brand details. Please try again.')
          }
        } finally {
          setLoading(false);
        }
      };

      fetchBrandDetails();
    }
  }, [id, isEditMode]);
 
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const countryOptions = getNames().map(name => {
    // Map country names to ISO codes (you might need a more comprehensive mapping)
    const countryCode = name.toLowerCase().replace(/\s+/g, '-');
    return {
      value: name,
      label: name,
      code: countryCode
    };
  });

  const formatOptionLabel = ({ value, label, code }) => (
    <div className="flex items-center">
      <span className={`flag:${code} mr-2`} style={{ width: '20px', height: '15px' }} />
      {label}
    </div>
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id === 'brandName' ? 'name' : 
       id === 'brandDescription' ? 'description' : 
       id === 'brandWebsiteUrl' ? 'websiteUrl' : id]: value
    }));
  };

  const handleCountryChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      country: selectedOption.value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prevState => ({
        ...prevState,
        image: e.target.files[0]
      }));
      setImageChanged(true);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData(prevState => ({
        ...prevState,
        image: e.dataTransfer.files[0]
      }));
      setImageChanged(true);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteImage = () => {
    setFormData(prev => ({
      ...prev, 
      image: null,
      imageUrl: null
    }));
    setImageChanged(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    const formDataToSend = new FormData();
    formDataToSend.append('brandName', formData.name);
    formDataToSend.append('brandCountry', formData.country);
    formDataToSend.append('brandDescription', formData.description || '');
    formDataToSend.append('brandWebsite', formData.websiteUrl || '');

    // Always append the image if it exists (whether original or new)
    if (formData.image instanceof File) {
      formDataToSend.append('brandImage', formData.image);
    }

    try {
      if (isEditMode) {
        await brandService.update(id, formDataToSend);
      } else {
        await brandService.create(formDataToSend);
      }
      navigate('/inventory/brand');
    } catch (err) {
      console.error('Error saving brand:', err);
      isEditMode
        ? notifyError('Failed to update brand. Please try again.')
        : notifyError('Failed to create brand. Please try again.') 
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/inventory/brand');
  };

  if (loading && isEditMode) {
    return <FullPageLoader />; // Use your FullPageLoader component when loading brand data
  }

  return (
    <div className="flex w-screen h-screen text-black bg-gray-100" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: ' #3B50DF #D9D9D9'}}>
      {/* Sidebar */}
      <div className="">
        <div className=""><Sidebar/></div>
        {/* Sidebar content would go here */}
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
            {isEditMode ? 'Update Brand' : 'New Brand'}
          </h1>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Add/Edit Brand Form */}
          <div className={`overflow-y-auto max-h-[calc(100vh-240px)] min-h-[calc(100vh-240px)] bg-white rounded-lg shadow-lg p-6`} style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#3B50DF #D9D9D9'
          }}>
            <div className="max-w-4xl mx-auto p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name">
                        Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Country Field */}
                    <div>
                      <div className="flex">
                        <div>
                          <label htmlFor="country">
                            Country<span className="text-red-500">*</span>
                          </label>
                        </div>
                        <div className='ml-2'>
                          <brandCountryTooltip.Tooltip {...brandCountryTooltip.tooltipProps}>
                            <div className="text-slate-700 cursor-help">
                              <IoMdInformationCircle size={18} />
                            </div>
                          </brandCountryTooltip.Tooltip>
                        </div>
                      </div>
                      
                      <Select
                        id="country"
                        name="country"
                        required
                        options={countryOptions}
                        value={countryOptions.find(option => option.value === formData.country)}
                        onChange={handleCountryChange}
                        className="mt-1"
                        classNamePrefix="select"
                        placeholder="Select a country..."
                        formatOptionLabel={formatOptionLabel}
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            backgroundColor: '#EFF6FF',
                            border: '1px solid transparent',
                            borderRadius: '0.375rem',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            minHeight: '42px',
                            '&:hover': {
                              borderColor: 'transparent'
                            }
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected ? '#3B50DF' : 'white',
                            color: state.isSelected ? 'white' : 'black',
                            padding: '8px 12px', // Increased padding
                            height: '40px', // Increased height
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '14px',
                            '&:hover': {
                              backgroundColor: state.isSelected ? '#3B50DF' : '#f3f4f6'
                            }
                          }),
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999, // Ensure dropdown appears above other elements
                            borderRadius: '8px', // Rounded corners for dropdown
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                          }),
                          menuList: (provided) => ({
                            ...provided,
                            padding: 0 // Remove default padding
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            display: 'flex',
                            alignItems: 'center'
                          })
                        }}
                      />
                    </div>

                    {/* Description Field */}
                    <div>
                      <label htmlFor="description">
                        Description
                      </label>
                      <textarea
                        id="brandDescription"
                        rows={5}
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="ml-[100px] space-y-6">
                    {/* Image/Logo Upload with Drag and Drop */}
                    <div className='w-[300px]'>
                      <label className="block flex items-center mb-1">
                        Image/ Logo
                        {/* Using the custom tooltip hook */}
                        <brandImageTooltip.Tooltip {...brandImageTooltip.tooltipProps}>
                          <div className="text-slate-700 cursor-help">
                            <IoMdInformationCircle size={18} />
                          </div>
                        </brandImageTooltip.Tooltip>
                      </label>
                      
                      {/* Hidden file input - placed outside conditional rendering */}
                      <input 
                        ref={fileInputRef}
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only"
                        accept="image/*" 
                        onChange={handleImageChange}
                      />
                      
                      {/* Display image preview or placeholder */}
                      {formData.image instanceof File || formData.imageUrl ? (
                        <div className="bg-blue-50 rounded-md p-3 flex flex-col items-center">
                          <div className="h-24 w-35 bg-black flex items-center justify-center mb-3">
                            {formData.image instanceof File ? (
                              <img 
                                src={URL.createObjectURL(formData.image)} 
                                alt="Preview" 
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : formData.imageUrl && formData.brandId && !imageChanged ? (
                              <img 
                                src={`http://localhost:8080/api/synexis/brand/image/${formData.brandId}`} 
                                alt="Preview" 
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : null}
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <button 
                              type="button"
                              onClick={handleBrowseClick}
                              className="flex bg-blue-50 items-center text-sm font-medium hover:border-blue-50 hover:text-[#3B50DF] focus:outline-none"
                            >
                              <span className='mt-5'>Change Image</span>
                              <span className="text-blue-600">
                                
                              </span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={handleDeleteImage}
                              className="mt-5 text-[#3B50DF] bg-blue-50 hover:text-red-500 hover:border-blue-50  focus:outline-none"
                            >
                              <MdDelete size={25}/>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className={`flex flex-col items-center justify-center px-6 pt-5 pb-6 bg-blue-50 border-2 border-dashed rounded-md h-48 transition-colors ${dragActive ? 'border-blue-500 bg-blue-100' : 'border-transparent'}`}
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                        >
                          <div className="space-y-2 text-center">
                            <div className="mx-auto flex items-center rounded-md justify-center">
                              <IoMdImage className='' size={80}/>
                            </div>
                            <div className="flex flex-col text-sm text-gray-600">
                              <span>Drag image here or</span>
                              <button
                                type="button"
                                onClick={handleBrowseClick}
                                className="text-blue-600 bg-blue-50 hover:border-blue-50 hover:text-blue-500 focus:outline-none"
                              >
                                Browse image
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Website URL Field */}
                    <div>
                      <div className='flex'>
                        <div>
                          <label htmlFor="websiteUrl" className="block flex items-center">
                            Website URL
                          </label>
                        </div>
                        <div className="ml-2">
                          {/* Fixed: Using brandWebURLTooltip instead of categoryTooltip */}
                          <brandWebURLTooltip.Tooltip {...brandWebURLTooltip.tooltipProps}>
                            <div className="text-slate-700 cursor-help">
                              <IoMdInformationCircle size={18} />
                            </div>
                          </brandWebURLTooltip.Tooltip>
                        </div>
                      </div>
                      
                      <input
                        type="url"
                        id="websiteUrl"
                        name="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={handleChange}
                        className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>             
          </div>
          
          <div className='flex justify-end mt-4'>
            <button 
              onClick={handleSubmit}
              disabled={submitting} // Use submitting state instead of loading
              className='bg-[#3C50E0] text-white px-6 py-2 rounded mr-4 hover:bg-blue-700 disabled:bg-[#3C50E0]'
            >
              {submitting ? <ButtonLoader text={isEditMode ? "Updating..." : "Saving..."} /> : isEditMode ? 'Update' : 'Save'}
            </button>
            <button 
              type='button'
              onClick={handleCancel}
              disabled={submitting} // Also disable cancel button during submission
              className='bg-gray-100 text-black border border-[#3B50DF] px-4 py-2 rounded hover:bg-gray-100 disabled:opacity-50'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBrandPage;