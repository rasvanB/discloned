import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

const AuthAlert = ({
  variant,
  message,
  className,
}: {
  variant: "default" | "destructive";
  className?: string;
  message: string;
}) => {
  return (
    <Alert variant={variant} className={className}>
      {variant === "destructive" ? (
        <AlertTriangle size={20} />
      ) : (
        <CheckCircle size={18} />
      )}
      <AlertTitle>{variant === "destructive" ? "Error" : "Success"}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default AuthAlert;
