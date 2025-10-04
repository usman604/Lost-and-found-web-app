import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/layout/navbar";
import ItemForm from "@/components/forms/item-form";
import { createLostItem, createFoundItem } from "@/api/items";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle } from "lucide-react";

interface NewItemProps {
  type: "lost" | "found";
}

export default function NewItem({ type }: NewItemProps) {
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (formData: FormData) => {
      return type === "lost" ? createLostItem(formData) : createFoundItem(formData);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Your ${type} item has been reported successfully.`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api', type] });
      queryClient.invalidateQueries({ queryKey: ['/api', type, 'my'] });
      
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      setError(error.message || `Failed to report ${type} item`);
    },
  });

  const handleSubmit = (formData: FormData) => {
    setError("");
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(210, 20%, 98%)" }}>
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardContent className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(222, 47%, 11%)" }}>
                Report {type === "lost" ? "Lost" : "Found"} Item
              </h1>
              <p style={{ color: "hsl(215, 16%, 47%)" }}>
                Fill in the details about your {type} item to help others identify it
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <ItemForm 
              type={type}
              onSubmit={handleSubmit}
              isLoading={mutation.isPending}
            />
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6" style={{ backgroundColor: "hsl(210, 40%, 96%)" }}>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: "hsl(222, 47%, 11%)" }}>
              Tips for Better Results
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-1 h-4 w-4" style={{ color: "hsl(221, 83%, 53%)" }} />
                <span>Provide as many details as possible (brand, model, serial number if available)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-1 h-4 w-4" style={{ color: "hsl(221, 83%, 53%)" }} />
                <span>Upload a clear photo of the item or similar item</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-1 h-4 w-4" style={{ color: "hsl(221, 83%, 53%)" }} />
                <span>Include any unique features or distinguishing marks</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-1 h-4 w-4" style={{ color: "hsl(221, 83%, 53%)" }} />
                <span>Be specific about the location and time you {type} the item</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
