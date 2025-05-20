import React from 'react'
import assets from '../assets/assets';
import { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '/context/AuthContext.jsx'

const LoginPage = () => {

  const [currState, setCurrState] = useState('SignUp')
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

const {login}=useContext(AuthContext)

  const onSubmitHandler = (e) => {
    e.preventDefault();

    if (currState === 'SignUp' && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
    login(currState === "SignUp" ? 'signup' : 'login', { fullName, email, bio, password });
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-cover bg-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>

      {/* -----------Left Side -------------*/}

      <img src={assets.logo} alt="Logo" className='w-[min(30vw,250px)]' />

      {/* ------------Right Side -------------*/}

      <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>

        <h2 className='font-medium text-2xl flex justify-between items-center'>{currState}
          {isDataSubmitted &&
            <img onClick={() => setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer' />}
        </h2>

        {currState === 'SignUp' && !isDataSubmitted && (
          <input onChange={e => setFullName(e.target.value)} value={fullName}
            type="text" placeholder='Full Name' required className='bg-transparent border border-gray-500 rounded-md focus:outline-none p-2 text-white ' />
        )}

        {!isDataSubmitted && (
          <>
            <input onChange={e => setEmail(e.target.value)} value={email}
              type="email" placeholder='Email' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white ' />

            <input onChange={e => setPassword(e.target.value)} value={password}
              type="password" placeholder='Password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white ' />

          </>
        )}
        {currState === 'SignUp' && isDataSubmitted && (
          <input onChange={e => setBio(e.target.value)} value={bio}
            type="text" placeholder='Bio' required className='bg-transparent border border-gray-500 rounded-md focus:outline-none p-2 text-white ' />
        )}

        {currState === 'SignUp' && isDataSubmitted && (
          <textarea onChange={e => setBio(e.target.value)} value={bio} rows={4} className='p-2 focus:ring-2 focus:ring-indigo-500' placeholder='provide a short bio....' required ></textarea>
        )}
        <button type='submit' className='py-3 bg-gradient-to-r from-purple-400
to-violet-600 text-white rounded-md cursor-pointer'>
          {currState === "SignUp" ? "Create Account" : "Login Now"}
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type='checkbox' required />
          <p>Agree to the terms of use & privacy policy</p>
        </div>
        <div className='flex flex-col gap-2'>
          {currState === 'SignUp' ? (<p className='text-sm text-gray-500 text-center'>
            Already have an account? <span className='text-violet-500 cursor-pointer' onClick={() => setCurrState('Login')}>Login here</span>
          </p>) : (
            <p className='text-sm text-gray-500 text-center'>
              Don't have an account? <span className='font-medium text-violet-500 cursor-pointer' onClick={() => setCurrState('SignUp')}>Sign Up</span>
            </p>
          )}
        </div>

      </form>

    </div>
  )
}

export default LoginPage