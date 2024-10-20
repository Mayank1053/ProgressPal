import { useSearchParams, Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ResetPasswordForm from "../components/ResetPasswordForm.jsx";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const code = String(searchParams.get("code"));
  const exp = Number(searchParams.get("exp"));
  const now = Date.now();
  const linkIsValid = code && exp && exp > now;

  return (
    <div className="flex min-h-screen justify-center">
      <div className="container mx-auto max-w-md py-12 px-6 text-center">
        {linkIsValid ? (
          <ResetPasswordForm code={code} />
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <Alert variant="destructive">
              <AlertDescription>Invalid Link</AlertDescription>
            </Alert>
            <p className="text-muted-foreground">
              The link is either invalid or expired.
            </p>
            <Link
              to="/password/forgot"
              replace
              className="text-primary hover:underline"
            >
              Request a new password reset link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
