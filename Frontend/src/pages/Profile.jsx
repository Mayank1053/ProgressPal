import { Alert, AlertDescription } from "@/components/ui/alert";
import useAuth from "../hooks/useAuth";

const Profile = () => {
  const { user } = useAuth();
  const { email, verified, createdAt } = user;

  return (
    <div className="flex flex-col items-center mt-16">
      <h1 className="text-3xl font-bold mb-4">My Account</h1>
      {!verified && (
        <Alert variant="warning" className="w-fit mb-3">
          <AlertDescription>Please verify your email</AlertDescription>
        </Alert>
      )}
      <p className="text-foreground mb-2">
        Email: <span className="text-muted-foreground">{email}</span>
      </p>
      <p className="text-foreground">
        Created on{" "}
        <span className="text-muted-foreground">
          {new Date(createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </p>
    </div>
  );
};

export default Profile;
