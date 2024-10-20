import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPasswordResetEmail } from "../lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const {
    mutate: sendPasswordReset,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: sendPasswordResetEmail,
  });

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="container mx-auto max-w-md py-12 px-6 text-center">
        <h1 className="text-4xl font-bold mb-8">Reset your password</h1>
        <div className="rounded-lg bg-card shadow-lg p-8">
          {isError && (
            <div className="mb-3 text-destructive">
              {error.message || "An error occurred"}
            </div>
          )}
          <div className="space-y-4">
            {isSuccess ? (
              <Alert>
                <AlertDescription>
                  Email sent! Check your inbox for further instructions.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={!email || isPending}
                  onClick={() => sendPasswordReset(email)}
                >
                  Reset Password
                </Button>
              </>
            )}
            <p className="text-sm text-muted-foreground">
              Go back to{" "}
              <Link
                to="/login"
                className="text-primary hover:underline"
                replace
              >
                Login
              </Link>
              &nbsp;or&nbsp;
              <Link
                to="/register"
                className="text-primary hover:underline"
                replace
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
