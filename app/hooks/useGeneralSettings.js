import { useState, useEffect, useCallback } from "react";
import { useFetcher,useLoaderData } from "@remix-run/react";
import { useOutletContext } from '@remix-run/react';

export  function useGeneralSettings() {
  const { shop_domain, settingDetails,createdAt,product_count,order_sync_count} = useLoaderData();
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
  const [currentAction, setCurrentAction] = useState(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const hasConfiguredProducts = Number(product_count);
  
 
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

    useEffect(() => {
      if (fetcher.state === "idle" && fetcher.data ) {
        if (currentAction === 'syncOrders') {
          if (fetcher.data.error) {
            setBannerMessage(fetcher.data.error || "Failed to fetch orders");
            setBannerStatus("error");
          } else {
            setBannerMessage(fetcher.data.message || "Orders synced successfully!");
            setBannerStatus("success");
          }
          setProgress(100);
        }
        setCurrentAction(null);
      }
    }, [fetcher.data, fetcher.state,fetcher.key]);
    
    
    const handleSync = useCallback(() => {
      setBannerMessage("Syncing orders...");
      setBannerStatus("info");
      setCurrentAction('syncOrders');
    
      const formData = new FormData();
      formData.append("tab", "general-settings");
      formData.append("shop", shop_domain);
      formData.append("createdAt",createdAt);
      formData.append("order_sync_count",order_sync_count);
      fetcher.submit(formData, { method: "POST" });
      setProgress(0);
    
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval); // Stop just before 100
            return prev;
          }
          return prev + 10;
        });
      }, 500);
    }, [fetcher, shop_domain]);
      // Add dependencies to the useCallback hook
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
            setDropzonebanner("");
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
      setCurrentAction('saveImage');
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
  

  return { files,progress,bannerMessage,dropzonebanner,bannerStatus,isSyncDisabled,imageUrlForPreview, setDropzonebanner,setBannerMessage, loading,fetcher, handleSync ,handleSubmit,handleDrop,handleRemoveImage,showSyncModal,setShowSyncModal,hasConfiguredProducts,order_sync_count};
};


