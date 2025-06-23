import Hero from '../Components/Hero';
import SubHeading from '../Components/SubHeading';
import Students from '../Components/Students';
import SamplePage from './SamplePage';
import SampleStories from './SampleStories';

const HomePage = () => {
    return(
    <>
         <Hero
            title='Classweave AI'
            subtitle='Find personalized activities for toddlers, preschoolers, and students'
         />
         <SampleStories />
         <SamplePage />
         <SubHeading />
         <Students isHome={true} />
     </>
    )
}

export default HomePage