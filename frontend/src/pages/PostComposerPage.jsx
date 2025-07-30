import React, { useState } from 'react';

export default function PostComposerPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('facebook');
  const [media, setMedia] = useState(null);
  const [status, setStatus] = useState('pending');
  const [scheduledAt, setScheduledAt] = useState('');

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('platform', platform);
    formData.append('status', status);
    formData.append('scheduledAt', scheduledAt);
    if (media) formData.append('media', media);

    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (res.ok) {
        alert('Post created!');
      } else {
        alert('Error creating post.');
      }
    } catch (err) {
      console.error('Post error:', err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create New Post</h2>

      <input
        className="border w-full p-2 mb-3"
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <textarea
        className="border w-full p-2 mb-3"
        placeholder="Content"
        rows="4"
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <select
        className="border w-full p-2 mb-3"
        value={platform}
        onChange={e => setPlatform(e.target.value)}
      >
        <option value="facebook">Facebook</option>
        <option value="instagram">Instagram</option>
      </select>

      <input
        className="w-full mb-3"
        type="file"
        accept="image/*,video/*"
        onChange={e => setMedia(e.target.files[0])}
      />

      <input
        className="border w-full p-2 mb-3"
        type="datetime-local"
        value={scheduledAt}
        onChange={e => setScheduledAt(e.target.value)}
      />

      <select
        className="border w-full p-2 mb-3"
        value={status}
        onChange={e => setStatus(e.target.value)}
      >
        <option value="draft">Save as Draft</option>
        <option value="pending">Submit for Approval</option>
      </select>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Submit Post
      </button>
    </div>
  );
}
