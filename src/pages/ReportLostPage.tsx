import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileQuestion, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { insertItem } from '@/lib/database';
import { ItemCategory, CATEGORY_LABELS, CATEGORY_EXAMPLES } from '@/types/item';

const formSchema = z.object({
  category: z.enum(['electronics', 'clothing-bags', 'school-supplies', 'personal-items'] as const, {
    required_error: 'Please select a category',
  }),
  description: z.string()
    .trim()
    .min(10, 'Please provide at least 10 characters describing the item')
    .max(500, 'Description must be less than 500 characters'),
  location: z.string()
    .trim()
    .min(3, 'Please provide the location')
    .max(200, 'Location must be less than 200 characters'),
  date: z.string().min(1, 'Please select the date'),
  reporterName: z.string()
    .trim()
    .min(2, 'Please enter your name')
    .max(100, 'Name must be less than 100 characters'),
  reporterEmail: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  reporterPhone: z.string()
    .trim()
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

const ReportLostPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: undefined,
      description: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      reporterName: '',
      reporterEmail: '',
      reporterPhone: '',
    },
  });

  const onSubmit = (data: FormData) => {
    insertItem({
      type: 'lost',
      category: data.category as ItemCategory,
      description: data.description,
      location: data.location,
      date: data.date,
      reporterName: data.reporterName,
      reporterEmail: data.reporterEmail,
      reporterPhone: data.reporterPhone || undefined,
      status: 'pending',
    });
    
    setSubmitted(true);
    toast({
      title: 'Report submitted',
      description: 'We will contact you if your item is found.',
    });
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Report Submitted</h1>
        <p className="text-muted-foreground">
          Thank you for submitting your lost item report. Our security team will review it 
          and contact you if the item is found.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/')}>Back to Home</Button>
          <Button variant="outline" onClick={() => navigate('/search')}>
            Search Found Items
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <FileQuestion className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Report Lost Item</h1>
          <p className="text-muted-foreground">Fill in the details about your lost item</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>
            Provide as much detail as possible to help us identify your item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                      >
                        {(Object.entries(CATEGORY_LABELS) as [ItemCategory, string][]).map(([value, label]) => (
                          <div key={value} className="flex items-start space-x-3 border rounded-lg p-3 hover:bg-accent cursor-pointer">
                            <RadioGroupItem value={value} id={value} className="mt-1" />
                            <Label htmlFor={value} className="cursor-pointer flex-1">
                              <div className="font-medium">{label}</div>
                              <div className="text-xs text-muted-foreground">{CATEGORY_EXAMPLES[value]}</div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your item in detail (color, brand, distinguishing features...)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include details like color, brand, size, and any unique identifiers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Seen Location *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Library, 2nd floor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Lost *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} max={new Date().toISOString().split('T')[0]} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Your Contact Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reporterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reporterPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reporterEmail"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@school.edu" {...field} />
                      </FormControl>
                      <FormDescription>
                        We'll contact you at this email if your item is found
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Submit Report
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportLostPage;
