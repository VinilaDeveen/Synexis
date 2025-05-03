import { useState } from 'react';
import logo from '../assets/icons/synexis.png'
import { Typography, List, ListItem, ListItemPrefix, Accordion, AccordionHeader, AccordionBody } from "@material-tailwind/react";
import { BiSolidDashboard } from "react-icons/bi";
import { MdOutlineInventory } from "react-icons/md";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Menu, X } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [open, setOpen] = useState(0);

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
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
              alt=""
              src={logo}
            />
          </div>
          
          {isOpen && (
            <span className="font-medium text-3xl  fontFamily: 'Anaheim'">YNEXIS</span>
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
            <Accordion
              open={isOpen && open === 1}
              icon={
                isOpen ? (
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`mx-auto h-4 w-4 transition-transform ${
                      open === 1 ? "rotate-180" : ""
                    }`}
                  />
                ) : null
              }
            >
              <ListItem className="p-0" selected={open === 1}>
                <AccordionHeader
                  onClick={() => isOpen && handleOpen(1)}
                  className={`border-b-0 ${isOpen ? 'pl-4 bg-gray-800 hover:border-gray-800' : 'bg-gray-800 pr-4 justify-center hover:border-gray-800'} focus:outline-none`}
                >
                  <ListItemPrefix>
                    <BiSolidDashboard className="ml-3 h-6 w-6" />
                  </ListItemPrefix>
                  {isOpen && (
                    <Typography color="blue-gray" className="font-normal">
                      Dashboard
                    </Typography>
                  )}
                </AccordionHeader>
              </ListItem>
              {isOpen && open === 1 && (
                <AccordionBody className="py-1 text-white">
                  <List className="p-0">
                    <ListItem className='hover:bg-[#3C50E0]'>
                      <ListItemPrefix>
                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                      </ListItemPrefix>
                      Orders
                    </ListItem>
                    <ListItem className='hover:bg-[#3C50E0]'>
                      <ListItemPrefix>
                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                      </ListItemPrefix>
                      Products
                    </ListItem>
                  </List>
                </AccordionBody>
              )}
            </Accordion>

            <Accordion
              open={isOpen && open === 2}
              icon={
                isOpen ? (
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`mx-auto h-4 w-4 transition-transform ${
                      open === 2 ? "rotate-180" : ""
                    }`}
                  />
                ) : null
              }
            >
              <ListItem className="p-0 mt-2" selected={open === 2}>
                <AccordionHeader
                  onClick={() => isOpen && handleOpen(2)}
                  className={`border-b-0 ${isOpen ? 'pl-4 bg-gray-800 hover:border-gray-800' : 'bg-gray-800 pr-4 justify-center hover:border-gray-800'} focus:outline-none`}
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
              {isOpen && open === 2 && (
                <AccordionBody className="py-1">
                  <List className="p-0 text-white">
                    <ListItem className='hover:bg-[#3C50E0]'>
                      <ListItemPrefix>
                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                      </ListItemPrefix>
                      Materials
                    </ListItem>
                    <ListItem className='hover:bg-[#3C50E0]'>
                      <ListItemPrefix>
                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                      </ListItemPrefix>
                      Categories
                    </ListItem>
                    <ListItem className='hover:bg-[#3C50E0]'>
                      <ListItemPrefix>
                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                      </ListItemPrefix>
                      Brands
                    </ListItem>
                    <ListItem className='hover:bg-[#3C50E0]'>
                      <ListItemPrefix>
                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                      </ListItemPrefix>
                      Units
                    </ListItem>
                    <ListItem className='hover:bg-[#3C50E0]'>
                      <ListItemPrefix>
                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                      </ListItemPrefix>
                      Materials Assemble
                    </ListItem>
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