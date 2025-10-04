import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CATEGORIES, LOCATIONS } from "@/lib/constants";
import { CloudUpload, Check } from "lucide-react";

const itemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Please select a location"),
  date: z.string().min(1, "Please select a date"),
  image: z.any().optional(),
  confirmation: z.boolean().refine(val => val, "You must confirm the information is accurate"),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemFormProps {
  type: "lost" | "found";
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

export default function ItemForm({ type, onSubmit, isLoading }: ItemFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      location: "",
      date: "",
      confirmation: false,
    },
  });

  const handleSubmit = (data: ItemFormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('category', data.category);
    formData.append('description', data.description);
    formData.append('location', data.location);
    formData.append(`date_${type}`, data.date);
    
    if (selectedFile) {
      formData.append('image', selectedFile);
    }
    
    onSubmit(formData);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
                Item Title *
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., iPhone 13 Pro, Black Backpack" 
                  {...field}
                  data-testid="input-title"
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
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
                Category *
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger 
                    data-testid="select-category"
                    style={{ 
                      backgroundColor: "hsl(210, 20%, 98%)",
                      borderColor: "hsl(214, 32%, 91%)"
                    }}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
                Description *
              </FormLabel>
              <FormControl>
                <Textarea 
                  rows={4}
                  placeholder="Provide detailed description including color, brand, distinguishing features..."
                  {...field}
                  data-testid="textarea-description"
                  style={{ 
                    backgroundColor: "hsl(210, 20%, 98%)",
                    borderColor: "hsl(214, 32%, 91%)"
                  }}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs mt-1" style={{ color: "hsl(215, 16%, 47%)" }}>
                Be as specific as possible to help with matching
              </p>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
                  Location {type === "lost" ? "Lost" : "Found"} *
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger 
                      data-testid="select-location"
                      style={{ 
                        backgroundColor: "hsl(210, 20%, 98%)",
                        borderColor: "hsl(214, 32%, 91%)"
                      }}
                    >
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
                  Date {type === "lost" ? "Lost" : "Found"} *
                </FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                    max={new Date().toISOString().split('T')[0]}
                    data-testid="input-date"
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
        </div>

        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem>
              <FormLabel className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
                Upload Image (Optional)
              </FormLabel>
              <FormControl>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                     style={{ borderColor: "hsl(214, 32%, 91%)" }}
                     onClick={() => document.getElementById('image-upload')?.click()}>
                  <CloudUpload className="mx-auto h-12 w-12 mb-3" style={{ color: "hsl(215, 16%, 47%)" }} />
                  <p className="text-sm mb-1" style={{ color: "hsl(222, 47%, 11%)" }}>
                    {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs" style={{ color: "hsl(215, 16%, 47%)" }}>
                    PNG, JPG up to 5MB
                  </p>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="input-image"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-6" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
          <FormField
            control={form.control}
            name="confirmation"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-6">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-confirmation"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>
                    I confirm that the information provided is accurate and I am the rightful owner of this item
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="flex space-x-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
              data-testid="button-submit"
              style={{ backgroundColor: "hsl(221, 83%, 53%)" }}
            >
              <Check className="mr-2 h-4 w-4" />
              {isLoading ? "Submitting..." : "Submit Report"}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              disabled={isLoading}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
