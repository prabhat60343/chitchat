import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '/context/AuthContext'; // Make sure this path is correct

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext); // Get updateProfile from context
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Use FormData for file upload
    const formData = new FormData();
    formData.append('fullName', name);
    formData.append('bio', bio);

    if (selectedImg) {
      formData.append('profilePic', selectedImg); // Attach selected image
    }

    await updateProfile(formData); // Make sure your updateProfile function can handle FormData
    navigate("/");
  };


  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg relative'>
        <img onClick={() => navigate("/")} src={assets.arrow_icon} alt="Back" className="absolute top-4 right-4 w-7 cursor-pointer" />
        
        <form className="flex flex-col gap-5 p-10 flex-1" onSubmit={handleSubmit}>
          <h3 className="text-lg">Profile details</h3>

          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id='avatar'
              accept='.png, .jpg, .jpeg'
              hidden
            />
            <img
              src={selectedImg ? URL.createObjectURL(selectedImg) : authUser.profilePic || assets.avatar_icon}
              alt=""
              className={`w-12 h-12 ${selectedImg ? 'rounded-full' : ''}`}
            />
            Upload Profile Image
          </label>

          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Full Name'
            className='border border-gray-500 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-500'
            required
          />

          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder='Bio'
            required
            className='border border-gray-500 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-500'
            rows={4}
          ></textarea>

          <button
            type='submit'
            className='bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer'>
            Update
          </button>
        </form>

        <div className='flex flex-col items-center justify-center p-10 flex-1 text-center'>
          <img
            className='w-40 h-40 rounded-full object-cover'
            src={selectedImg ? URL.createObjectURL(selectedImg) : authUser.profilePic || assets.avatar_icon}
            alt='Profile Preview'
          />
          <h2 className='text-2xl mt-4'>{name || "Your Name"}</h2>
          <p className='text-sm mt-2'>{bio}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
