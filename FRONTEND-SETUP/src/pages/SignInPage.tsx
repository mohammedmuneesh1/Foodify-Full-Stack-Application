import  { useState } from 'react'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { APP_GOOGLE_SIGNIN_API, APP_LOGIN_API,  } from '../api/authRoutes';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

interface formDataInterface{
  email:string;
  password:string;
}


const SignInPage = () => {


  

  

   const [formData,setFormData] = useState<formDataInterface>({
    email:'',
    password:'',
   });

   
    const navigate = useNavigate();
    // const [selectedPage,setSelectedPage] = useState("false");
    const [showPassword,setShowPassword] = useState<boolean>(false);
    const [role,setRole] = useState<'Delivery Partner'| "Hotel Owner" | "Customer">("Customer");
    const [buttonLoading,setButtonLoading] = useState<boolean>(false);
    const borderColor = '#ddd';
    // const textColor = '#333333';




// =========================================== THE FORM HANDLER FUNCTION ===========================================  
   const handleFormChange = (
     fieldName: keyof  formDataInterface,
    value:string)=>{
      return setFormData((prev)=>({...prev,[fieldName]:value}));
   }

// ===========================================  SIGNUP FUNCTION ===========================================

const handleSignInFn = async ()=>{
  if(!formData?.email || !formData?.email?.trim() || !formData?.email?.includes("@")) return toast.error("Please enter valid email address.");
  if(!formData?.password || !formData?.password?.trim() || formData?.password?.length < 6 ) return toast.error("Please enter valid password.");
  setButtonLoading(true);
  toast.loading("Signing in...");
  const result = await APP_LOGIN_API(role,formData);
  console.log('this is the result',result);
  toast.dismiss();
  setButtonLoading(false);
  if(result?.success){
    setFormData({
      email:'',
      password:'',
    });
    
    toast.success(result?.response);
  }
  else{
    toast.error(result?.response);
  }
}



//======================= GOOGLE SIGN IN ===============================
const googleLogin = useGoogleLogin({
  flow: "auth-code", // IMPORTANT
  onSuccess: async (response) => {
    // response.code ← THIS is what you send to backend
    const res =  await APP_GOOGLE_SIGNIN_API(role,{code:response.code});
    console.log('this is the response',res);


    if(res?.success){
        // if(res?.data?.data?.isAdmin){
        //     navigate("/admin");
        // }
        // else{
        // navigate("/user/dashboard/bookings");
        // }
        return toast.success("Welcome Back");
    }
    else{
        toast.error(res?.data?.response ?? "Technical Issue in login. Please try again later.");
    }
  },

  onError: () => {
    console.error("Google login failed");
  },
});
//======================= GOOGLE SIGN IN ===============================


  return (
    <div className='min-h-screen w-full flex items-center justify-center p-4'
    style={{backgroundColor:"red"}}>
        {/* BORDER CONTAINER START HERE */}
        <div 
        className={` bg-white rounded-xl shadow-xl w-full max-w-md p-4 md:p-8 border-[1px] border-[${borderColor}] `}>
            <h1 
            className='text-2xl md:text-3xl font-bold mb-2 text-primary'>
                Foodify
                </h1>

                <p
                className='text-gray-600 mb-8 '>
                 Welcome back! Sign in to explore your favorite meals.
                </p>


                {/*FORM START HERE  */}

                <div className='space-y-4 '>




                {/*EMAIL */}
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                     type='email'
                     className='inputStyle1' 
                     placeholder='Please Enter your email'
                     value={formData?.email}
                     onChange={(e)=>handleFormChange("email",e.target.value)}
                     />
                </div>




                {/*PASSWORD */}
    <div>
  <label htmlFor="email">Password</label>
  <div className="relative">
    <input
      type={showPassword ? 'text' : 'password'}
      className='inputStyle1'
      placeholder='Please Enter your password'
      value={formData?.password}
      onChange={(e)=>handleFormChange("password",e.target.value)}
    />
    <button
      type='button'
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2"
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>
</div>



{/* FORGET PASSWORD  */}


<div
 className='text-right mb-4 text-primary hover:text-primary-hover font-medium cursor-pointer'
 onClick={()=>navigate("/forgot-password")}
 >
    
    <span>
        Forgot Password
    </span>



</div>






                {/* ROLE */}
                    <div>
  <label htmlFor="email">Role</label>



<div 

 className="flex  items-center mb-2 gap-3 w-full max-w-full">

  {["Customer", "Delivery Partner","Hotel Owner"].map(
    //eslint-disable-next-line
    (option:any) => (
      <button 
      key={option}
      type="button"
    //   onClick={()=>setRole(role)}
      onClick={()=>setRole(option)}
      className={`fex-1 border rounded-md px-2 md:px-3
       py-2 text-center font-medium transition-colors 
       text-[12px] sm:text-sm whitespace-nowrap
       ${role === option ? `bg-primary text-white` : `bg-white text-primary`}
       `}>{option}
       </button>
  ))}
</div>

  
</div>




{/*SIGNUP BUTTON START */}


<div>
  <button 
  disabled={buttonLoading}
  onClick={handleSignInFn}
  className='w-full mt-4 flex items-center 
  justify-center gap-2  rounded-lg  px-4 py-2 transition duration-300
   font-semibold bg-primary hover:bg-primary-hover text-white '
  >

    {
      buttonLoading ?(
        <span>
          Signing in...
        </span>
      ):(
        <span>
          Sign In
        </span>
      )
    }
  </button>


  <button
  onClick={googleLogin}
  className='font-semibold w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-300 border-gray-200 hover:bg-gray-200 '>
    <FcGoogle size={20}/>
    <span>Signup With Google</span>
  </button>
  <p className='text-center mt-4 font-medium'>Don&apos;t have an account ? 
    &nbsp; 
<span
onClick={()=>navigate("/signup")}
className='text-primary-hover cursor-pointer'>
  Sign Up
</span>
  </p>
</div>





                     </div>

                {/*FORM END HERE  */}



        </div>
        {/*BORDER CONTAINER END HERE */}
    </div>
  )
}


export default SignInPage;



