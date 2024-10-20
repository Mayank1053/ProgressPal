import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useParams, Link } from "react-router-dom";
import { verifyEmail } from "../lib/api";

function EmailVerification() {
  const { code } = useParams();
  const { isPending, isSuccess, isError } = useQuery({
    queryKey: ["emailVerification", code],
    queryFn: () => verifyEmail(code),
  });

  return (
    <div className="flex min-h-screen justify-center mt-12">
      <div className="container mx-auto max-w-md px-12 text-center">
        {isPending ? (
          <Spinner className="text-primary" />
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <Alert variant={isSuccess ? "default" : "destructive"}>
              <AlertDescription>
                {isSuccess ? "Email verified successfully" : "Invalid Link"}
              </AlertDescription>
            </Alert>
            {isError && (
              <p className="text-muted-foreground">
                Invalid or expired verification link.{" "}
                <Link
                  to="/password/forgot"
                  className="text-primary hover:underline"
                  replace
                >
                  Get a new link
                </Link>
              </p>
            )}
            <Link to="/" className="text-primary hover:underline" replace>
              Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailVerification;
