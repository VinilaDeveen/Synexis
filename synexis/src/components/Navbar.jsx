import { useState } from 'react'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import NotificationPanel from './NotificationPanel'; // Import the new component
import logo from '../assets/images/123.jpg'

const navigation = [
  { name: 'Dashboard', href: '#', current: true },
  { name: 'Team', href: '#', current: false },
  { name: 'Projects', href: '#', current: false },
  { name: 'Calendar', href: '#', current: false },
]

// Sample notification data
const notificationItems = [
  { message: 'Iron Sheet category created!', time: '23min' },
  { message: 'Sheet category created!', time: '1d' },
  { message: 'New inventory item added', time: '2d' },
  { message: 'User permission updated', time: '3d' },
  { message: 'System maintenance completed', time: '1w' },
  { message: 'Iron Sheet category created!', time: '23min' },
  { message: 'Sheet category created!', time: '1d' },
  { message: 'New inventory item added', time: '2d' },
  { message: 'User permission updated', time: '3d' },
  { message: 'System maintenance completed', time: '1w' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen)
  }

  const closeNotifications = () => {
    setNotificationsOpen(false)
  }

  return (
    <>
      <Disclosure as="nav" className="bg-white shadow-xl h-[67px]">
        <div className="sm:px-6 lg:px-2">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* Mobile menu button*/}
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
              </DisclosureButton>
            </div>
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="hidden sm:ml-6 sm:block">
                
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 focus:outline-none">
              <button
                type="button"
                onClick={toggleNotifications}
                className="relative rounded-full bg-white p-1 text-gray-400 hover:border-white hover:text-black focus:outline-none"
              >
                <span className="absolute -inset-1.5"/>
                <span className="sr-only">View notifications</span>
                <BellIcon aria-hidden="true" className="size-6 mr-8" />
              </button>

              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <div>
                  <MenuButton className="relative gap-4 flex rounded-full bg-white text-sm hover:border-white focus:outline-none">
                    <div>
                      <div className='text-base font-semibold'>Steve Johns</div>
                      <div className='text-xs text-slate-500'>Administrator</div>
                    </div>
                    <span className="" />
                    <span className="sr-only">Open user menu</span>
                    <img
                      alt=""
                      src={logo}
                      className="size-12 rounded-full"
                    />
                    <div className="text-4xl text-gray-500 hover:text-black"><ArrowDropDownIcon/></div>
                  </MenuButton>
                </div>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                    >
                      Your Profile
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                    >
                      Settings
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                    >
                      Sign out
                    </a>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>

        <DisclosurePanel className="sm:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {navigation.map((item) => (
              <DisclosureButton
                key={item.name}
                as="a"
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={classNames(
                  item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'block rounded-md px-3 py-2 text-base font-medium',
                )}
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>
        </DisclosurePanel>
      </Disclosure>

      {/* Notification Panel */}
      <NotificationPanel 
        isVisible={notificationsOpen}
        notifications={notificationItems}
        onClose={closeNotifications}
      />
    </>
  )
}