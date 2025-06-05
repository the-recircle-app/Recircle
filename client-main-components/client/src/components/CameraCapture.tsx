import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { imageValidation } from "../lib/imageValidation";
import { useToast } from "@/hooks/use-toast";
import SampleReceipts from "./SampleReceipts";

interface CameraCaptureProps {
  onCapture: (imageFile: File, dataUrl: string) => void;
  forceTesting?: boolean;
  onTestModeChange?: (enabled: boolean) => void;
}

const CameraCapture = ({ 
  onCapture, 
  forceTesting = false,
  onTestModeChange
}: CameraCaptureProps) => {
  // Initialize camera as disabled (requiring user interaction to enable)
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  // Check if we're in an iframe or embedded context
  const isEmbedded = window !== window.parent || !!window.frameElement;
  // Default to test mode if forced or in an embedded context
  const [isTesting, setIsTesting] = useState(forceTesting || isEmbedded);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const enableCamera = useCallback(async () => {
    try {
      // First check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in this browser");
      }
      
      // Check if we're in an iframe - many browsers restrict camera in iframes
      const isInIframe = window !== window.parent;
      if (isInIframe) {
        console.warn("Camera access might be restricted in iframes");
      }
      
      const constraints = {
        video: {
          facingMode: "environment", // Prefer back camera on mobile
          width: { ideal: 1280 },    // Reduced from 1920 for better compatibility
          height: { ideal: 720 }     // Reduced from 1080 for better compatibility
        }
      };
      
      console.log("Requesting camera access with constraints:", constraints);
      
      // Attempt to get the camera stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        console.log("Camera access granted, setting up video stream");
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, playing video");
          videoRef.current?.play().catch(e => console.error("Error playing video:", e));
          setCameraEnabled(true);
          setCameraError(null);
        };
      } else {
        console.error("Video reference is not available");
        throw new Error("Video element not found");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      
      // Provide more helpful error messages based on the error
      let errorMessage = "Could not access camera";
      
      if (error instanceof Error) {
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          errorMessage = "Camera permission was denied. Please allow camera access and try again.";
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
          errorMessage = "No camera found on this device. Please use the test mode instead.";
        } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
          errorMessage = "Camera is already in use by another application.";
        } else if (error.name === "OverconstrainedError") {
          errorMessage = "Camera does not support the requested resolution.";
        }
      }
      
      setCameraError(errorMessage);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Auto-switch to test mode after camera error
      if (onTestModeChange && !isTesting) {
        // Switch to test mode first, then show toast with delay
        setIsTesting(true);
        if (onTestModeChange) {
          onTestModeChange(true);
        }
        
        // Delay the toast notification to avoid multiple toasts at once
        setTimeout(() => {
          toast({
            title: "Test Mode Activated",
            description: "Camera access failed. You can use sample receipts instead.",
            duration: 4000,
            variant: "default"
          });
        }, 800);
      }
    }
  }, [toast, isTesting, onTestModeChange]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setCapturedImage(dataUrl);
    
    // Convert data URL to Blob/File
    canvas.toBlob((blob) => {
      if (!blob) {
        toast({
          title: "Capture Error",
          description: "Failed to process image",
          variant: "destructive"
        });
        return;
      }
      
      const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
      
      // Validate the image
      imageValidation
        .validateReceiptImage(file)
        .then(() => {
          onCapture(file, dataUrl);
        })
        .catch((error) => {
          toast({
            title: "Validation Error",
            description: error.message,
            variant: "destructive"
          });
          // Reset capture to try again
          setCapturedImage(null);
        });
    }, "image/jpeg", 0.95);
  }, [onCapture, toast]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);
  
  // Handle file input change for testing
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Create a FileReader to read the image
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedImage(dataUrl);
        
        // Validate the image
        imageValidation
          .validateReceiptImage(file)
          .then(() => {
            onCapture(file, dataUrl);
          })
          .catch((error) => {
            toast({
              title: "Validation Error",
              description: error.message,
              variant: "destructive"
            });
            // Reset capture to try again
            setCapturedImage(null);
          });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "File Error",
        description: "Failed to process the image file",
        variant: "destructive"
      });
    }
  }, [onCapture, toast]);
  
  // Toggle between camera and test mode (only for development)
  const toggleTestMode = useCallback(() => {
    // Check if we're in development mode (localhost or specific dev environments)
    const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('replit.dev') ||
                        window.location.hostname.includes('.repl.co');
    
    // Only allow test mode in development environments
    if (!isDevelopment && !forceTesting) {
      console.log("Test mode is only available in development environments");
      return;
    }
    
    const newValue = !isTesting;
    setIsTesting(newValue);
    setCapturedImage(null);
    
    // Notify parent component about test mode change
    if (onTestModeChange) {
      onTestModeChange(newValue);
    }
    
    console.log("Test mode toggled to:", newValue);
  }, [isTesting, onTestModeChange, forceTesting]);
  
  // Trigger file input click
  const openFileSelector = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Handle forceTesting changes and auto-enabling test mode
  useEffect(() => {
    if (forceTesting) {
      setIsTesting(true);
      setCameraEnabled(false); // Don't try to enable camera in force testing mode
      
      // Notify parent component
      if (onTestModeChange) {
        onTestModeChange(true);
      }
      
      console.log("Test mode enabled automatically via forceTesting prop");
    } else if (forceTesting !== isTesting) {
      setIsTesting(forceTesting);
      
      // Notify parent component
      if (onTestModeChange) {
        onTestModeChange(forceTesting);
      }
    }
    
    // We no longer auto-enable the camera on component mount
    // This will now only happen when the user clicks the "Enable Camera" button
  }, [forceTesting, isTesting, onTestModeChange]);
  
  // Debug test mode status for troubleshooting
  useEffect(() => {
    console.log("Current testing status:", isTesting);
  }, [isTesting]);
  
  // Call onTestModeChange when isTesting changes
  useEffect(() => {
    if (onTestModeChange) {
      onTestModeChange(isTesting);
    }
  }, [isTesting, onTestModeChange]);
  
  // Listen for custom event to open file selector
  useEffect(() => {
    const handleCustomOpenFileSelector = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };
    
    document.addEventListener('custom:openFileSelector', handleCustomOpenFileSelector);
    return () => {
      document.removeEventListener('custom:openFileSelector', handleCustomOpenFileSelector);
    };
  }, []);
  
  // Secret developer shortcut to toggle test mode
  useEffect(() => {
    // Only enable in development environments
    const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('replit.dev') ||
                        window.location.hostname.includes('.repl.co');
    
    if (!isDevelopment && !forceTesting) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret key combination: Alt+Shift+T for test mode
      if (e.altKey && e.shiftKey && e.key === 'T') {
        toggleTestMode();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleTestMode, forceTesting]);
  
  // Cleanup camera resources on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="camera-feed relative overflow-hidden">
      {/* Hidden file input for test mode */}
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileInputChange}
      />
      
      {/* We've removed the test mode toggle since we have gallery upload integrated directly into the UI */}
      
      {/* Camera permission screen (only show if not in test mode) */}
      {!cameraEnabled && !isTesting && !forceTesting ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
          <div className="text-white text-center">
            <i className="fa-solid fa-camera text-4xl mb-2"></i>
            <p className="font-medium">ReCircle needs camera access</p>
            <p className="text-sm text-gray-300 mt-1">To scan receipts and earn rewards</p>
            {cameraError && <p className="text-red-400 text-sm mt-1">{cameraError}</p>}
            <div className="flex space-x-3 mt-3">
              <Button 
                onClick={enableCamera}
                className="bg-white text-black rounded-lg px-4 py-2 font-medium"
              >
                Enable Camera
              </Button>
              <Button 
                onClick={openFileSelector}
                variant="outline"
                className="bg-primary/20 border-primary/50 text-white hover:bg-primary/30 hover:border-primary/70"
              >
                Upload from Gallery
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Regular camera view (when not in test mode) */}
          {!isTesting && (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'}`}
            />
          )}
          
          {/* Test mode view */}
          {isTesting && !capturedImage && (
            <div className="absolute inset-0 bg-gray-900 text-white">
              <div className="h-full flex flex-col">
                <SampleReceipts 
                  onSelectSample={(file) => {
                    // Create a data URL for the file to display
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const dataUrl = event.target?.result as string;
                      setCapturedImage(dataUrl);
                      onCapture(file, dataUrl);
                    };
                    reader.readAsDataURL(file);
                  }} 
                />
                
                <div className="p-4 border-t border-gray-700">
                  <p className="text-sm text-center mb-2">Or upload your own receipt image:</p>
                  <Button onClick={openFileSelector} className="w-full">
                    Upload Custom Image
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Captured image view (for both modes) */}
          {capturedImage && (
            <div className="absolute inset-0">
              <img 
                src={capturedImage} 
                alt="Captured receipt" 
                className="w-full h-full object-contain bg-gray-900"
              />
              <div className="absolute bottom-5 inset-x-0 flex justify-center space-x-4">
                <Button 
                  onClick={retakePhoto}
                  className="bg-white text-gray-800"
                >
                  {isTesting ? "Upload New Image" : "Retake Photo"}
                </Button>
              </div>
            </div>
          )}
          
          {/* Camera UI elements (only show when not in test mode and no image is captured) */}
          {!isTesting && !capturedImage && (
            <div className="absolute inset-0">
              <div className="h-full w-full relative">
                {/* Receipt outline guide */}
                <div className="absolute inset-0 m-auto w-4/5 h-2/3 border-2 border-white border-dashed rounded opacity-70"></div>
                {/* Camera Controls */}
                <div className="absolute bottom-5 inset-x-0 flex justify-center items-center gap-6">
                  {/* Gallery upload button */}
                  <button 
                    onClick={openFileSelector}
                    className="bg-black/40 backdrop-blur-sm text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg border border-white/20"
                    aria-label="Upload from gallery"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 16L8.586 11.414C8.96678 11.0329 9.47969 10.8191 10.01 10.8191C10.5403 10.8191 11.0532 11.0329 11.434 11.414L16 16M14 14L15.586 12.414C15.9668 12.0329 16.4797 11.8191 17.01 11.8191C17.5403 11.8191 18.0532 12.0329 18.434 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {/* Main capture button */}
                  <button 
                    onClick={captureImage}
                    className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
                  >
                    <div className="bg-primary rounded-full w-14 h-14"></div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CameraCapture;
