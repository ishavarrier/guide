import React, { useState } from "react";
import { Camera, User, Phone, MapPinned, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AuthService } from "../lib/auth";

interface LoginPageProps {
  onComplete: () => void;
}

export function LoginPage({ onComplete }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login logic
        if (!username || !password) {
          setError("Please fill in all required fields");
          return;
        }

        const { data, error } = await AuthService.signIn({ username, password });
        
        if (error) {
          setError(error.message || "Login failed. Please check your credentials.");
          return;
        }

        if (data?.user) {
          console.log("Login successful:", data.user);
          onComplete();
        }
      } else {
        // Registration logic
        if (!username || !name || !lastName || !email || !password) {
          setError("Please fill in all required fields");
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters long");
          return;
        }

        if (username.length < 3) {
          setError("Username must be at least 3 characters long");
          return;
        }

        const { data, error } = await AuthService.signUp({
          username,
          first_name: name,
          last_name: lastName,
          email,
          phone,
          address,
          password,
        });

        if (error) {
          setError(error.message || "Registration failed. Please try again.");
          return;
        }

        if (data?.user) {
          console.log("Registration successful:", data.user);
          setError("Registration successful! Please check your email to verify your account.");
          setIsLogin(true); // Switch to login mode
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = isLogin 
    ? username.trim() !== "" && password.trim() !== ""
    : username.trim() !== "" && name.trim() !== "" && lastName.trim() !== "" && email.trim() !== "" && password.trim() !== "" && confirmPassword.trim() !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden border-2 border-secondary/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-6 pb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-3 rounded-xl">
              <MapPinned className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl">Welcome to Mid</h1>
              <p className="text-primary-foreground/80 text-sm">
                {isLogin ? "Sign in to your account" : "Create your profile to get started"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 -mt-6">
          {/* Toggle between Login and Register */}
          <div className="flex mb-6 bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture - Only show for registration */}
            {!isLogin && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                    <AvatarImage src={profileImage} alt={name} />
                    <AvatarFallback className="bg-muted">
                      <User className="w-10 h-10 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-upload"
                    className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Upload profile picture
                </p>
              </div>
            )}

            {/* Login fields */}
            {isLogin && (
              <>
                {/* Username Input - For Login */}
                <div className="space-y-2">
                  <Label
                    htmlFor="username-login"
                    className="flex items-center gap-2 text-secondary"
                  >
                    <User className="w-4 h-4" />
                    Username
                  </Label>
                  <Input
                    id="username-login"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-input-background border-secondary/30 focus:border-secondary"
                    autoComplete="username"
                    inputMode="text"
                    required
                  />
                </div>

                {/* Password Input - For Login */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-2 text-secondary"
                  >
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-input-background border-secondary/30 focus:border-secondary pr-10"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Registration-only fields */}
            {!isLogin && (
              <>
                {/* First Name Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-2 text-secondary"
                  >
                    <User className="w-4 h-4" />
                    First Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your first name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-input-background border-secondary/30 focus:border-secondary"
                    autoComplete="given-name"
                    inputMode="text"
                    required
                  />
                </div>

                {/* Last Name Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="flex items-center gap-2 text-secondary"
                  >
                    <User className="w-4 h-4" />
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-input-background border-secondary/30 focus:border-secondary"
                    autoComplete="family-name"
                    inputMode="text"
                    required
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-secondary"
                  >
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input-background border-secondary/30 focus:border-secondary"
                    autoComplete="email"
                    inputMode="email"
                    required
                  />
                </div>

                {/* Username Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="flex items-center gap-2 text-secondary"
                  >
                    <User className="w-4 h-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-input-background border-secondary/30 focus:border-secondary"
                    autoComplete="username"
                    inputMode="text"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password-register"
                    className="flex items-center gap-2 text-secondary"
                  >
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password-register"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-input-background border-secondary/30 focus:border-secondary pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2 text-secondary"
                  >
                    <Lock className="w-4 h-4" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-input-background border-secondary/30 focus:border-secondary"
                    autoComplete="new-password"
                    required
                  />
                </div>

                {/* Address Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="flex items-center gap-2 text-secondary"
                  >
                    <MapPinned className="w-4 h-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-input-background border-secondary/30 focus:border-secondary"
                    autoComplete="street-address"
                    inputMode="text"
                  />
                </div>

                {/* Phone Number Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-secondary"
                  >
                    <Phone className="w-4 h-4" />
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-input-background border-secondary/30 focus:border-secondary"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 mt-8"
              size="lg"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {isLogin ? "Signing In..." : "Creating Account..."}
                </div>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
