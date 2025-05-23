import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader,
  ContentLoader 
} from '../components/loaders';
import { IoMdInformationCircle } from "react-icons/io";
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';
import { useEffect, useState, useRef } from 'react';
import { categoryService } from '../services/categoryService';
import { useNavigate, useParams } from 'react-router-dom';
import useTooltip from '../hooks/useTooltip'; // Import the custom hook

const AddCategoryPage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const { id } = useParams(); // Get the category ID from URL if editing
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategoryId: null
  });
  
  const [isSubCategory, setIsSubCategory] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Add a specific state for submit button loading
  const isInitialLoad = useRef(true);

  // Use the custom tooltip hook
  const categoryTooltip = useTooltip(
    () => <div>Choose the category under which this category should be grouped.</div>,
    'right'
  );

  // Fetch parent categories for dropdown
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const response = await categoryService.getAllParentCategories();
        setParentCategories(response.data);
      } catch (err) {
        if (isInitialLoad.current) {
          notifyError('Failed to load categories. Please try again.')
          isInitialLoad.current = false;
        }
        
      }
    };

    fetchParentCategories();
  }, []);

  // If in edit mode, fetch the category details
  useEffect(() => {
    if (isEditMode) {
      const fetchCategoryDetails = async () => {
        setLoading(true);
        try {
          const response = await categoryService.getById(id);
          const categoryData = response.data;
          
          setFormData({
            name: categoryData.categoryName,
            description: categoryData.categoryDescription,
            parentCategoryId: categoryData.parentCategoryId || null
          });
          
          // If it has a parent category, check the subcategory box
          setIsSubCategory(!!categoryData.parentCategoryId);
        } catch (err) {
          notifyError('Failed to load category details. Please try again.')
            
        } finally {
          setLoading(false);
        }
      };

      fetchCategoryDetails();
    }
  }, [id, isEditMode]);
  
  const handleSubCategoryChange = (e) => {
    setIsSubCategory(e.target.checked);
    if (!e.target.checked) {
      setFormData(prev => ({
        ...prev,
        parentCategoryId: null
      }));
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id === 'categoryName' ? 'name' : 
       id === 'categoryDescription' ? 'description' : id]: value
    }));
  };

  const handleParentChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      parentCategoryId: value ? Number(value) : null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); // Set submitting to true when the save/update button is clicked

    const categoryData = {
      categoryName: formData.name,
      categoryDescription: formData.description,
      parentCategoryId: isSubCategory ? formData.parentCategoryId : null
    };

    try {
      if (isEditMode) {
        await categoryService.update(id, categoryData);
      } else {
        await categoryService.create(categoryData);
      }
      // Redirect to categories list page after successful operation
      navigate('/category');
    } catch (err) {
      console.error('Error saving category:', err);
      isEditMode 
          ? notifyError('Failed to update category. Please try again.') 
          : notifyError('Failed to create category. Please try again.')
      setSubmitting(false); // Reset submitting state if there's an error
    } finally {
    
    }
  };

  const handleCancel = () => {
    navigate('/category');
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
            {isEditMode ? 'Update Category' : 'New Category'}
          </h1>

          {/* Add/Edit Category Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="p-4 justify-between">
                <div>
                  <label htmlFor="categoryName">Category Name</label>
                  <div className='mt-3'>
                    <input 
                      type="text" 
                      id="categoryName"
                      value={formData.name}
                      onChange={handleInputChange}
                      className='p-2 bg-[#E3F0FF] w-[400px] rounded'
                      required
                    />
                  </div>
                </div>
                <div className='mt-4'>
                  <label htmlFor="categoryDescription">Category Description</label>
                  <div className='mt-3'>
                    <textarea 
                      id="categoryDescription"
                      value={formData.description}
                      onChange={handleInputChange}
                      className='p-2 bg-[#E3F0FF] w-[600px] rounded'
                      rows={4}
                    />
                  </div>
                </div>

                <div className='mt-4 flex items-center'>
                  {/* Custom styled checkbox */}
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="isSubCategory"
                      name="isSubCategory"
                      checked={isSubCategory}
                      onChange={handleSubCategoryChange}
                      className="absolute opacity-0 w-4 h-4 cursor-pointer"
                    />
                    <div className={`w-4 h-4 mr-2 border ${
                      isSubCategory 
                        ? 'bg-[#3C50E0] border-blue-500' 
                        : 'bg-slate-200 border-slate-300'
                    } flex items-center justify-center`}>
                      {isSubCategory && (
                        <svg 
                          className="w-3 h-3 text-white" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="3" 
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      )}
                    </div>
                    <label className="text-black cursor-pointer mr-2" htmlFor="isSubCategory">
                      Add as a Sub-Category
                    </label>

                    {/* Using the custom tooltip hook */}
                    <categoryTooltip.Tooltip {...categoryTooltip.tooltipProps}>
                      <div className="text-slate-700 cursor-help">
                        <IoMdInformationCircle size={18} />
                      </div>
                    </categoryTooltip.Tooltip>
                  </div>
                </div>
                
                {/* Parent Category Dropdown - Only visible when isSubCategory is checked */}
                {isSubCategory && (
                  <div className="mt-4">
                    <label htmlFor="parentCategory" className="block mb-2">Parent Category</label>
                    <div className='flex'>
                      <div>
                      <select
                        id="parentCategory"
                        value={formData.parentCategoryId || ''}
                        onChange={handleParentChange}
                        className="py-2 bg-[#E3F0FF] w-[400px] rounded focus:outline-none"
                        required={isSubCategory}
                      >
                        <option value="">Select Parent Category</option>
                        {parentCategories
                          .filter(category => category && category.parentCategoryId ) // Filter out null/undefined categories
                          .map(category => (
                            <option key={category.parentCategoryId} value={category.parentCategoryId}>
                              {category.parentCategoryName}
                            </option>
                          ))
                        }
                      </select>
                      </div>
                      <div className='mt-3'>
                        {/* Using the custom tooltip hook again with the same configuration */}
                        <categoryTooltip.Tooltip {...categoryTooltip.tooltipProps}>
                          <div className="ml-2 text-slate-700 cursor-help">
                            <IoMdInformationCircle size={23} />
                          </div>
                        </categoryTooltip.Tooltip>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className='flex justify-end mt-4'>
              <button 
                type="submit"
                disabled={submitting}
                className='bg-[#3C50E0] text-white px-6 py-2 rounded mr-4 hover:bg-blue-700 disabled:bg-[ #3C50E0]'
              >
                {submitting ? <ButtonLoader text={isEditMode ? "Updating..." : "Saving..."} /> : isEditMode ? 'Update' : 'Save'}
              </button>
              <button 
                type="button"
                onClick={handleCancel}
                className='bg-gray-100 text-black border border-[#3B50DF] px-4 py-2 rounded hover:bg-gray-100'
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

export default AddCategoryPage;