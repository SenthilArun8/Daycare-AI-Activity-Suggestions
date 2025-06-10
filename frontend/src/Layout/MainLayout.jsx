import { Outlet } from "react-router-dom"  
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import Banner from "../Components/Banner"

const MainLayout = () => {

    console.log("MainLayout rendered");
  return (
    <>
      <Banner />
      <Navbar />
      <Outlet /> 
      <Footer/>
      <ToastContainer />
    </>
  )
}

export default MainLayout