import 'ol/ol.css'
import React from 'react'
import Logoicon from '../images/company-logo.jpg'
export default function NavBar() {
    return (
        <>
            <nav className='navbar  navbar-expand-lg' >
                <div className='container-fluid'>
                    <a className='navbar-brand' href="@">
                        <img className=" navbar logo " src={Logoicon} alt='logo' />
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <label className='navbar-title'>L<span>ucky</span> World </label>
                            <label className='navbar-subtitle'>Keep Smile! </label>
                        </button>
                    </a>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className=" navbar-nav me-auto mb-2 mb-lg-0" type='radio'>
                        <li className=" btn nav-item">
                            <a className="nav-link active" aria-current="page" href="@">Home</a>
                        </li>
                        <li className=" btn nav-item">

                            <a className=" btn nav-link" href="@">index</a>
                        </li>
                        <li className=" btn nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="@" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Tools
                            </a>
                            <ul className="dropdown-menu">
                            <li className="  dropdown dropdown-menu dropdown-divider"> Draw</li>
                                <li><a className="dropdown-item" href="@">Line</a></li>
                                <li><a className="dropdown-item" href="@"> Polygon</a></li>
                                <li className=" dropdown dropdown-menu dropdown-divider">  Data</li>
                                <li><a className="dropdown-item" href="@">GeoJSon</a></li>
                            </ul>
                        </li>
                        <li className='btn  nav-item'>
                            <a className='nav-link active' href='@'> About</a>
                            </li> 
                        <li className=' btn nav-item'>
                            <a className='nav-link' href='@'> ContactUs</a>

                        </li>
                    </ul>

                    
                </div>
                </div>
            </nav>


        </>
    )
}
