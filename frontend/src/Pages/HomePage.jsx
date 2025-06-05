import { RouterProvider } from 'react-router-dom';
import Hero from '../Components/Hero'
import Students from '../Components/Students';


const HomePage = () => {
    return(
    <>
         <Hero
            title='Classweave AI'
            subtitle='Find personalized activities for toddlers and preschoolers'
         />
         <Students />
     </>
    )
}

export default HomePage