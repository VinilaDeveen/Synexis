import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/icons/synexis.png';
import { Typography, List, ListItem, ListItemPrefix, Accordion, AccordionHeader, AccordionBody } from "@material-tailwind/react";
import { BiSolidDashboard } from "react-icons/bi";
import { BsFillPeopleFill } from "react-icons/bs";
import { PiProjectorScreenChartFill } from "react-icons/pi";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { MdOutlineInventory } from "react-icons/md";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Menu, X } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [open, setOpen] = useState(0);
  const location = useLocation();

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Helper function to check if the current path matches a route
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Helper function to check if a path is in the current location
  const isInPath = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="flex h-screen">
      <div 
        className={`bg-gray-800 text-white transition-all duration-300 flex flex-col ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center p-4 border-b border-gray-700">
          <div className="ml-2 mt-2 flex items-center justify-center w-8 h-8">
            <img
              alt="Synexis Logo"
              src={logo}
            />
          </div>
            
          {isOpen && (
            <span className="font-medium text-3xl fontFamily: 'Anaheim' text-white">YNEXIS</span>
          )}
          
          <button 
            onClick={toggleSidebar} 
            className={`ml-auto p-1 bg-gray-800 rounded-md hover:text-gray-700 hover:border-gray-800 focus:outline-none ${isOpen ? '' : 'bg-gray-800 hidden'}`}
          >
            <X size={20} />
          </button>
        </div>
        
        {!isOpen && (
          <button 
            onClick={toggleSidebar} 
            className="ml-4 mt-2 p-2 rounded-md bg-gray-800 hover:text-gray-700 hover:border-gray-800 focus:outline-none"
          >
            <Menu size={22} />
          </button>
        )}
        
        <div className="flex-1 overflow-y-auto pt-2">
          <nav className="px-2">

            {/* Inventory Section */}
            <Accordion
              open={isOpen && (open === 2 || isInPath('/inventory'))}
              icon={
                isOpen ? (
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`mx-auto h-4 w-4 transition-transform ${
                      open === 2 || isInPath('/inventory') ? "rotate-180" : ""
                    }`}
                  />
                ) : null
              }
            >
              <ListItem 
                className={`p-0 mt-2 ${isInPath('/inventory') ? 'bg-[#3C50E0]' : ''}`} 
                selected={open === 2}
              >
                <AccordionHeader
                  onClick={() => isOpen && handleOpen(2)}
                  className={`border-b-0 ${isOpen ? 'pl-4 bg-gray-800 hover:border-gray-800' : 'bg-gray-800 pr-4 justify-center hover:border-gray-800'} focus:outline-none ${isInPath('/inventory') ? '' : ''}`}
                >
                  <ListItemPrefix>
                    <MdOutlineInventory className="ml-3 h-6 w-6" />
                  </ListItemPrefix>
                  {isOpen && (
                    <Typography color="blue-gray" className="font-normal">
                      Inventory
                    </Typography>
                  )}
                </AccordionHeader>
              </ListItem>
              {isOpen && (open === 2 || isInPath('/inventory')) && (
                <AccordionBody className="py-1">
                  <List className="p-0 text-white">
                    <Link to="/inventory/material">
                      <ListItem className={`${isInPath('/inventory/material') ? 'bg-[#3C50E0]' : 'hover:bg-[#3C50E0]'} text-white`}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Materials
                      </ListItem>
                    </Link>
                    <Link to="/inventory/category">
                      <ListItem className={`${isInPath('/inventory/category') ? 'bg-[#3C50E0]' : 'hover:bg-[#3C50E0]'} text-white`}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Categories
                      </ListItem>
                    </Link>
                    <Link to="/inventory/brand">
                      <ListItem className={`${isInPath('/inventory/brand') ? 'bg-[#3C50E0]' : 'hover:bg-[#3C50E0]'} text-white`}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Brands
                      </ListItem>
                    </Link>
                    <Link to="/inventory/unit">
                      <ListItem className={`${isInPath('/inventory/unit') ? 'bg-[#3C50E0]' : 'hover:bg-[#3C50E0]'} text-white`}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Units
                      </ListItem>
                    </Link>
                    <Link to="/inventory/materials-assemble">
                      <ListItem className={`${isActive('/inventory/materials-assemble') ? 'bg-[#3C50E0]' : 'hover:bg-[#3C50E0]'} text-white`}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Materials Assemble
                      </ListItem>
                    </Link>
                  </List>
                </AccordionBody>
              )}
            </Accordion>

            {/* People Section */}
            <Accordion
              open={isOpen && (open === 3 || isInPath('/people'))}
              icon={
                isOpen ? (
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`mx-auto h-4 w-4 transition-transform ${
                      open === 3 || isInPath('/people') ? "rotate-180" : ""
                    }`}
                  />
                ) : null
              }
            >
              <ListItem 
                className={`p-0 mt-2 ${isInPath('/people') ? 'bg-[#3C50E0]' : ''}`} 
                selected={open === 3}
              >
                <AccordionHeader
                  onClick={() => isOpen && handleOpen(3)}
                  className={`border-b-0 ${isOpen ? 'pl-4 bg-gray-800 hover:border-gray-800' : 'bg-gray-800 pr-4 justify-center hover:border-gray-800'} focus:outline-none ${isInPath('/inventory') ? '' : ''}`}
                >
                  <ListItemPrefix>
                    <BsFillPeopleFill className="ml-3 h-6 w-6" />
                  </ListItemPrefix>
                  {isOpen && (
                    <Typography color="blue-gray" className="font-normal">
                      People
                    </Typography>
                  )}
                </AccordionHeader>
              </ListItem>
              {isOpen && (open === 3 || isInPath('/people')) && (
                <AccordionBody className="py-1 text-white">
                  <List className="p-0">
                    <Link to="/people/employee">
                      <ListItem className={`${isInPath('/people/employee') ? 'bg-[#3C50E0]' : 'hover:bg-[#3C50E0]'} text-white`}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Employees
                      </ListItem>
                    </Link>
                    <Link to="/people/customer">
                      <ListItem className={`${isInPath('/people/customer') ? 'bg-[#3C50E0]' : 'hover:bg-[#3C50E0]'} text-white`}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Customers
                      </ListItem>
                    </Link>
                  </List>
                </AccordionBody>
              )}
            </Accordion>

            {/* Estimation Section */}
            <Accordion
              open={isOpen && (open === 4 || isInPath('/estimation'))}
              icon={
                isOpen ? (
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`mx-auto h-4 w-4 transition-transform ${
                      open === 4 || isInPath('/estimation') ? "rotate-180" : ""
                    }`}
                  />
                ) : null
              }
            >
              <ListItem 
                className={`p-0 mt-2 ${isInPath('/estimation') ? 'bg-[#3C50E0]' : ''}`} 
                selected={open === 4}
              >
                <AccordionHeader
                  onClick={() => isOpen && handleOpen(4)}
                  className={`border-b-0 ${isOpen ? 'pl-4 bg-gray-800 hover:border-gray-800' : 'bg-gray-800 pr-4 justify-center hover:border-gray-800'} focus:outline-none ${isInPath('/inventory') ? '' : ''}`}
                >
                  <ListItemPrefix>
                    <RiMoneyDollarCircleFill className="ml-3 h-6 w-6" />
                  </ListItemPrefix>
                  {isOpen && (
                    <Typography color="blue-gray" className="font-normal">
                      Estimation
                    </Typography>
                  )}
                </AccordionHeader>
              </ListItem>
              {isOpen && (open === 4 || isInPath('/estimation')) && (
                <AccordionBody className="py-1 text-white">
                  <List className="p-0">
                    <Link to="/estimation/inquiry">
                      <ListItem className={`${isInPath('/estimation/inquiry') ? 'bg-[#3C50E0]' : 'hover:bg-[#3C50E0]'} text-white`}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Inquiries
                      </ListItem>
                    </Link>
                    <Link to="/estimation/costEstimations">
                      <ListItem className={`${isInPath('/estimation/costEst') ? 'bg-[#3C50E0]' : 'hover:bg-[#3C50E0]'} text-white`}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Cost Estimations
                      </ListItem>
                    </Link>
                  </List>
                </AccordionBody>
              )}
            </Accordion>

            {/* Project Section */}
            <Accordion
              open={isOpen && (open === 5 || isInPath('/project'))}
              icon={
                isOpen ? (
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`mx-auto h-4 w-4 transition-transform ${
                      open === 5 || isInPath('/project') ? "rotate-180" : ""
                    }`}
                  />
                ) : null
              }
            >
              <ListItem 
                className={`p-0 mt-2 ${isInPath('/project') ? 'bg-[#3C50E0]' : ''}`} 
                selected={open === 5}
              >
                <AccordionHeader
                  onClick={() => isOpen && handleOpen(5)}
                  className={`border-b-0 ${isOpen ? 'pl-4 bg-gray-800 hover:border-gray-800' : 'bg-gray-800 pr-4 justify-center hover:border-gray-800'} focus:outline-none ${isInPath('/inventory') ? '' : ''}`}
                >
                  <ListItemPrefix>
                    <PiProjectorScreenChartFill className="ml-3 h-6 w-6" />
                  </ListItemPrefix>
                  {isOpen && (
                    <Typography color="blue-gray" className="font-normal">
                      Project
                    </Typography>
                  )}
                </AccordionHeader>
              </ListItem>
              {isOpen && (open === 5 || isInPath('/project')) && (
                <AccordionBody className="py-1 text-white">
                  <List className="p-0">
                    <Link to="/project/job">
                      <ListItem className={`${isInPath('/project/job') ? 'bg-[#3C50E0]' : 'hover:bg-[#3C50E0]'} text-white`}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Jobs
                      </ListItem>
                    </Link>
                    <Link to="/project/approvalJob">
                      <ListItem className={`${isInPath('/project/approvalJob') ? 'bg-[#3C50E0]' : 'hover:bg-[#3C50E0]'} text-white`}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Job Approvals
                      </ListItem>
                    </Link>
                    <Link to="/project/boq">
                      <ListItem className={`${isActive('/project/boq') ? 'bg-[#3C50E0]' : 'hover:bg-[#3C50E0]'} text-white`}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Bill of Quantities
                      </ListItem>
                    </Link>
                    <Link to="/project/bill-of-materials">
                      <ListItem className={`${isActive('/project/bill-of-materials') ? 'bg-[#3C50E0]' : 'hover:bg-[#3C50E0]'} text-white`}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Bill of Materials
                      </ListItem>
                    </Link>
                  </List>
                </AccordionBody>
              )}
            </Accordion>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
              <span className="text-sm font-bold">U</span>
            </div>
            {isOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium">User Name</p>
                <p className="text-xs text-gray-400">user@example.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}