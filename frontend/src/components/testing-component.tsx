"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

const TestingComponent = () => {
  const sesion = useSession();

  if (!sesion || !sesion.data) return null;

  const test = () => {
    console.log(sesion.data);
  };

  test();

  return (
    <div>
      <h1>Testing Component</h1>
      <Button>Click me</Button>
    </div>
  );
};

export default TestingComponent;
