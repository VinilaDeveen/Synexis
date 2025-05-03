import React from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

function SynexisPages() {
  return (
    <div className='flex w-screen h-screen text-black bg-gray-100 overflow-hidden'>
      <Sidebar/>
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
        {/* Header */}
        <div>
          <Navbar/>
        </div>
      </div>  
    </div>
  )
}

export default SynexisPages
