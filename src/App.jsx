import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Icon } from '@iconify-icon/react/dist/iconify.js';
import emailjs from '@emailjs/browser';
import { ToastContainer, toast } from 'react-toastify';

const baseURL = "https://codetest-backend-wp9t.onrender.com"

function App() {
  const [sessions, setSessions] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState({ name: '', email: '', phone: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState('');

  const [type, setType] = useState("")
  const [trainer, setTrainer] = useState("")

  const [loading, setLoading] = useState(false)

  const form = useRef()

  

  const fetchSessions = async () => {
    setLoading(true)
    try {
      let url = baseURL + "/sessions";
      if(type !== "" && trainer === ""){
        url += `?type=${type}`
      }else if(type === "" && trainer !== ""){
        url += `?trainer=${trainer}`
      }else if(type !== "" && trainer !== ""){
        url += `?type=${type}&trainer=${trainer}`
      }
      const response = await axios.get(url);

      if(response.status === 200 && response.data){
        setSessions(response.data);

      }else{
        alert("Something went wrong!")
      }


    } catch (error) {
      console.log(error)
    }

    setLoading(false)
    
    // console.log(response)
    
  };

  useEffect(() => {
    axios.get(baseURL + '/sessions').then((response) => {
      console.log(response)
      if(response.status === 200 && response.data){

        setSessions(response.data);
      }else{
        alert("Something went wrong!")
      }
    });
  }, []);

  const addToCart = (session) => {
    
    const isSessionInCart = cart.some((item) => item.id === session.id);
  
    if (isSessionInCart) {
      alert('This session is already in your cart.'); 
      return; 
    }
  
    setCart([...cart, session]);
  };
  

  const removeFromCart = (sessionId) => {
    setCart(cart.filter((item) => item.id !== sessionId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.name || !user.email || !user.phone || !termsAccepted || cart.length === 0) {
      setMessage('Please fill out all fields and accept the terms.');
      return;
    }

    try {
      // const response = await axios.post('http://localhost:3000/bookings', {
      //   user_name: user.name, 
      //   user_email: user.email, 
      //   user_phone: user.phone, 
      //   sessionIds: cart.map((session) => session.id),
      //   totalCost: cart.reduce((sum, item) => Number(sum) + Number(item.price), 0),
      // });
      const bookingPromises = cart.map((session) =>
        axios.post(baseURL +'/bookings', {
          user_name: user.name,
          user_email: user.email,
          user_phone: user.phone,
          session_id: session.id,
        }),
      );

      await Promise.all(bookingPromises);

      emailjs
      .sendForm(
        'service_ma7wvgm',  // Replace with your EmailJS service ID
        'template_p8h72np', // Replace with your EmailJS template ID
        form.current,
        'UjcYUjRoEAf2zjHJg'      // Replace with your EmailJS user ID
      )
      .then(
        (response) => {
          console.log('SUCCESS!', response.status, response.text);
          toast.success("Confirmation email send successfully!", {
            position: "top-right",
          });
          
        },
        (error) => {
          console.log('FAILED...', error);
          
        }
      );
      
      // setMessage('Booking successful!');
      toast.success("Booking successful!", {
        position: "top-right",
      });
      setCart([]);
      setUser({ name: '', email: '', phone: '' });
      setTermsAccepted(false);
    } catch (error) {
      console.log(error)
      // setMessage('Booking failed. Please try again.');
      toast.error("Booking failed. Please try again.", {
        position: "top-right",
      });
    }
  };

  return (
    <>
    <ToastContainer />
    <div className="w-[90%] max-w-[800px] p-[20px] rounded-lg shadow-xl bg-white mx-auto my-[40px]">
      <h1 className="text-2xl font-bold mb-4 text-center">Matchable Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div >
          <h2 className="text-xl font-semibold mb-2">Available Sessions</h2>
          <div className='flex items-center gap-[10px] mb-2'>
            <input type="text" className="border p-2  w-full rounded-md" value={type} placeholder='Type...' onChange={(e) => setType(e.target.value)} />
            <input type='text' className="border p-2  w-full rounded-md" value={trainer} placeholder='Trainer...' onChange={(e) => setTrainer(e.target.value)} />
            <button type="button" onClick={() => fetchSessions()} className="bg-green-500 text-white min-w-[100px] py-2 rounded-md cursor-pointer hover:bg-green-600">
              Filter
            </button>
          </div>
          <div className='max-h-[400px] overflow-auto custom-scroll'>
            {
              loading ? <p>Loading...</p>
              :
              sessions && sessions.length > 0 ? sessions.map((session) => (
                <div key={session.id} className="border p-4 mb-2 rounded-md">
                  <div className='flex items-center justify-between'>
                    <h3 className='font-bold'>{session.type}</h3>
                    <p>{new Date(session.time_slot).toLocaleString()}</p>
                  </div>
                  
                  <p className='text-[18px] my-[10px]'>{session.trainer} ({session.duration}mins)</p>
                  <div className='flex items-center justify-between'>
                    <p className='font-bold'>${session.price}</p>
                    <button
                      onClick={() => addToCart(session)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-[5px]"
                    >
                      <Icon icon="mdi:cart-plus" width="24" height="24" />
                      Add to Cart
                    </button>
                  </div>
                  
                </div>
              ))
              :
              <p>No Sessions Found!</p>
            }
            
          </div>
          
        </div>
        <div>
          <div className='flex items-center justify-between'>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-[5px]">
            <Icon icon="garden:shopping-cart-stroke-12" width="20" height="20" />
              Cart
              </h2>
              <p className="font-bold">
              Total: ${cart.reduce((sum, item) => Number(sum) + Number(item.price), 0)}
            </p>
          </div>
          <div className='max-h-[400px] overflow-auto custom-scroll'>
          {cart.map((item) => (
            // <div key={item.id} className="border p-4 mb-2">
            //   <h3>{item.type}</h3>
            //   <p>{new Date(item.time_slot).toLocaleString()}</p>
            //   <p>${item.price}</p>
            //   <button
            //     onClick={() => removeFromCart(item.id)}
            //     className="bg-red-500 text-white px-4 py-2 mt-2"
            //   >
            //     Remove
            //   </button>
            // </div>
            <div key={item.id} className="border p-4 mb-2 rounded-md">
                <div className='flex items-center justify-between'>
                  <h3 className='font-bold'>{item.type}</h3>
                  <p>{new Date(item.time_slot).toLocaleString()}</p>
                </div>
                
                <p className='text-[18px] my-[10px]'>{item.trainer} ({item.duration}mins)</p>
                <div className='flex items-center justify-between'>
                  <p className='font-bold'>${item.price}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-[5px]"
                  >
                    <Icon icon="mdi:cart-minus" width="24" height="24" />
                    Remove
                  </button>
                </div>
                
              </div>
          ))}
          </div>
          
        </div>
      </div>
      <form ref={form} onSubmit={handleSubmit} className="mt-[60px]">
        <h2 className="text-xl font-semibold mb-2 text-center">Booking Form</h2>
        <input
          type="text"
          placeholder="Name"
          name='to_name'
          required
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          className="border p-2 mb-2 w-full rounded-md"
        />
        <input
          type="email"
          placeholder="Email"
          name='to_email'
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          className="border p-2 mb-2 w-full rounded-md"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={user.phone}
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
          className="border p-2 mb-2 w-full rounded-md"
        />
        <label className="block mb-2 flex items-center gap-[2px]" htmlFor='terms' >
          <input
            type="checkbox"
            name='terms'
            id='terms'
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          Accept terms and conditions
        </label>
        <input type='hidden' name='from_name' value="Matchable" />
        <input type='hidden' name='message' value="This is a confirmation email for your booking" />
        <div className='flex items-center gap-[10px] justify-center'>
          <button type="button" className="bg-none border text-black w-[100px] py-2 rounded-md cursor-pointer hover:bg-black hover:text-white">
            Clear
          </button>

          <button type="submit" className="bg-green-500 text-white w-[100px] py-2 rounded-md cursor-pointer hover:bg-green-600">
            Book Now
          </button>

        </div>
        
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
    </>
  );
}

export default App;