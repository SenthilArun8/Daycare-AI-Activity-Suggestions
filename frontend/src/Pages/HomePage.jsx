import Hero from '../Components/Hero'
import Students from '../Components/Students';
import SamplePage from './SamplePage';

const HomePage = () => {
    return(
    <>
         <Hero
            title='Classweave AI'
            subtitle='Find personalized activities for toddlers, preschoolers, and students'
         />
         <SamplePage />
         <Students isHome={true} />
     </>
    )
}

export default HomePage