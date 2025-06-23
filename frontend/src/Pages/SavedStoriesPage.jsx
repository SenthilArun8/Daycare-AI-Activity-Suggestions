import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import { useUser } from '../contexts/UserContext';
import { FaCopy, FaShareAlt, FaTrash } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const SavedStoriesPage = () => {
  const { token } = useUser();
  const { studentId } = useParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/stories/${studentId}/saved-stories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStories(res.data.stories || []);
      } catch (err) {
        setStories([]);
      } finally {
        setLoading(false);
      }
    };
    if (studentId && token) fetchStories();
  }, [studentId, token]);

  const handleDelete = async (index) => {
    if (!window.confirm('Delete this story?')) return;
    try {
      await axiosInstance.delete(`/stories/${studentId}/saved-stories/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStories(stories => stories.filter((_, i) => i !== index));
    } catch (err) {
      alert('Failed to delete story.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Saved Stories</h2>
      {loading ? (
        <p>Loading...</p>
      ) : stories.length === 0 ? (
        <p className="text-gray-500">No stories saved yet.</p>
      ) : (
        <div className="space-y-6">
          {stories.map((story, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-5 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-purple-800">{story.title}</h3>
                <div className="flex gap-2">
                  <button
                    title="Copy"
                    onClick={() => {
                      navigator.clipboard.writeText(`${story.title}\n\n${story.content}`);
                      if (window.toast) window.toast('Story copied!');
                    }}
                    className="p-2 rounded hover:bg-purple-50 text-gray-600"
                  >
                    <FaCopy />
                  </button>
                  {navigator.share && (
                    <button
                      title="Share"
                      onClick={async () => {
                        try {
                          await navigator.share({
                            title: story.title,
                            text: `${story.title}\n\n${story.content}`
                          });
                        } catch {}
                      }}
                      className="p-2 rounded hover:bg-purple-50 text-gray-600"
                    >
                      <FaShareAlt />
                    </button>
                  )}
                  <button
                    title="Delete"
                    onClick={() => handleDelete(idx)}
                    className="p-2 rounded hover:bg-red-50 text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="prose max-w-none mb-2">
                <p className="whitespace-pre-line text-gray-800">{story.content}</p>
              </div>
              <div className="text-xs text-gray-500">Generated: {story.generatedAt ? new Date(story.generatedAt).toLocaleString() : ''}</div>
              {story.context && (
                <div className="text-xs text-gray-400 mt-1">Context: {story.context}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedStoriesPage;
