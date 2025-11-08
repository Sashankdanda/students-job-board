import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Briefcase, Mail, Phone } from 'lucide-react';

const Auth = () => {
  const { user, signUp, signIn, signInWithOtp, verifyOtp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [phoneForOtp, setPhoneForOtp] = useState('');

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // OTP form state
  const [otpData, setOtpData] = useState({
    phone: '',
    otp: ''
  });

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      return;
    }

    setIsLoading(true);
    await signUp(signUpData.email, signUpData.password, signUpData.fullName, signUpData.phone);
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(signInData.email, signInData.password);
    setIsLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signInWithOtp(otpData.phone);
    if (!error) {
      setShowOtpVerification(true);
      setPhoneForOtp(otpData.phone);
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await verifyOtp(phoneForOtp, otpData.otp);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              StudentJobs
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Welcome</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account or create a new one</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">Authentication</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="phone">Phone OTP</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="pl-10"
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                {!showOtpVerification ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp-phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="otp-phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          className="pl-10"
                          value={otpData.phone}
                          onChange={(e) => setOtpData({ ...otpData, phone: e.target.value })}
                          required
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        We'll send you a verification code via SMS
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp-code">Verification Code</Label>
                      <Input
                        id="otp-code"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otpData.otp}
                        onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
                        maxLength={6}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Code sent to {phoneForOtp}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify Code'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowOtpVerification(false)}
                      >
                        Back to Phone Entry
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />
            
            <div className="text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;