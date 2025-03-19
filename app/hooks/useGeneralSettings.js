import { useState, useEffect, useCallback } from "react";
import { useFetcher,useLoaderData } from "@remix-run/react";
import { useOutletContext } from '@remix-run/react';
import {settingsInstance} from "../services/api/SettingService";

export  function useGeneralSettings() {
  const { shop_domain, settingDetails } = useLoaderData();
  const { plan } = useOutletContext();
  const fetcher = useFetcher();
  const [files, setFiles] = useState([]);
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const [imageChanged, setImageChanged] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data, state } = fetcher;
  const uploadFile=settingDetails?.general_settings?.bannerImage
  const [dropzonebanner,setDropzonebanner]=useState("");
  const [bannerMessage, setBannerMessage] = useState(""); // Store banner message
  const [bannerStatus, setBannerStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isSyncDisabled, setIsSyncDisabled] = useState(plan === 'FREE');

 
    useEffect(() => {
        // Optional: Handle the case where settingDetails are fetched but not immediately available
        if (settingDetails) {
          if (plan === 'FREE') {
            setIsSyncDisabled(true);
          }
          else
          {
            setIsSyncDisabled(settingDetails.general_settings.syncStatus);
          }
          
          if (uploadFile) {
            setFiles([{
              name: settingDetails?.general_settings?.bannerImageName , // You can replace this with the actual file name
              url: uploadFile // This can be a URL or path to the image
            }]);
          }else {
            setFiles([]); // Ensure it's empty if no uploaded file exists
          }
        }
        
        setTimeout(() => setLoading(false), 2000); // Add artificial delay for demonstration
        
      }, [settingDetails, uploadFile]);
    const handleSync = useCallback(() => {
        setBannerMessage("Syncing orders...");
        setBannerStatus("info");
        const formData = new FormData();
        formData.append("tab", "general-settings");
        formData.append("shop",shop_domain)
        fetcher.submit(formData, {
          method: "POST",
        });
        
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval); // Clear interval when progress reaches 100%
              setBannerMessage(fetcher.data.message); // Update success message
              setBannerStatus("success");
              return 100; // Ensure progress doesn't exceed 100
            }
            return prev + 10; // Increment progress
          });
        }, 500); 
      setProgress(0);
      }, [fetcher,shop_domain]);  // Add dependencies to the useCallback hook
    const handleDrop = useCallback((_droppedFiles, acceptedFiles, rejectedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        
        const img = new Image();
        img.src = URL.createObjectURL(file);
    
        img.onload = () => {
          if (img.width > 500 || img.height > 500) {
            setDropzonebanner("Please ensure your image dimensions do not exceed 500px in width or height.");
          } else {
            setFiles([file]); // Store only the latest uploaded file// 
          }
        };
      }
      setRejectedFiles(rejectedFiles);
      setImageChanged(true);
    }, []);
    
    const handleRemoveImage = () => {
      if (imageChanged) {
        setFiles([]); 
        setHasError("");
      }
    };
    
    
    
    const imageUrlForPreview = files.length > 0 && files[0].url ? files[0].url : (files.length > 0 && window.URL.createObjectURL(files[0]));
   
    
    const handleSubmit = async (event) => {
      event.preventDefault(); 
      
      const formData = new FormData();
      formData.append("bannerImage", files[0]);  
      try {
        setLoading(true);
        fetcher.submit(formData, {
          method: "post",
          encType: "multipart/form-data"
        });
        // const AWS_Upload_func =await settingsInstance.uploadImage(shop_domain,formData);
        // setLoading(false);
        // return { success: AWS_Upload_func };
      } catch (error) {
        console.error("Upload failed:", error);
        setLoading(false);
      }
    };
  

  return { files,progress,bannerMessage,dropzonebanner,bannerStatus,isSyncDisabled,imageUrlForPreview, setDropzonebanner,setBannerMessage, loading,fetcher, handleSync ,handleSubmit,handleDrop,handleRemoveImage};
};


