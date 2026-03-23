import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://www.facebook.com/rameez.bhat1/" target="_blank" rel="noopener noreferrer">
          Mohamad Shafi Bhat
        </a>
        <span className="ms-1">&copy; 2024-2030</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Developed By</span>
        <a href="mailto:bhatrameez2009@gmail.com" target="_blank" rel="noopener noreferrer">
         bhatrameez2009@gmail.com
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
