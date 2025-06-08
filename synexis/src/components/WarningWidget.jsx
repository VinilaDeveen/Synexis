import { AlertTriangle } from 'lucide-react';
import { ButtonLoader } from './loaders';

const InactiveWarning = ({ 
  title,
  entity,
  entityName, 
  onActivate, 
  loading = false,
  className = "" 
}) => {
  return (
    <div className={`bg-yellow-200 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className='flex gap-14'>
        <div className="items-start">
        <div className='flex gap-4'>
            <div><AlertTriangle className="h-5 w-5 text-yellow-800"/></div>
            <div><h3 className="text-sm font-medium text-yellow-800">{title}</h3></div>
        </div>
        <div className="flex gap-8">
          
          <div className="text-sm text-yellow-700 mt-1">
            <p>
              {entityName} is currently inactive and won't be available for use. 
              Activate it to make it available for material assignments and operations.
            </p>
          </div>
          
        </div>
       </div>
        <div className="mt-2 justify-self-end">
            <button
              type="button"
              onClick={onActivate}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 hover:border-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <>
                  <ButtonLoader />
                  <span className="ml-2">Activating...</span>
                </>
              ) : (
                `Activate ${entity}`
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default InactiveWarning;