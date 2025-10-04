import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { loginUser } from "@/api/auth";
import { Search, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setError("");
    
    try {
      await loginUser(data.email, data.password);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "hsl(210, 20%, 98%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: "hsl(221, 83%, 53%)" }}>
            <Search className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(222, 47%, 11%)" }}>Campus Lost & Found</h1>
          <p style={{ color: "hsl(215, 16%, 47%)" }}>Sign in to manage your items</p>
        </div>

        <Card className="shadow-sm" style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
          <CardContent className="pt-6 p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@university.test" 
                          type="email" 
                          {...field}
                          data-testid="input-email"
                          style={{ 
                            backgroundColor: "hsl(210, 20%, 98%)",
                            borderColor: "hsl(214, 32%, 91%)"
                          }}
                        />
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
                      <FormLabel className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="Enter your password" 
                            type={showPassword ? "text" : "password"} 
                            {...field}
                            data-testid="input-password"
                            style={{ 
                              backgroundColor: "hsl(210, 20%, 98%)",
                              borderColor: "hsl(214, 32%, 91%)"
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-login"
                  style={{ backgroundColor: "hsl(221, 83%, 53%)" }}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm hover:underline"
                    style={{ color: "hsl(221, 83%, 53%)" }}
                    data-testid="link-forgot-password"
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            </Form>

            <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
              <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>
                Don't have an account?{" "}
                <button
                  onClick={() => setLocation("/signup")}
                  className="font-medium hover:underline"
                  style={{ color: "hsl(221, 83%, 53%)" }}
                  data-testid="link-signup"
                >
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs" style={{ color: "hsl(215, 16%, 47%)" }}>
          <p>Demo credentials: admin@university.test / Admin@123</p>
        </div>
      </div>
    </div>
  );
}
