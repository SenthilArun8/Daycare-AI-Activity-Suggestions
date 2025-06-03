import { RouterProvider } from 'react-router-dom';
import Hero from '../Components/Hero'
import StudentListings from '../Components/Students';


const HomePage = () => {
    return(
    <>
         <Hero
            title='Educator Automation'
            subtitle='Find personalized activities for toddlers and preschoolers'
         />
     </>
    )
}

export default HomePage