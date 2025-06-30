import React from 'react'

const Navbar = ({onAccountClick}) => {
  return (
      <nav className='bg-dark-green text-white px-4 py-3 flex justify-between items-center' >
          <div className='text-white text-lg font-semibold'>Logo</div>
          <div>
              <button onClick={onAccountClick } className='text-white px-3 py-1 rounded mr-2'>Tài khoản</button>
          </div>
      </nav>
  )
}

export default Navbar