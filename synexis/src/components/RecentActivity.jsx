import { LuHistory } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";

const RecentActivitiesPanel = ({ isVisible, activities, onClose }) => {
  const [animateClass, setAnimateClass] = useState("");
 
  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure the transition works properly
      setTimeout(() => setAnimateClass("translate-x-0 opacity-100"), 10);
    } else {
      setAnimateClass("translate-x-full opacity-0");
    }
  }, [isVisible]);

  // If not visible and animation completed, don't render anything
  if (!isVisible && animateClass === "translate-x-full opacity-0") return null;
 
  return (
    <div
      className={`fixed right-0 top-[70px] h-[calc(100vh-70px)] w-[350px] bg-white shadow-lg z-10
                  transform transition-all duration-300 ease-in-out ${animateClass}
                  ${!isVisible ? "translate-x-full opacity-0" : ""}`}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <LuHistory size={20} className="text-[#3B50DF] mr-2" />
            Recent Activities
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 bg-white hover:border-white hover:text-gray-700 focus:outline-none transition duration-150"
            aria-label="Close panel"
          >
            <IoClose size={20} />
          </button>
        </div>
        <hr className="mb-4" />
       
        <div 
          className="space-y-4 overflow-y-auto flex-1 custom-scrollbar"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: ' #3B50DF #D9D9D9'
          }}
        >
          <table className="w-full">
            <tbody>
              {activities.map((activity, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3">
                    <div className="flex text-sm">
                      <div className="w-[110px]">{activity.item}</div>
                      <div className="w-[90px]">{activity.action} -</div>
                      <div className="w-[100px]">{activity.user}</div>
                    </div>
                    <div className="text-gray-500 text-xs mt-1">{activity.date}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentActivitiesPanel;