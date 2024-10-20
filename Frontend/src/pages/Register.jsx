import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { register } from "../lib/api";

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const {
    mutate: CreateAccountMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigate("/", { replace: true });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="container mx-auto max-w-md py-12 px-6 text-center">
        <h1 className="text-4xl font-bold mb-8">Create an account</h1>
        <div className="rounded-lg bg-card shadow-lg p-8">
          {isError && (
            <div className="text-destructive mb-2">
              {error?.message || "An error occurred. Please try again later."}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-left mt-1">
                Password must be at least 6 characters long
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    CreateAccountMutation({
                      fullName,
                      email,
                      password,
                      confirmPassword,
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
        <Button
          className="mt-6 w-full"
          disabled={
            !email ||
            password.length < 6 ||
            password !== confirmPassword ||
            isPending
          }
          onClick={() =>
            CreateAccountMutation({
              fullName,
              email,
              password,
              confirmPassword,
            })
          }
        >
          Register
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
