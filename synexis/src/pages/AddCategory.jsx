import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { IoMdInformationCircle } from "react-icons/io";
import { useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';
import { useNavigate, useParams } from 'react-router-dom';
import useTooltip from '../hooks/useTooltip'; // Import the custom hook

const AddCategoryPage = () => {
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
  const [error, setError] = useState('');

  // Use the custom tooltip hook
  const categoryTooltip = useTooltip(
    () => <div>Choose the category under which this category should be grouped.</div>,
    'right'
  );

  // Fetch parent categories for dropdown
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const response = await categoryService.getAllDetails();
        setParentCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
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
            description: categoryData.description,
            parentCategoryId: categoryData.parentCategoryId || null
          });
          
          // If it has a parent category, check the subcategory box
          setIsSubCategory(!!categoryData.parentCategoryId);
        } catch (err) {
          console.error('Error fetching category details:', err);
          setError('Failed to load category details. Please try again.');
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
    setLoading(true);
    setError('');

    const categoryData = {
      name: formData.name,
      description: formData.description,
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
      setError(
        isEditMode 
          ? 'Failed to update category. Please try again.' 
          : 'Failed to create category. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/category');
  };

  if (loading && isEditMode) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
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
          <h1 className="text-2xl font-semibold mb-4">
            {isEditMode ? 'Update Category' : 'New Category'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

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
                          .filter(category => category && category.categoryId && category.mainCategoryName) // Filter out null/undefined categories
                          .map(category => (
                            <option key={category.parentCategoryId} value={category.parentCategoryId}>
                              {category.mainCategoryName}
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
                disabled={loading}
                className='bg-[#3C50E0] text-white px-6 py-2 rounded mr-4 hover:bg-blue-700 disabled:bg-blue-300'
              >
                {loading ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
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