import { useState } from 'react';
import { FaBirthdayCake  } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Student = ({ person }) => { // “I expect a prop called person to be passed to this component.”

    const [showFullDescription, setShowFullDescription] = useState(false);

    const capitalizeWords = (str) => {
        if (!str) return '';
        return str
            .split(' ')
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(' ');
    };

    const capitalizeSentence = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };  

    if (!person) {
    return null; // Or a loading message
  }

  let description = person.toddler_description;

  if (!showFullDescription && description.length > 90) {
    description = description.substring(0, 90) + '...';
  }

  return (
    <div className='bg-white rounded-xl shadow-md relative'>
      <div className='p-4'>
        <div className='mb-6'>
          <div className='text-gray-600 my-2'>{capitalizeWords(person.gender)}</div>
          <h3 className='text-xl font-bold'>{capitalizeWords(person.name)}</h3>
        </div>

        <div className='mb-5'>{description}</div>

        <button
          onClick={() => setShowFullDescription((prevState) => !prevState)}
          className='text-indigo-500 mb-5 hover:text-indigo-600'
        >
          {showFullDescription ? 'Less' : 'More'}
        </button>

        <h3 className='text-indigo-500 mb-2'>Developmental Stage: {capitalizeSentence(person.developmental_stage)}</h3>

        <div className='border border-gray-100 mb-5'></div>

        <div className='flex flex-col lg:flex-row justify-between mb-4'>
          <div className='text-orange-700 mb-3'>
            <FaBirthdayCake  className='inline text-lg mb-1 mr-1' />
            {person.age_months} months
          </div>
          <Link
            to={`/students/${person._id}`} // Ensure the name matches the json file
            className='h-[36px] bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-center text-sm'
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Student