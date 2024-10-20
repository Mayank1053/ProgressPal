import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../lib/api";

const ResetPasswordForm = ({ code }) => {
  const [password, setPassword] = useState("");

  const {
    mutate: ResetPasswordMutation,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: resetPassword,
  });

  return (
    <>
      <h1 className="text-4xl mb-8">Change your password</h1>
      <div className="rounded-lg bg-secondary p-8 shadow-lg">
        {isError && (
          <div className="mb-3 text-destructive">
            {error.message || "An error occurred"}
          </div>
        )}
        {isSuccess ? (
          <div>
            <Alert variant="success" className="mb-3">
              <AlertDescription>
                Password updated successfully!
              </AlertDescription>
            </Alert>
            <Link to="/login" replace className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  ResetPasswordMutation({ password, verificationCode: code })
                }
                autoFocus
              />
            </div>
            <Button
              className="w-full"
              disabled={password.length < 6 || isPending}
              onClick={() =>
                ResetPasswordMutation({
                  password,
                  verificationCode: code,
                })
              }
            >
              Reset Password
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default ResetPasswordForm;
