import React, { useState } from 'react';
import axios from 'axios';

const SessionForm = () => {
  const [formData, setFormData] = useState({
    type: '',
    time_slot: '',
    duration: '',
    trainer: '',
    price: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log(formData)
      const response = await axios.post('https://codetest-backend-wp9t.onrender.com/sessions', formData);
      console.log('Session created:', response.data);
      alert('Session created successfully!');
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Type:</label>
        <input
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Time Slot:</label>
        <input
          type="datetime-local"
          name="time_slot"
          value={formData.time_slot}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Duration (minutes):</label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Trainer:</label>
        <input
          type="text"
          name="trainer"
          value={formData.trainer}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Price:</label>
        <input
          type="number"
          step="0.01"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Create Session</button>
    </form>
  );
};

export default SessionForm;