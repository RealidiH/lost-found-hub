 import { useState, useRef, useCallback } from 'react';
 import { ImagePlus, X } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
 
 interface ImageUploadProps {
   value?: string;
   onChange: (value: string | undefined) => void;
 }
 
 const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
 
 export function ImageUpload({ value, onChange }: ImageUploadProps) {
   const [isDragging, setIsDragging] = useState(false);
   const inputRef = useRef<HTMLInputElement>(null);
   const { toast } = useToast();
 
   const handleFile = useCallback((file: File) => {
     if (!file.type.startsWith('image/')) {
       toast({
         title: 'Invalid file type',
         description: 'Please select an image file (PNG, JPG, etc.)',
         variant: 'destructive',
       });
       return;
     }
 
     if (file.size > MAX_FILE_SIZE) {
       toast({
         title: 'File too large',
         description: 'Please select an image under 5MB',
         variant: 'destructive',
       });
       return;
     }
 
     const reader = new FileReader();
     reader.onload = (e) => {
       onChange(e.target?.result as string);
     };
     reader.readAsDataURL(file);
   }, [onChange, toast]);
 
   const handleDrop = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     setIsDragging(false);
     const file = e.dataTransfer.files[0];
     if (file) handleFile(file);
   }, [handleFile]);
 
   const handleDragOver = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     setIsDragging(true);
   }, []);
 
   const handleDragLeave = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     setIsDragging(false);
   }, []);
 
   const handleClick = () => {
     inputRef.current?.click();
   };
 
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) handleFile(file);
   };
 
   const handleRemove = (e: React.MouseEvent) => {
     e.stopPropagation();
     onChange(undefined);
     if (inputRef.current) inputRef.current.value = '';
   };
 
   return (
     <div
       onClick={handleClick}
       onDrop={handleDrop}
       onDragOver={handleDragOver}
       onDragLeave={handleDragLeave}
       className={`
         relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
         ${isDragging ? 'border-primary bg-accent' : 'border-border hover:border-primary hover:bg-accent'}
         ${value ? 'border-solid p-2' : ''}
       `}
     >
       <input
         ref={inputRef}
         type="file"
         accept="image/*"
         onChange={handleInputChange}
         className="hidden"
       />
 
       {value ? (
         <div className="relative inline-block">
           <img
             src={value}
             alt="Preview"
             className="max-w-full max-h-48 rounded-md object-contain"
           />
           <button
             type="button"
             onClick={handleRemove}
             className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
           >
             <X className="h-4 w-4" />
           </button>
         </div>
       ) : (
         <div className="text-center">
           <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground" />
           <p className="mt-2 text-sm text-muted-foreground">
             <span className="font-semibold text-primary">Click to upload</span> or drag and drop
           </p>
           <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
         </div>
       )}
     </div>
   );
 }