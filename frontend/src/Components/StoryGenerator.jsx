import React, { useState } from 'react';
import axiosInstance from '../utils/axios';
import { useUser } from '../contexts/UserContext';
import { FaTimes, FaCopy, FaShareAlt, FaFilePdf } from 'react-icons/fa'; // For the close, copy, share, and PDF buttons
import { jsPDF } from 'jspdf'; // For PDF generation

const StoryGenerator = ({ student }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [context, setContext] = useState('');
  const [story, setStory] = useState("");
  const [lastInput, setLastInput] = useState("");
  const [saving, setSaving] = useState(false);
  const { token } = useUser();

  const handleOpenModal = () => {
    setShowModal(true);
    setContext('');
    setStory('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setContext('');
  };

  const handleGenerateStory = async (e) => {
    e.preventDefault();
    
    if (!token) {
      alert('Please log in to generate stories.');
      return;
    }

    if (!context.trim()) {
      alert('Please provide some context or scenario for the story.');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        '/ai/generate-story',
        { 
          studentName: student.name,
          age: student.age_months,
          context: context.trim(),
          interests: student.interests || [],
          personality: student.personality
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          } 
        }
      );

      setStory(response.data.story);
      setLastInput(context.trim());
      setShowModal(false);
    } catch (error) {
      console.error('Error generating story:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-bold mb-4">Create a Story</h3>
      <p className="text-gray-700 mb-4">
        Generate a personalized story for {student.name} based on a specific context or scenario.
      </p>
      
      <button
        onClick={handleOpenModal}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded transition disabled:opacity-50"
      >
        {loading ? 'Generating Story...' : 'Create a Story'}
      </button>

      {/* Context Input Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Create a Story for {student.name}</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleGenerateStory} className="flex-1 flex flex-col p-4 overflow-hidden">
              <div className="mb-4">
                <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
                  Context / Scenario
                </label>
                <textarea
                  id="context"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={`Describe what happened or the situation you'd like the story to be about. For example: "${student.name} was playing at the park when they found a mysterious key in the sandbox..."`}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Provide details about the situation, event, or theme you'd like the story to be based on.
                </p>
              </div>

              <div className="mt-auto pt-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !context.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Story Display */}
      {story && story.title && story.content && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-lg font-semibold">{story.title}</h4>
            <button 
              onClick={() => setStory("")}
              className="text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
          <div className="prose max-w-none">
            <p className="whitespace-pre-line text-gray-800">{story.content}</p>
          </div>
          <div className="mt-4 flex space-x-3 items-center">
            {/* Save Story Button */}
            <button
              className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded"
              onClick={async () => {
                if (!token) return alert('Login required to save stories.');
                setSaving(true);
                try {
                  await axiosInstance.post(`/stories/${student._id}/save-story`, {
                    title: story.title,
                    content: story.content,
                    generatedAt: story.generatedAt || new Date().toISOString(),
                    context: story.context || lastInput,
                    studentName: student.name
                  }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (window.toast) window.toast('Story saved!');
                } catch (e) {
                  alert('Failed to save story.');
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Story'}
            </button>
            {/* Regenerate Story Button */}
            <button
              className="text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded"
              onClick={async () => {
                if (!lastInput) return;
                setLoading(true);
                try {
                  const response = await axiosInstance.post(
                    '/ai/generate-story',
                    {
                      studentName: student.name,
                      age: student.age_months,
                      context: lastInput,
                      interests: student.interests || [],
                      personality: student.personality
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    }
                  );
                  setStory(response.data.story);
                } catch (error) {
                  alert('Failed to regenerate story.');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || !lastInput}
            >
              Regenerate Story
            </button>
            <button 
              onClick={() => {
                const doc = new jsPDF();
                const title = story.title || 'Story';
                const content = story.content || '';
                
                // Add title
                doc.setFontSize(18);
                doc.text(title, 15, 20);
                
                // Add content with word wrap
                const splitText = doc.splitTextToSize(content, 180);
                doc.setFontSize(12);
                doc.text(splitText, 15, 40);
                
                // Add footer
                const date = new Date().toLocaleDateString();
                doc.setFontSize(10);
                doc.text(`Generated for ${student.name} on ${date}`, 15, doc.internal.pageSize.height - 10);
                
                // Save the PDF
                doc.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${student.name}.pdf`);
              }}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded flex items-center gap-1"
              title="Download as PDF"
            >
              <FaFilePdf className="inline" /> Download PDF
            </button>
            {/* Copy to clipboard */}
            <button
              title="Copy Story"
              onClick={() => {
                navigator.clipboard.writeText(`${story.title}\n\n${story.content}`);
                if (window.toast) window.toast('Story copied to clipboard!');
              }}
              className="ml-2 text-gray-600 hover:text-purple-700 p-2 rounded border border-gray-200 bg-white flex items-center"
            >
              <FaCopy className="w-5 h-5" />
            </button>
            {/* Web Share API */}
            {navigator.share && (
              <button
                title="Share Story"
                onClick={async () => {
                  try {
                    await navigator.share({
                      title: story.title,
                      text: `${story.title}\n\n${story.content}`
                    });
                  } catch (e) {
                    if (window.toast) window.toast('Share cancelled or failed.');
                  }
                }}
                className="ml-2 text-gray-600 hover:text-purple-700 p-2 rounded border border-gray-200 bg-white flex items-center"
              >
                <FaShareAlt className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryGenerator;
