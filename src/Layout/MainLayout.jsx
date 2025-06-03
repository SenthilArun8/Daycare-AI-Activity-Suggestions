import { Outlet } from "react-router-dom"  
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import Navbar from "../Components/Navbar"

const MainLayout = () => {

    console.log("MainLayout rendered");
  return (
    <>
        <Navbar />
        <Outlet />
        <ToastContainer />
    </>
  )
}

export default MainLayout