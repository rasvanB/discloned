"use client";

import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
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
import { DiscordIcon, GoogleIcon } from "@/components/icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthAlert from "@/components/auth-alert";
import { RotateCw } from "lucide-react";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Login() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      callbackUrl: "/",
    });
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center mb-4 gap-2">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your email and password.
          </p>
        </div>
        {error && <AuthAlert variant="destructive" message={error} />}
        <div className="space-y-1">
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
        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          {isLoading && <RotateCw size={20} className="animate-spin mr-2" />}
          {isLoading ? "Logging in..." : "Log in"}
        </Button>
      </form>
      <div className="mt-2 text-center">
        <span className="text-sm text-muted-foreground">
          {"Don't have an account?"}
          <Link
            href="/auth/register"
            className="underline underline-offset-2 text-primary hover:text-primary/70 font-medium ml-1"
          >
            Register
          </Link>
        </span>
      </div>
      <div className="relative mt-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full h-px bg-muted" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Button
          variant={"outline"}
          className="w-full"
          onClick={async () =>
            await signIn("google", {
              callbackUrl: "/",
            })
          }
          disabled={isLoading}
        >
          <GoogleIcon />
          <span className="ml-2">Google</span>
        </Button>
        <Button
          variant={"outline"}
          className="w-full"
          onClick={async () =>
            await signIn("discord", {
              callbackUrl: "/",
            })
          }
          disabled={isLoading}
        >
          <DiscordIcon />
          <span className="ml-2">Discord</span>
        </Button>
      </div>
    </Form>
  );
}
