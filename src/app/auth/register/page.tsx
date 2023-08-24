"use client";

import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function Login() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();

  const registerMutation = trpc.register.useMutation({
    onSuccess: () => {
      router.push("/auth/login");
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center mb-4 gap-2">
          <h1 className="text-2xl font-semibold">Sign up</h1>
          <p className="text-sm text-muted-foreground">
            Register with your email and password.
          </p>
        </div>
        <div className="space-y-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@address.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-full mt-2"
          disabled={registerMutation.isLoading}
        >
          Register
        </Button>
      </form>
      <div className="mt-2 text-center">
        <span className="text-sm text-muted-foreground">
          {"Already have an account?"}
          <Link
            href="/auth/register"
            className="underline underline-offset-2 text-primary hover:text-primary/70 font-medium ml-1"
          >
            Log in
          </Link>
        </span>
      </div>
    </Form>
  );
}
