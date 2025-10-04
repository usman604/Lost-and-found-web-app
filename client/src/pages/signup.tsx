import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { signupUser } from "@/api/auth";
import { Search, Eye, EyeOff } from "lucide-react";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  university_id: z.string().min(5, "University ID is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  terms: z.boolean().refine(val => val, "You must agree to the terms"),
});

type SignupData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const form = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      university_id: "",
      password: "",
      terms: false,
    },
  });

  const onSubmit = async (data: SignupData) => {
    setIsLoading(true);
    setError("");
    
    try {
      await signupUser({
        name: data.name,
        email: data.email,
        university_id: data.university_id,
        password: data.password,
      });
      toast({
        title: "Account created successfully!",
        description: "You can now sign in to your account.",
      });
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
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
          <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(222, 47%, 11%)" }}>Create Account</h1>
          <p style={{ color: "hsl(215, 16%, 47%)" }}>Join Campus Lost & Found</p>
        </div>

        <Card className="shadow-sm" style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
          <CardContent className="pt-6 p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          {...field}
                          data-testid="input-name"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>University Email</FormLabel>
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
                      <p className="text-xs" style={{ color: "hsl(215, 16%, 47%)" }}>
                        Must use your university email domain
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="university_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>University ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="U2025-001" 
                          {...field}
                          data-testid="input-university-id"
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
                            placeholder="Create a strong password" 
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
                      <p className="text-xs" style={{ color: "hsl(215, 16%, 47%)" }}>
                        Minimum 8 characters
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-terms"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>
                          I agree to the Terms of Service and Privacy Policy
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-signup"
                  style={{ backgroundColor: "hsl(221, 83%, 53%)" }}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
              <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>
                Already have an account?{" "}
                <button
                  onClick={() => setLocation("/login")}
                  className="font-medium hover:underline"
                  style={{ color: "hsl(221, 83%, 53%)" }}
                  data-testid="link-login"
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
