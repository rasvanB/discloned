import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

const AuthAlert = ({
  variant,
  message,
}: {
  variant: "default" | "destructive";
  message: string;
}) => {
  return (
    <Alert variant={variant}>
      {variant === "destructive" ? (
        <AlertTriangle size={20} />
      ) : (
        <CheckCircle />
      )}
      <AlertTitle>{variant === "destructive" ? "Error" : "Success"}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default AuthAlert;
