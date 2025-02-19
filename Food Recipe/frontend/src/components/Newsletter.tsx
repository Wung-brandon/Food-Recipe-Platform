import React, { useState } from 'react';
import TitleText from './TitleText';

const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic (e.g., API call)
    console.log(`Email submitted: ${email}`);
    setEmail(''); // Clear input after submission
  };

  return (
    <div className="bg-gray-100 py-20">
      <div className="max-w-lg mx-auto text-center">
        <TitleText title='Join Our Newsletter' />
        <p className="text-gray-700 mb-6 mx-5">Get the latest recipes and updates straight to your inbox!</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row mx-5 justify-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="p-3 rounded-l-md border-none focus:outline-none"
            required
          />
          <button type="submit" className="bg-amber-600 text-white p-2 rounded-r-md hover:bg-amber-700 transition duration-300">
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewsletterSignup;