
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Database, ServerCog } from "lucide-react";
import { apiClient } from '@/services/apiClient';

// Define schema for MongoDB connection
const formSchema = z.object({
  uri: z.string()
    .min(10, { message: "MongoDB URI is required and must be valid" })
    .refine(
      (val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"), 
      { message: "Must be a valid MongoDB URI starting with mongodb:// or mongodb+srv://" }
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface MongoDBConnectorProps {
  onConnected?: (isConnected: boolean) => void;
}

const MongoDBConnector: React.FC<MongoDBConnectorProps> = ({ onConnected }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uri: "",
    },
  });

  // Check if MongoDB is already connected when component mounts
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        const connected = await apiClient.checkConnection();
        setIsConnected(connected);
        if (connected && onConnected) {
          onConnected(true);
          toast.success("MongoDB connection is already established");
        }
      } catch (error) {
        console.error("Error checking connection status:", error);
      }
    };
    
    checkConnectionStatus();
  }, [onConnected]);

  const onSubmit = async (data: FormValues) => {
    setIsConnecting(true);
    
    try {
      const result = await apiClient.connectToMongoDB(
        data.uri, 'jkteachings', 'teachings'
      );
      
      toast.success(`Successfully connected to MongoDB v${result.version}!`);
      if (onConnected) onConnected(true);
      setIsConnected(true);
      setIsOpen(false);
      // Connection status is now managed server-side through the API
    } catch (error) {
      toast.error(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant={isConnected ? "secondary" : "outline"}
          className="flex items-center gap-2"
        >
          <Database size={18} />
          {isConnected ? 'MongoDB Connected' : 'Connect to MongoDB'}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Connect to MongoDB</SheetTitle>
          <SheetDescription>
            Enter your MongoDB connection URI to connect to your database cluster.
            This connection will be used for document search operations.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="uri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MongoDB URI</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="mongodb://username:password@host:port/database" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isConnecting}
                  className="flex items-center gap-2"
                >
                  {isConnecting ? (
                    <>Connecting...</>
                  ) : (
                    <>
                      <ServerCog size={16} />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MongoDBConnector;
