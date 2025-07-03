import React from 'react'
import UserMenu from '../user/UserMenu'

const Navbar = ({onAccountClick}) => {
  return (
      <nav className='bg-dark-green text-white px-4 py-3 flex justify-between items-center' >
          <div className='text-white text-lg font-semibold'>Logo</div>
          <UserMenu onClick={onAccountClick }/>
      </nav>
  )
}

export default Navbar