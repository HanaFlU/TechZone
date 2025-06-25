import React from 'react'

const Navbar = ({onAccountClick}) => {
  return (
      <nav className='bg-green-800 text-white px-4 py-3 flex justify-between items-center m-4' >
          <div className='text-white text-lg font-semibold'>Logo</div>
          <div>
              <button onClick={onAccountClick } className='text-white px-3 py-1 rounded mr-2'>Tài khoản</button>
          </div>
      </nav>
  )
}

export default Navbar