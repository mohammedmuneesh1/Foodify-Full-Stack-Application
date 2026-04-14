import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { SEND_EMAIL_OTP_API, UPDATE_PASSWORD_FOR_FORGET_PASSWORD_API, VERIFY_FORGET_PASSWORD_OTP_API } from '../api/authRoutes';

type Step = 'email' | 'otp'| 'reset' | 'success';

const ForgotPasswordPage = () => {

  const [step, setStep] = useState<Step>('email');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [role,setRole] = useState<'Delivery Partner'| "Hotel Owner" | "Customer">("Customer");

  const navigate = useNavigate();
  const [formData,setFormData] = useState({
    password:'',
    confirmPassword:''
});



  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (step !== 'otp') return;
    setTimer(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);





  //==================================== ⚠️⚠️(STEP-1)⚠️⚠️ EMAIL INPUT AND SEND OTP API CALL ================================

  const handleSendOtp = async () => {
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      // const result = await sendOtpAPI(email);
      const result = await SEND_EMAIL_OTP_API({ email, role });
      if (result?.success) {
        setStep('otp');
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };
  //==================================== ⚠️⚠️(STEP-2)⚠️⚠️ EMAIL INPUT AND SEND OTP API CALL ================================













  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const result = await VERIFY_FORGET_PASSWORD_OTP_API({
        email,
        otp:otpCode,
        role
        });
      if (result?.success) {
        setOtp(['', '', '', '', '', '']);
        setFormData({password:'',confirmPassword:''});
        setStep('reset');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };




  const handleNewPasswordSettingFn = async ()=>{
    if(!formData?.password || !formData?.password?.trim() || formData?.password?.length < 6 ) return toast.error("Please enter valid password.");
    if(!formData?.confirmPassword || !formData?.password?.trim() ) return toast.error("Please enter valid password.");
    if(formData?.password !== formData?.confirmPassword) return toast.error("Password and confirm password should be same.");

    const result = await UPDATE_PASSWORD_FOR_FORGET_PASSWORD_API({
      password:formData?.password,
      confirmPassword:formData?.confirmPassword,
      email,
      role
    });

    if(result?.success){
      setStep('success');
      setTimeout(() => {
        navigate('/signin',{
          replace:true
        });
      }, 6000);
      }
    else{
       return toast.error(result?.response);
      }
  }


  // --------------   RESEND OTP FUNCTION --------------
  const handleResend = async () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    setLoading(true);
    try {
     const result = await SEND_EMAIL_OTP_API({ email, role });
     if (result?.success) {
        setStep('otp');
      } else {
        setError('Failed to send OTP. Please try again.');
      }
      setStep('otp'); // re-triggers timer useEffect
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };
  // --------------   RESEND OTP FUNCTION --------------


  const steps = ['Email', 'Verify OTP', 'Reset',"Success"];
  const stepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : step === 'reset' ? 2 : 3;

  const Spinner = () => (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );



  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100">

        {/*  BRAND START  */}
        <h1 className="text-2xl font-bold text-primary mb-1">Foodify</h1>
        <p className="text-gray-500 text-sm mb-6">
          {step === 'email' && 'Enter your email to receive a verification code.'}
          {step === 'otp' && `We sent a 6-digit code to ${email}`}
          {step === 'reset' && `Enter your new password.`}
          {step === 'success' && 'Your identity has been verified!'}
        </p>

        {/* Step Progress */}
        <div className="flex items-center mb-8">
          {steps.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                    ${i < stepIndex
                      ? 'bg-green-500 text-white'
                      : i === stepIndex
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-400'
                    }`}
                >
                  {i < stepIndex ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${i === stepIndex ? 'text-primary' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-4 transition-all duration-500 ${
                    i < stepIndex ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: Email ── */}
        {step === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
              />
            </div>

            
                {/* THE ROLE POSITION START */}
                    <div>
  <label htmlFor="email">Role</label>



<div 

 className="flex items-center mb-2 gap-3 w-full max-w-full">

  {["Customer", "Delivery Partner","Hotel Owner"].map(
    //eslint-disable-next-line
    (option:any) => (
      <button 
      key={option}
      type="button"
    //   onClick={()=>setRole(role)}
      onClick={()=>setRole(option)}
      className={`fex-1 border rounded-md px-3
       py-2 text-center font-medium transition-colors 
       text-[12px] sm:text-sm whitespace-nowrap
       ${role === option ? `bg-primary text-white` : `bg-white text-primary`}
       `}>{option}
       </button>
  ))}
</div>

  
</div>

{/* THE ROLE POSITION END */}


            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-lg transition duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <><Spinner /> Sending OTP...</> : 'Send OTP'}
            </button>
          </div>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 'otp' && (
          <div className="space-y-5">
            <div className="flex justify-between gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-lg transition duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <><Spinner /> Verifying...</> : 'Verify OTP'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Didn&apos;t receive it?{' '}
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-primary font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              ) : (
                <span className="text-gray-400">Resend in {timer}s</span>
              )}
            </p>

            <button
              onClick={() => { setStep('email'); setError(''); setOtp(['','','','','','']); }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ← Change email
            </button>
          </div>
        )}




        {/* ── STEP 3: Reset ── */}
        {step === 'reset' && (
  <div className="flex flex-col items-center text-center space-y-4 py-4 w-full">

    <h2 className="text-xl font-bold text-gray-800">
      Set New Password
    </h2>

    <p className="text-gray-500 text-sm">
      Create a strong password to secure your account.
    </p>

    {/* New Password */}
    <input
      type="password"
      placeholder="New Password"
      value={formData?.password}
      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} 
      // Update formData(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
    />

    {/* Confirm Password */}
    <input
      type="password"
      placeholder="Confirm Password"
      value={formData?.confirmPassword}
      onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))} 
      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
    />

    {/* Error */}
    {error && (
      <p className="text-red-500 text-sm">{error}</p>
    )}

    {/* Submit */}
    <button
      onClick={handleNewPasswordSettingFn}
      className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-lg transition duration-300 mt-2"
    >
      Update Password
    </button>

    {/* Back */}
    <button
      onClick={() => setStep('email')}
      className="text-sm text-gray-400 hover:text-gray-600 underline"
    >
      Start over
    </button>

  </div>
)}





        {/* ── STEP 4: Success ── */}
   {step === 'success' && (
  <div className="flex flex-col items-center text-center space-y-5 py-6">

    {/* Success Icon */}
    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
      <svg
        className="w-10 h-10 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>

    {/* Title */}
    <h2 className="text-xl font-bold text-gray-800">
      Password Reset Successful 🎉
    </h2>

    {/* Description */}
    <p className="text-gray-500 text-sm max-w-xs">
      Your password has been updated successfully. You can now log in with your new credentials.
    </p>

    {/* Login Button */}
    <button
      onClick={() => navigate("/signin")}
      className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-lg transition duration-300 mt-2"
    >
      Go to Login →
    </button>

    {/* Optional secondary action */}
    <button
      onClick={() => {
        setStep('email');
        setEmail('');
        setOtp(['','','','','','']);
        setError('');
      }}
      className="text-sm text-gray-400 hover:text-gray-600 underline"
    >
      Reset another account
    </button>

  </div>
)}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;