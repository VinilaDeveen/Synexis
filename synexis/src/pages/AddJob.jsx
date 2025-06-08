import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader,
  ContentLoader 
} from '../components/loaders';
import { IoMdInformationCircle } from "react-icons/io";
import { FaFileAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { ToastContainer } from 'react-toastify';
import { useNotification } from '../hooks/useNotification';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTooltip from '../hooks/useTooltip';
import { jobService } from '../services/jobService';

const AddJobPage = () => {
  const { notifySuccess, notifyError, notifyWarning, notifyDefault } = useNotification();
  const { id } = useParams(); // Get the job ID from URL if editing
  const { estimationId } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jobId: null,
    estimationId: null,
    deliveryPoint: '',
    deliveryTime: '',
    consultant: '',
    contractor: '',
    subContractor: '',
    paymentType: '',
    gp: 0,
    invoiceType: [],
    customInvoiceType: '',
    attachments: [], 
    
    // Specification IDs (required for updates)
    specificationId: null,
    enclosureId: null,
    cableBusbarId: null,
    materialFinishId: null,
    floorDimensionId: null,
    wallDimensionId: null,
    
    // Technical Specs - Enclosure Type
    floorMounting: false,
    wallMounting: false,
    surfaceTypeOutdoor: false,
    surfaceTypeIndoor: false,
    flushTypeOutdoor: false,
    flushTypeIndoor: false,
    freestandingTypeOutdoor: false,
    freestandingTypeIndoor: false,
    lidTypeOutdoor: false,
    lidTypeIndoor: false,
    outdoorWallOutdoor: false,
    outdoorWallIndoor: false,
    feederPillarOutdoor: false,
    feederPillarIndoor: false,

    // Cable/Busbar specifications
    busbarIncoming: false,
    busbarOutgoing: false,
    topIncoming: false,
    topOutgoing: false,
    bottomIncoming: false,
    bottomOutgoing: false,
    leftIncoming: false,
    leftOutgoing: false,
    rightIncoming: false,
    rightOutgoing: false,
    rearTopIncoming: false,
    rearTopOutgoing: false,
    rearBottomIncoming: false,
    rearBottomOutgoing: false,
    
    // Technical Specs - Materials
    sheetMaterial: '',
    paintingThickness: '',
    primer: false,
    powderCoating: '',
    surfaceType: '',
    hdg: false,
    color: '',
    customColor: '',
    remarks: '',

    // Floor Mounting Dimensions
    framework: 0,
    baseFrame: 0,
    partition: 0,
    door: 0,
    mountingPlate: 0,
    escutcheon: 0,
    coveringPanels: 0,
    topCover: 0,
    topCoverMaterial: '',
    bottomPlate: 0,
    bottomPlateMaterial: '',
    
    // Wall Mounting Dimensions
    lid: 0,
    shelf: 0,
    wallDoor: 0,
    coverPlate: 0,
    wallMountingPlate: 0,
    topGlandPlate: 0,
    topGlandPlateMaterial: '',
    bottomGlandPlate: 0,
    bottomGlandPlateMaterial: '',
  });

  const convertAttachmentUrlToFile = async (attachmentUrl, attachmentId, filename = 'brand-image.jpg') => {
    try {
      const response = await fetch(`http://localhost:8080/api/synexis/job/attachment/${attachmentId}`);
      const blob = await response.blob();
      
      // Create a File object from the blob
      const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
      return file;
    } catch (error) {
      console.error('Error converting image URL to File:', error);
      return null;
    }
  };

  const [activeTab, setActiveTab] = useState('jobInformation');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fileChanged, setFileChanged] = useState(false);
  const isInitialLoad = useRef(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  // Custom tooltip hooks for info icons
  const deliveryPointTooltip = useTooltip(
    () => <div>Enter the location where materials will be delivered</div>,
    'right'
  );

  const consultantTooltip = useTooltip(
    () => <div>Select the consultant for this job</div>,
    'right'
  );

  const contractorTooltip = useTooltip(
    () => <div>Select the main contractor for this job</div>,
    'right'
  );

  const invoiceTypeTooltip = useTooltip(
    () => <div>Select the type of invoice for this job</div>,
    'right'
  );

  const paymentTypeTooltip = useTooltip(
    () => <div>Select the payment method for this job</div>,
    'right'
  );

  const attachmentTooltip = useTooltip(
    () => <div>Upload any relevant documents for this job</div>,
    'right'
  );

  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState([]);

  // If in edit mode, fetch the job details
  useEffect(() => {
    if (isEditMode) {
      const fetchJobDetails = async () => {
        setLoading(true);
        try {
          const response = await jobService.getById(id);
          const jobData = response.data;
          console.log('Fetched job data:', jobData);

          const attachments = await Promise.all(
          (jobData.attachmentDtoList || []).map(async (attachment) => {
            const file = await convertAttachmentUrlToFile(
              attachment.attachmentUrl,
              attachment.attachmentId,
              attachment.attachmentName || `attachment-${attachment.attachmentId}`
            );
            return {
              attachmentId: attachment.attachmentId,
              name: attachment.attachmentName || `attachment-${attachment.attachmentId}`,
              url: attachment.attachmentUrl,
              file: file || null,
              markedForDeletion: false,
            };
          })
        );
          
          setFormData({
            jobId: jobData.jobId,
            deliveryPoint: jobData.jobDeliveryPoint,
            deliveryTime: jobData.jobDeliveryTime,
            estimationId: jobData.estimationId,
            consultant: jobData.consultant,
            contractor: jobData.contractor,
            subContractor: jobData.subContractor,
            paymentType: jobData.paymentType || '',
            gp: jobData.grossProfit || 0,
            invoiceType: Array.isArray(jobData.invoiceType) ? jobData.invoiceType : [],
            customInvoiceType: jobData.customInvoiceType || '',
            attachments, // Initialize as empty for new files
            
            specificationId: jobData.specificationDto?.specificationId || null,
            enclosureId: jobData.specificationDto?.enclosureDto?.enclosureId || null,
            cableBusbarId: jobData.specificationDto?.cableBusbarDto?.cableBusbarId || null,
            materialFinishId: jobData.specificationDto?.materialFinishDto?.materialFinishId || null,
            floorDimensionId: jobData.specificationDto?.floorDimensionDto?.floorDimensionId || null,
            wallDimensionId: jobData.specificationDto?.wallDimensionDto?.wallDimensionId || null,

            // Technical specs - mapping from nested objects
            floorMounting: jobData.specificationDto?.floorMounting || false,
            wallMounting: jobData.specificationDto?.wallMounting || false,
            
            // Enclosure specs
            surfaceTypeOutdoor: jobData.specificationDto?.enclosureDto?.surfaceTypeOutdoor || false,
            surfaceTypeIndoor: jobData.specificationDto?.enclosureDto?.surfaceTypeIndoor || false,
            flushTypeOutdoor: jobData.specificationDto?.enclosureDto?.flushTypeOutdoor || false,
            flushTypeIndoor: jobData.specificationDto?.enclosureDto?.flushTypeIndoor || false,
            freestandingTypeOutdoor: jobData.specificationDto?.enclosureDto?.freestandingTypeOutdoor || false,
            freestandingTypeIndoor: jobData.specificationDto?.enclosureDto?.freestandingTypeIndoor || false,
            lidTypeOutdoor: jobData.specificationDto?.enclosureDto?.lidTypeOutdoor || false,
            lidTypeIndoor: jobData.specificationDto?.enclosureDto?.lidTypeIndoor || false,
            outdoorWallOutdoor: jobData.specificationDto?.enclosureDto?.outdoorWallOutdoor || false,
            outdoorWallIndoor: jobData.specificationDto?.enclosureDto?.outdoorWallIndoor || false,
            feederPillarOutdoor: jobData.specificationDto?.enclosureDto?.feederPillarOutdoor || false,
            feederPillarIndoor: jobData.specificationDto?.enclosureDto?.feederPillarIndoor || false,

            // Cable/Busbar specs
            busbarIncoming: jobData.specificationDto?.cableBusbarDto?.busbarIncoming || false,
            busbarOutgoing: jobData.specificationDto?.cableBusbarDto?.busbarOutgoing || false,
            topIncoming: jobData.specificationDto?.cableBusbarDto?.topIncoming || false,
            topOutgoing: jobData.specificationDto?.cableBusbarDto?.topOutgoing || false,
            bottomIncoming: jobData.specificationDto?.cableBusbarDto?.bottomIncoming || false,
            bottomOutgoing: jobData.specificationDto?.cableBusbarDto?.bottomOutgoing || false,
            leftIncoming: jobData.specificationDto?.cableBusbarDto?.leftIncoming || false,
            leftOutgoing: jobData.specificationDto?.cableBusbarDto?.leftOutgoing || false,
            rightIncoming: jobData.specificationDto?.cableBusbarDto?.rightIncoming || false,
            rightOutgoing: jobData.specificationDto?.cableBusbarDto?.rightOutgoing || false,
            rearTopIncoming: jobData.specificationDto?.cableBusbarDto?.rearTopIncoming || false,
            rearTopOutgoing: jobData.specificationDto?.cableBusbarDto?.rearTopOutgoing || false,
            rearBottomIncoming: jobData.specificationDto?.cableBusbarDto?.rearBottomIncoming || false,
            rearBottomOutgoing: jobData.specificationDto?.cableBusbarDto?.rearBottomOutgoing || false,
            
            // Material finish
            sheetMaterial: jobData.specificationDto?.materialFinishDto?.sheetMaterial || '',
            paintingThickness: jobData.specificationDto?.materialFinishDto?.paintingThickness || '',
            primer: jobData.specificationDto?.materialFinishDto?.primer || false,
            powderCoating: jobData.specificationDto?.materialFinishDto?.powderCoating || '',
            surfaceType: jobData.specificationDto?.materialFinishDto?.surfaceType || '',
            hdg: jobData.specificationDto?.materialFinishDto?.hdg || false,
            color: jobData.specificationDto?.materialFinishDto?.color || '',
            customColor: jobData.specificationDto?.materialFinishDto?.customColor || '',
            remarks: jobData.specificationDto?.remarks || '',

            // Floor Mounting Dimensions
            framework: jobData.specificationDto?.floorDimensionDto?.floorFramework || 0,
            baseFrame: jobData.specificationDto?.floorDimensionDto?.floorBaseFrame || 0,
            partition: jobData.specificationDto?.floorDimensionDto?.floorPartition || 0,
            door: jobData.specificationDto?.floorDimensionDto?.floorDoor || 0,
            mountingPlate: jobData.specificationDto?.floorDimensionDto?.floorMountingPlate || 0,
            escutcheon: jobData.specificationDto?.floorDimensionDto?.floorEscutcheon || 0,
            coveringPanels: jobData.specificationDto?.floorDimensionDto?.floorCoveringPanels || 0,
            topCover: jobData.specificationDto?.floorDimensionDto?.floorTopCover || 0,
            topCoverMaterial: jobData.specificationDto?.floorDimensionDto?.floorTopCoverMaterial || '',
            bottomPlate: jobData.specificationDto?.floorDimensionDto?.floorBottomPlate || 0,
            bottomPlateMaterial: jobData.specificationDto?.floorDimensionDto?.floorBottomPlateMaterial || '',
            
            // Wall Mounting Dimensions
            lid: jobData.specificationDto?.wallDimensionDto?.wallLid || 0,
            shelf: jobData.specificationDto?.wallDimensionDto?.wallShelf || 0,
            wallDoor: jobData.specificationDto?.wallDimensionDto?.wallDoor || 0,
            coverPlate: jobData.specificationDto?.wallDimensionDto?.wallCoverPlate || 0,
            wallMountingPlate: jobData.specificationDto?.wallDimensionDto?.wallMountingPlate || 0,
            topGlandPlate: jobData.specificationDto?.wallDimensionDto?.wallTopGlandPlate || 0,
            topGlandPlateMaterial: jobData.specificationDto?.wallDimensionDto?.wallTopGlandPlateMaterial || '',
            bottomGlandPlate: jobData.specificationDto?.wallDimensionDto?.wallBottomGlandPlate || 0,
            bottomGlandPlateMaterial: jobData.specificationDto?.wallDimensionDto?.wallBottomGlandPlateMaterial || ''
          });
          
        } catch (err) {
          if (isInitialLoad.current) {
            notifyError('Failed to load job details. Please try again.');
            isInitialLoad.current = false;
          }
        } finally {
          setLoading(false);
        }
      };

      fetchJobDetails();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    // Handle checkbox inputs differently
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [id]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        attachmentId: null,
        name: file.name,
        url: null,
        file,
      }));
      setFormData((prevState) => ({
        ...prevState,
        attachments: [...prevState.attachments, ...newFiles],
      }));
      setFileChanged(true);
    }
  };

  // Drag and Drop handlers for file upload
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);

  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
      attachmentId: null,
      name: file.name,
      url: null,
      file,
    }));
    setFormData((prevState) => ({
      ...prevState,
      attachments: [...prevState.attachments, ...newFiles],
    }));
    setFileChanged(true);
  }
};

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteFile = (index) => {
  setFormData((prev) => {
    const attachment = prev.attachments[index];
    const newAttachments = [...prev.attachments];

    // If the attachment has an attachmentId and it's the last one
    if (attachment.attachmentId && prev.attachments.length === 1) {
      // Mark it for deletion instead of removing it
      newAttachments[index] = { ...attachment, file: null, markedForDeletion: true };
      setDeletedAttachmentIds((prevIds) => [...prevIds, attachment.attachmentId]);
      return {
        ...prev,
        attachments: newAttachments,
      };
    }

    // Otherwise, remove the attachment (for new files or non-last existing attachments)
    return {
      ...prev,
      attachments: newAttachments.filter((_, i) => i !== index),
    };
  });
  setFileChanged(true);
};

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Create FormData object to handle file upload
    const formDataToSend = new FormData();
    formDataToSend.append('jobDeliveryPoint', formData.deliveryPoint);

    const convertTo24Hour = (time12h) => {
      if (!time12h) return null;
      const [time, modifier] = time12h.split(' ');
      let [hours, minutes] = time.split(':');
      
      if (hours === '12') {
        hours = '00';
      }
      if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
    };
    
    const convertedTime = convertTo24Hour(formData.deliveryTime);
    if (convertedTime  && isEditMode) {
      formDataToSend.append('jobDeliveryTime', convertedTime);
    } else {
      formDataToSend.append('jobDeliveryTime', formData.deliveryTime);
    }

    
    
    formDataToSend.append('consultant', formData.consultant);
    formDataToSend.append('contractor', formData.contractor);
    formDataToSend.append('subContractor', formData.subContractor);
    formDataToSend.append('paymentType', formData.paymentType);
    formDataToSend.append('grossProfit', formData.gp);
    
    // Handle invoice types - regular and custom
    formData.invoiceType.forEach(type => {
      formDataToSend.append("invoiceType", type);
    });
    
    // Add custom invoice type if it exists
    if (formData.customInvoiceType) {
      formDataToSend.append('customInvoiceType', formData.customInvoiceType);
    }

    formDataToSend.append('estimationId', formData.estimationId);
    
    // Add specification ID
    if (formData.specificationId) {
      formDataToSend.append('specificationDto.specificationId', formData.specificationId);
    }

    formData.attachments.forEach((attachment, index) => {
    if (attachment.markedForDeletion) {
      // For deleted attachments, only send attachmentId
      console.log(`Marking attachment for deletion: attachments[${index}].attachmentId=${attachment.attachmentId}`);
      formDataToSend.append(`attachments[${index}].attachmentId`, attachment.attachmentId);
      // Do NOT append attachments[${index}].attachment
    } else if (attachment.attachmentId && !attachment.file) {
      // Existing attachment that hasn't changed
      console.log(`Keeping existing attachment: attachments[${index}].attachmentId=${attachment.attachmentId}`);
      formDataToSend.append(`attachments[${index}].attachmentId`, attachment.attachmentId);
    } else if (attachment.file) {
      // New or modified file
      console.log(`Sending file: attachments[${index}].attachment=${attachment.name}`);
      formDataToSend.append(`attachments[${index}].attachment`, attachment.file);
      if (attachment.attachmentId) {
        formDataToSend.append(`attachments[${index}].attachmentId`, attachment.attachmentId);
      }
    }
  });

  // Log FormData contents for debugging
  console.log('FormData contents:');
  for (const [key, value] of formDataToSend.entries()) {
    console.log(`${key}: ${value instanceof File ? value.name : value}`);
  }

    // Add technical specifications data
    formDataToSend.append('specificationDto.floorMounting', formData.floorMounting);
    formDataToSend.append('specificationDto.wallMounting', formData.wallMounting);
    formDataToSend.append('specificationDto.remarks', formData.remarks);
    
    // Add enclosure data with ID
    if (formData.enclosureId) {
      formDataToSend.append('specificationDto.enclosureDto.enclosureId', formData.enclosureId);
    }
    formDataToSend.append('specificationDto.enclosureDto.surfaceTypeOutdoor', formData.surfaceTypeOutdoor);
    formDataToSend.append('specificationDto.enclosureDto.surfaceTypeIndoor', formData.surfaceTypeIndoor);
    formDataToSend.append('specificationDto.enclosureDto.flushTypeOutdoor', formData.flushTypeOutdoor);
    formDataToSend.append('specificationDto.enclosureDto.flushTypeIndoor', formData.flushTypeIndoor);
    formDataToSend.append('specificationDto.enclosureDto.freestandingTypeOutdoor', formData.freestandingTypeOutdoor);
    formDataToSend.append('specificationDto.enclosureDto.freestandingTypeIndoor', formData.freestandingTypeIndoor);
    formDataToSend.append('specificationDto.enclosureDto.lidTypeOutdoor', formData.lidTypeOutdoor);
    formDataToSend.append('specificationDto.enclosureDto.lidTypeIndoor', formData.lidTypeIndoor);
    formDataToSend.append('specificationDto.enclosureDto.outdoorWallOutdoor', formData.outdoorWallOutdoor);
    formDataToSend.append('specificationDto.enclosureDto.outdoorWallIndoor', formData.outdoorWallIndoor);
    formDataToSend.append('specificationDto.enclosureDto.feederPillarOutdoor', formData.feederPillarOutdoor);
    formDataToSend.append('specificationDto.enclosureDto.feederPillarIndoor', formData.feederPillarIndoor);

    // Add cable busbar data with ID
    if (formData.cableBusbarId) {
      formDataToSend.append('specificationDto.cableBusbarDto.cableBusbarId', formData.cableBusbarId);
    }
    formDataToSend.append('specificationDto.cableBusbarDto.BusbarIncoming', formData.busbarIncoming);
    formDataToSend.append('specificationDto.cableBusbarDto.BusbarOutgoing', formData.busbarOutgoing);
    formDataToSend.append('specificationDto.cableBusbarDto.TopIncoming', formData.topIncoming);
    formDataToSend.append('specificationDto.cableBusbarDto.TopOutgoing', formData.topOutgoing);
    formDataToSend.append('specificationDto.cableBusbarDto.BottomIncoming', formData.bottomIncoming);
    formDataToSend.append('specificationDto.cableBusbarDto.BottomOutgoing', formData.bottomOutgoing);
    formDataToSend.append('specificationDto.cableBusbarDto.LeftIncoming', formData.leftIncoming);
    formDataToSend.append('specificationDto.cableBusbarDto.LeftOutgoing', formData.leftOutgoing);
    formDataToSend.append('specificationDto.cableBusbarDto.RightIncoming', formData.rightIncoming);
    formDataToSend.append('specificationDto.cableBusbarDto.RightOutgoing', formData.rightOutgoing);
    formDataToSend.append('specificationDto.cableBusbarDto.RearTopIncoming', formData.rearTopIncoming);
    formDataToSend.append('specificationDto.cableBusbarDto.RearTopOutgoing', formData.rearTopOutgoing);
    formDataToSend.append('specificationDto.cableBusbarDto.RearBottomIncoming', formData.rearBottomIncoming);
    formDataToSend.append('specificationDto.cableBusbarDto.RearBottomOutgoing', formData.rearBottomOutgoing);
    
    // Add material finish data with ID
    if (formData.materialFinishId) {
      formDataToSend.append('specificationDto.materialFinishDto.materialFinishId', formData.materialFinishId);
    }
    formDataToSend.append('specificationDto.materialFinishDto.sheetMaterial', formData.sheetMaterial);
    formDataToSend.append('specificationDto.materialFinishDto.paintingThickness', formData.paintingThickness);
    formDataToSend.append('specificationDto.materialFinishDto.primer', formData.primer);
    formDataToSend.append('specificationDto.materialFinishDto.powderCoating', formData.powderCoating);
    formDataToSend.append('specificationDto.materialFinishDto.surfaceType', formData.surfaceType);
    formDataToSend.append('specificationDto.materialFinishDto.HDG', formData.hdg);
    formDataToSend.append('specificationDto.materialFinishDto.color', formData.color);
    
    // Add custom color if it exists
    if (formData.customColor) {
      formDataToSend.append('specificationDto.materialFinishDto.customColor', formData.customColor);
    }

    // Add Floor Mounting Dimensions if floorMounting is checked
    if (formData.floorMounting) {
      if (formData.floorDimensionId) {
        formDataToSend.append('specificationDto.floorDimensionDto.floorDimensionId', formData.floorDimensionId);
      }
      formDataToSend.append('specificationDto.floorDimensionDto.floorFramework', formData.framework);
      formDataToSend.append('specificationDto.floorDimensionDto.floorBaseFrame', formData.baseFrame);
      formDataToSend.append('specificationDto.floorDimensionDto.floorPartition', formData.partition);
      formDataToSend.append('specificationDto.floorDimensionDto.floorDoor', formData.door);
      formDataToSend.append('specificationDto.floorDimensionDto.floorMountingPlate', formData.mountingPlate);
      formDataToSend.append('specificationDto.floorDimensionDto.floorEscutcheon', formData.escutcheon);
      formDataToSend.append('specificationDto.floorDimensionDto.floorCoveringPanels', formData.coveringPanels);
      formDataToSend.append('specificationDto.floorDimensionDto.floorTopCover', formData.topCover);
      formDataToSend.append('specificationDto.floorDimensionDto.floorTopCoverMaterial', formData.topCoverMaterial);
      formDataToSend.append('specificationDto.floorDimensionDto.floorBottomPlate', formData.bottomPlate);
      formDataToSend.append('specificationDto.floorDimensionDto.floorBottomPlateMaterial', formData.bottomPlateMaterial);
    }
    
    // Add Wall Mounting Dimensions if wallMounting is checked
    if (formData.wallMounting) {
      if (formData.wallDimensionId) {
        formDataToSend.append('specificationDto.wallDimensionDto.wallDimensionId', formData.wallDimensionId);
      }
      formDataToSend.append('specificationDto.wallDimensionDto.wallLid', formData.lid);
      formDataToSend.append('specificationDto.wallDimensionDto.wallShelf', formData.shelf);
      formDataToSend.append('specificationDto.wallDimensionDto.wallDoor', formData.wallDoor);
      formDataToSend.append('specificationDto.wallDimensionDto.wallCoverPlate', formData.coverPlate);
      formDataToSend.append('specificationDto.wallDimensionDto.wallMountingPlate', formData.wallMountingPlate);
      formDataToSend.append('specificationDto.wallDimensionDto.wallTopGlandPlate', formData.topGlandPlate);
      formDataToSend.append('specificationDto.wallDimensionDto.wallTopGlandPlateMaterial', formData.topGlandPlateMaterial);
      formDataToSend.append('specificationDto.wallDimensionDto.wallBottomGlandPlate', formData.bottomGlandPlate);
      formDataToSend.append('specificationDto.wallDimensionDto.wallBottomGlandPlateMaterial', formData.bottomGlandPlateMaterial);
    }
  
    try {
      if (isEditMode) {
        await jobService.update(id, formDataToSend);
        notifySuccess('Job updated successfully');
      } else {
        await jobService.create(formDataToSend);
        notifySuccess('Job created successfully');
      }
      // Redirect to jobs list page after successful operation
      setDeletedAttachmentIds([]);
      navigate('/project/job');
    } catch (err) {
      console.error('Error saving job:', err);
      isEditMode
        ? notifyError('Failed to update job. Please try again.')
        : notifyError('Failed to create job. Please try again.') 
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/project/job');
  };

  if (loading && isEditMode) {
    return <FullPageLoader />;
  }

  const CustomCheckbox = ({ 
    id, 
    name, 
    checked, 
    onChange, 
    label, 
    disabled = false 
  }) => {
    return (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="absolute opacity-0 w-4 h-4 cursor-pointer"
        />
        <div className={`w-4 h-4 mr-2 border ${
          checked 
            ? 'bg-[#3C50E0] border-blue-500' 
            : 'bg-slate-200 border-slate-300'
        } flex items-center justify-center`}>
          {checked && (
            <svg 
              className="w-3 h-3 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="3" 
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          )}
        </div>
        {label && <label htmlFor={id} className="text-black cursor-pointer text-sm">
          {label}
        </label>}
      </div>
    );
  };

  function convertTo24HourFormat(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours}:${minutes}`;
  }

  return (
    <div className="flex w-screen h-screen text-black bg-gray-100" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: ' #3B50DF #D9D9D9'}}>
      {/* Sidebar */}
      <div className="">
        <div className=""><Sidebar/></div>
      </div>

      {/* Main Content */}
      <div className="flex w-screen flex-col">
        {/* Header */}
        <div>
          <Navbar/>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-hidden">

          {/* Toast notifications */}
          <ToastContainer className="mt-[70px]" />

          <h1 className="text-2xl font-semibold mb-4">
            {isEditMode ? 'Update Job' : 'New Job'}
          </h1>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Add/Edit Job Form */}
          <div className="bg-white rounded-lg shadow-lg">
            {/* Tabs */}
            <div className="flex">
              <button 
                className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'jobInformation' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                onClick={() => handleTabChange('jobInformation')}
              >
                Job Information
              </button>
              <button 
                className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'paymentDetails' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                onClick={() => handleTabChange('paymentDetails')}
              >
                Payment Details
              </button>
              <button 
                className={`px-6 py-3 font-medium text-sm bg-white hover:border-white ${activeTab === 'technicalSpecs' ? 'border-b-2 rounded-none border-b-[#3119C3]' : 'text-gray-500'} focus:outline-none`}
                onClick={() => handleTabChange('technicalSpecs')}
              >
                Technical Specs
              </button>
            </div>
            
            {/* Tab Content - Job Information */}
            {activeTab === 'jobInformation' && (
              <div className="max-h-[calc(100vh-240px)] overflow-y-auto p-6" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: ' #3B50DF #D9D9D9'
              }}>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Delivery Point Field */}
                      <div>
                        <div className="flex items-center">
                          <label htmlFor="deliveryPoint">
                            Delivery Point<span className="text-red-500">*</span>
                          </label>
                          <div className="ml-2">
                            <deliveryPointTooltip.Tooltip {...deliveryPointTooltip.tooltipProps}>
                              <div className="text-slate-700 cursor-help">
                                <IoMdInformationCircle size={18} />
                              </div>
                            </deliveryPointTooltip.Tooltip>
                          </div>
                        </div>
                        <input
                          type="text"
                          id="deliveryPoint"
                          name="deliveryPoint"
                          required
                          value={formData.deliveryPoint}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Consultant Field */}
                      <div>
                        <div className="flex items-center">
                          <label htmlFor="consultant">
                            Consultant<span className="text-red-500">*</span>
                          </label>
                          <div className="ml-2">
                            <consultantTooltip.Tooltip {...consultantTooltip.tooltipProps}>
                              <div className="text-slate-700 cursor-help">
                                <IoMdInformationCircle size={18} />
                              </div>
                            </consultantTooltip.Tooltip>
                          </div>
                        </div>
                        <input
                          type="text"
                          id="consultant"
                          name="consultant"
                          required
                          value={formData.consultant}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Contractor Field */}
                      <div>
                        <div className="flex items-center">
                          <label htmlFor="contractor">
                            Contractor<span className="text-red-500">*</span>
                          </label>
                          <div className="ml-2">
                            <contractorTooltip.Tooltip {...contractorTooltip.tooltipProps}>
                              <div className="text-slate-700 cursor-help">
                                <IoMdInformationCircle size={18} />
                              </div>
                            </contractorTooltip.Tooltip>
                          </div>
                        </div>
                        <input
                          type="text"
                          id="contractor"
                          name="contractor"
                          required
                          value={formData.contractor}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Delivery Time Field */}
                      <style>
                        {`
                        input[type="time"] {
                        position: relative;
                        color: #333;
                      }

                      /* Hide the default time picker indicator */
                      input[type="time"]::-webkit-time-picker-indicator {
                        background-image: none;
                        position: absolute;
                        right: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                        cursor: pointer;
                        opacity: 0;
                        z-index: 2;
                        width: 20px;
                        height: 20px;
                      }

                      /* Default clock emoji for regular time inputs */
                      input[type="time"]::after {
                        content: "🕙";
                        position: absolute;
                        right: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                        color: rgb(1, 9, 11); 
                        pointer-events: none;
                        z-index: 1;
                      }

                      /* Custom SVG icon for inputs with svg-calendar class */
                      input[type="time"].svg-calendar::after {
                        content: "";
                        position: absolute;
                        right: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 20px;
                        height: 20px;
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23077A9A' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z'/%3E%3Cpath d='M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z'/%3E%3C/svg%3E");
                        background-repeat: no-repeat;
                        background-size: contain;
                        pointer-events: none;
                        z-index: 1;
                      }

                      /* Alternative: Clock icon variant */
                      input[type="time"].clock-icon::after {
                        content: "";
                        position: absolute;
                        right: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 20px;
                        height: 20px;
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23077A9A' viewBox='0 0 24 24'%3E%3Cpath d='M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z'/%3E%3C/svg%3E");
                        background-repeat: no-repeat;
                        background-size: contain;
                        pointer-events: none;
                        z-index: 1;
                      `}
                      </style>
                      <div>
                        <label htmlFor="deliveryTime">
                          Delivery Time<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          id="deliveryTime"
                          name="deliveryTime"
                          required
                          value={convertTo24HourFormat(formData.deliveryTime)}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 svg-calendar"
                        />
                      </div>

                      {/* Sub Contractor Field */}
                      <div>
                        <label htmlFor="subContractor">
                          Sub Contractor
                        </label>
                        <input
                          type="text"
                          id="subContractor"
                          name="subContractor"
                          value={formData.subContractor}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Tab Content - Payment Details */}
            {activeTab === 'paymentDetails' && (
              <div className="max-h-[calc(100vh-240px)] overflow-y-auto p-6" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: ' #3B50DF #D9D9D9'
              }}>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Payment Type Field */}
                      <div>
                        <div className="flex items-center">
                          <label htmlFor="gpType">
                            Payment Type<span className="text-red-500">*</span>
                          </label>
                          <div className="ml-2">
                            <paymentTypeTooltip.Tooltip {...paymentTypeTooltip.tooltipProps}>
                              <div className="text-slate-700 cursor-help">
                                <IoMdInformationCircle size={18} />
                              </div>
                            </paymentTypeTooltip.Tooltip>
                          </div>
                        </div>
                        <select
                          id="paymentType"
                          name="paymentType"
                          required
                          value={formData.paymentType}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Payment Type</option>
                          <option value="COD">COD</option>
                          <option value="CREDIT">Credit</option>
                        </select>
                      </div>

                      {/* GP Field */}
                      <div>
                        <label htmlFor="subContractor">
                           GP
                        </label>
                        <input
                          type="number"
                          id="gp"
                          name="gp"
                          value={formData.gp}
                          onChange={handleChange}
                          className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Invoice Type Field */}
                      <div>
                        <div className="flex items-center">
                          <label className="block text-sm font-medium">
                            Invoice Type<span className="text-red-500">*</span>
                          </label>
                          <div className="ml-2">
                            <invoiceTypeTooltip.Tooltip {...invoiceTypeTooltip.tooltipProps}>
                              <div className="text-slate-700 cursor-help">
                                <IoMdInformationCircle size={18} />
                              </div>
                            </invoiceTypeTooltip.Tooltip>
                          </div>
                        </div>
                        <div className="mt-2 space-y-2">
                          {['VAT', 'SVAT', 'OTHER'].map((type) => (
                            <div key={type} className="flex items-center">
                              <CustomCheckbox
                                id={`invoiceType-${type}`}
                                name={`invoiceType-${type}`}
                                checked={formData.invoiceType.includes(type)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...formData.invoiceType, type]
                                    : formData.invoiceType.filter(t => t !== type);
                                  setFormData(prev => ({
                                    ...prev,
                                    invoiceType: newTypes
                                  }));
                                }}
                                label={type}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - File Upload */}
                    <div className="space-y-6">
                      {/* Attachments Field */}
                      <div>
                        <div className="flex items-center">
                          <label htmlFor="attachment">Attachments</label>
                          <div className="ml-2">
                            <attachmentTooltip.Tooltip {...attachmentTooltip.tooltipProps}>
                              <div className="text-slate-700 cursor-help">
                                <IoMdInformationCircle size={18} />
                              </div>
                            </attachmentTooltip.Tooltip>
                          </div>
                        </div>

                        {/* Hidden file input */}
                        <input 
                          ref={fileInputRef}
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          multiple // Enable multiple file selection
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                        
                        {/* Display file name or placeholder */}
                        {formData.attachments.filter((attachment) => !attachment.markedForDeletion).length > 0 ? (
                          <div className="bg-blue-50 rounded-md p-3 flex flex-col">
                            <div className="bg-blue-50 mb-3 border border-blue-100 rounded">
                              {/* Display list of non-deleted attachments */}
                              {formData.attachments.map((attachment, index) =>
                                !attachment.markedForDeletion ? (
                                  <div key={index} className="p-2 flex justify-between items-center border-b border-blue-100 last:border-b-0">
                                    <p className="text-blue-800 truncate">{attachment.name}</p>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteFile(index)}
                                      className="text-[#3B50DF] bg-blue-50 hover:text-red-500 hover:border-blue-50 focus:outline-none"
                                    >
                                      <MdDelete size={20} />
                                    </button>
                                  </div>
                                ) : null
                              )}
                            </div>
                            <div className="flex justify-between items-center w-full">
                              <button
                                type="button"
                                onClick={handleBrowseClick}
                                className="flex bg-blue-50 items-center text-sm font-medium hover:border-blue-50 hover:text-[#3B50DF] focus:outline-none"
                              >
                                <span>Add More Files</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className={`flex flex-col items-center justify-center px-6 pt-5 pb-6 bg-blue-50 border-2 border-dashed rounded-md h-48 transition-colors ${dragActive ? 'border-blue-500 bg-blue-100' : 'border-transparent'}`}
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                          >
                            <div className="space-y-2 text-center">
                              <div className="mx-auto flex items-center rounded-md justify-center">
                                <FaFileAlt className="" size={80}/>
                              </div>
                              <div className="flex flex-col text-sm text-gray-600">
                                <span>Drag files here or</span>
                                <button
                                  type="button"
                                  onClick={handleBrowseClick}
                                  className="text-blue-600 bg-blue-50 hover:border-blue-50 hover:text-blue-500 focus:outline-none"
                                >
                                  Browse files
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Tab Content - Technical Specs */}
            {activeTab === 'technicalSpecs' && (
              <div className="max-h-[calc(100vh-310px)] overflow-y-auto p-6" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: ' #3B50DF #D9D9D9'
              }}>
                <form className="space-y-6">
                  {/* Enclosure Type Section */}
                  <div className="">
                    <h3 className="text-lg font-medium mb-4">Enclosure Type</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column - Main Enclosure Types */}
                      <div>
                        <div className="flex items-center">
                          <CustomCheckbox
                            id="floorMounting"
                            name="floorMounting"
                            checked={formData.floorMounting}
                            onChange={handleChange}
                          />
                          <label htmlFor="floorMounting" className="ml-2 block text-sm">
                            Floor Mounting Enclosure
                          </label>
                        </div>

                        {formData.wallMounting && (
                          <div className="mt-8">
                            <h4 className="text-sm font-medium mb-4">Wall Mounting Dimensions</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="mb-4">
                                  <label htmlFor="lid" className="block text-sm">Lid :</label>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      id="lid"
                                      name="lid"
                                      value={formData.lid}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="shelf" className="block text-sm">Shelf :</label>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      id="shelf"
                                      name="shelf"
                                      value={formData.shelf}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="wallDoor" className="block text-sm">Door :</label>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      id="wallDoor"
                                      name="wallDoor"
                                      value={formData.wallDoor}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="coverPlate" className="block text-sm">Cover Plate :</label>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      id="coverPlate"
                                      name="coverPlate"
                                      value={formData.coverPlate}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="mb-4">
                                  <label htmlFor="wallMountingPlate" className="block text-sm">Mounting Plate :</label>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      id="wallMountingPlate"
                                      name="wallMountingPlate"
                                      value={formData.wallMountingPlate}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="topGlandPlate" className="block text-sm">Top Gland Plate :</label>
                                  <div className="flex gap-2 items-center">
                                    <select className='bg-blue-50 py-1 px-2 focus:outline-none'
                                      id='topGlandPlateMaterial'
                                      name='topGlandPlateMaterial'
                                      value={formData.topGlandPlateMaterial}
                                      onChange={handleChange}
                                    >
                                      <option value="">Select...</option>
                                      <option value="ALUMINIUM">Aluminum</option>
                                      <option value="METAL">Metal</option>
                                    </select>
                                    <input
                                      type="number"
                                      id="topGlandPlate"
                                      name="topGlandPlate"
                                      value={formData.topGlandPlate}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="bottomGlandPlate" className="block text-sm">Bottom Gland Plate :</label>
                                  <div className="flex gap-2 items-center">
                                    <select className='bg-blue-50 py-1 px-2 focus:outline-none'
                                      id='bottomGlandPlateMaterial'
                                      name='bottomGlandPlateMaterial'
                                      value={formData.bottomGlandPlateMaterial}
                                      onChange={handleChange}
                                    >
                                      <option value="">Select...</option>
                                      <option value="ALUMINIUM">Aluminum</option>
                                      <option value="METAL">Metal</option>
                                    </select>
                                    <input
                                      type="number"
                                      id="bottomGlandPlate"
                                      name="bottomGlandPlate"
                                      value={formData.bottomGlandPlate}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {formData.floorMounting && (
                          <div className="mt-8">
                            <h4 className="text-sm font-medium mb-4">Floor Mounting Dimensions</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="mb-4">
                                  <label htmlFor="framework" className="block text-sm">Framework :</label>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      id="framework"
                                      name="framework"
                                      value={formData.framework}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="baseFrame" className="block text-sm">Base Frame :</label>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      id="baseFrame"
                                      name="baseFrame"
                                      value={formData.baseFrame}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="partition" className="block text-sm">Partition :</label>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      id="partition"
                                      name="partition"
                                      value={formData.partition}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="door" className="block text-sm">Door :</label>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      id="door"
                                      name="door"
                                      value={formData.door}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="mountingPlate" className="block text-sm">Mounting Plate :</label>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      id="mountingPlate"
                                      name="mountingPlate"
                                      value={formData.mountingPlate}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="mb-4">
                                  <label htmlFor="escutcheon" className="block text-sm">Escutcheon :</label>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      id="escutcheon"
                                      name="escutcheon"
                                      value={formData.escutcheon}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="coveringPanels" className="block text-sm">Covering Panels :</label>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      id="coveringPanels"
                                      name="coveringPanels"
                                      value={formData.coveringPanels}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="topCover" className="block text-sm">Top Cover :</label>
                                  <div className="flex gap-2 items-center">
                                    <select className='bg-blue-50 py-1 px-2 focus:outline-none'
                                      id='topCoverMaterial'
                                      name='topCoverMaterial'
                                      value={formData.topCoverMaterial}
                                      onChange={handleChange}
                                    >
                                      <option value="">Select...</option>
                                      <option value="ALUMINIUM">Aluminum</option>
                                      <option value="METAL">Metal</option>
                                    </select>
                                    <input
                                      type="number"
                                      id="topCover" 
                                      name="topCover"
                                      value={formData.topCover}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <label htmlFor="bottomPlate" className="block text-sm">Bottom Plate :</label>
                                  <div className="flex gap-2 items-center">
                                    <select className='bg-blue-50 py-1 px-2 focus:outline-none'
                                      id='bottomPlateMaterial'
                                      name='bottomPlateMaterial'
                                      value={formData.bottomPlateMaterial}
                                      onChange={handleChange}
                                    >
                                      <option value="">Select...</option>
                                      <option value="ALUMINIUM">Aluminum</option>
                                      <option value="METAL">Metal</option>
                                    </select>
                                    <input
                                      type="number"
                                      id="bottomPlate"
                                      name="bottomPlate"
                                      value={formData.bottomPlate}
                                      onChange={handleChange}
                                      className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">mm</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-8">
                          <h4 className="text-sm font-medium mb-2">Enclosure Type</h4>
                          
                          <div className="grid grid-cols-3 mt-4">
                            <div>
                              <span className="text-sm font-medium mb-4 block"></span>
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-medium mb-4 block">Outdoor</span>
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-medium mb-4 block">Indoor</span>
                            </div>
                            
                            {/* Surface Type Enclosure */}
                            <div className="py-2">
                              <span className="text-sm">Surface Type Enclosure</span>
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="surfaceTypeOutdoor"
                                name="surfaceTypeOutdoor"
                                checked={formData.surfaceTypeOutdoor}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="surfaceTypeIndoor"
                                name="surfaceTypeIndoor"
                                checked={formData.surfaceTypeIndoor}
                                onChange={handleChange}
                              />
                            </div>
                            
                            {/* Flush Type Enclosure */}
                            <div className="py-2">
                              <span className="text-sm">Flush Type Enclosure</span>
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="flushTypeOutdoor"
                                name="flushTypeOutdoor"
                                checked={formData.flushTypeOutdoor}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="flushTypeIndoor"
                                name="flushTypeIndoor"
                                checked={formData.flushTypeIndoor}
                                onChange={handleChange}
                              />
                            </div>
                            
                            {/* Freestanding Type Panel */}
                            <div className="py-2">
                              <span className="text-sm">Freestanding Type Panel</span>
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="freestandingTypeOutdoor"
                                name="freestandingTypeOutdoor"
                                checked={formData.freestandingTypeOutdoor}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="freestandingTypeIndoor"
                                name="freestandingTypeIndoor"
                                checked={formData.freestandingTypeIndoor}
                                onChange={handleChange}
                              />
                            </div>
                            
                            {/* Lid Type Enclosure */}
                            <div className="py-2">
                              <span className="text-sm">Lid Type Enclosure</span>
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="lidTypeOutdoor"
                                name="lidTypeOutdoor"
                                checked={formData.lidTypeOutdoor}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="lidTypeIndoor"
                                name="lidTypeIndoor"
                                checked={formData.lidTypeIndoor}
                                onChange={handleChange}
                              />
                            </div>
                            
                            {/* Outdoor Wall Mounting */}
                            <div className="py-2">
                              <span className="text-sm">Outdoor Wall Mounting</span>
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="outdoorWallOutdoor"
                                name="outdoorWallOutdoor"
                                checked={formData.outdoorWallOutdoor}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="outdoorWallIndoor"
                                name="outdoorWallIndoor"
                                checked={formData.outdoorWallIndoor}
                                onChange={handleChange}
                              />
                            </div>
                            
                            {/* Feeder Pillar */}
                            <div className="py-2">
                              <span className="text-sm">Feeder Pillar</span>
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="feederPillarOutdoor"
                                name="feederPillarOutdoor"
                                checked={formData.feederPillarOutdoor}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="feederPillarIndoor"
                                name="feederPillarIndoor"
                                checked={formData.feederPillarIndoor}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-8">
                          <h4 className="text-sm font-medium mb-2">Cable/Busbar</h4>
                          
                          <div className="grid grid-cols-3 mt-4">
                            <div>
                              <span className="text-sm font-medium mb-4 block"></span>
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-medium mb-4 block">Incoming</span>
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-medium mb-4 block">Outgoing</span>
                            </div>
                            
                            {/* Busbar */}
                            <div className="py-2">
                              <span className="text-sm">Busbar</span>
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="busbarIncoming"
                                name="busbarIncoming"
                                checked={formData.busbarIncoming}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="busbarOutgoing"
                                name="busbarOutgoing"
                                checked={formData.busbarOutgoing}
                                onChange={handleChange}
                              />
                            </div>
                            
                            {/* Top */}
                            <div className="py-2">
                              <span className="text-sm">Top</span>
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="topIncoming"
                                name="topIncoming"
                                checked={formData.topIncoming}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="topOutgoing"
                                name="topOutgoing"
                                checked={formData.topOutgoing}
                                onChange={handleChange}
                              />
                            </div>
                            
                            {/* Bottom */}
                            <div className="py-2">
                              <span className="text-sm">Bottom</span>
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="bottomIncoming"
                                name="bottomIncoming"
                                checked={formData.bottomIncoming}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="bottomOutgoing"
                                name="bottomOutgoing"
                                checked={formData.bottomOutgoing}
                                onChange={handleChange}
                              />
                            </div>
                            
                            {/* Left */}
                            <div className="py-2">
                              <span className="text-sm">Left</span>
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="leftIncoming"
                                name="leftIncoming"
                                checked={formData.leftIncoming}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="leftOutgoing"
                                name="leftOutgoing"
                                checked={formData.leftOutgoing}
                                onChange={handleChange}
                              />
                            </div>
                            
                            {/* Right */}
                            <div className="py-2">
                              <span className="text-sm">Right</span>
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="rightIncoming"
                                name="rightIncoming"
                                checked={formData.rightIncoming}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="rightOutgoing"
                                name="rightOutgoing"
                                checked={formData.rightOutgoing}
                                onChange={handleChange}
                              />
                            </div>
                            
                            {/* Rear Top */}
                            <div className="py-2">
                              <span className="text-sm">Rear Top</span>
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="rearTopIncoming"
                                name="rearTopIncoming"
                                checked={formData.rearTopIncoming}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="rearTopOutgoing"
                                name="rearTopOutgoing"
                                checked={formData.rearTopOutgoing}
                                onChange={handleChange}
                              />
                            </div>

                            {/* Rear Bottom */}
                            <div className="py-2">
                              <span className="text-sm">Rear Bottom</span>
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="rearBottomIncoming"
                                name="rearBottomIncoming"
                                checked={formData.rearBottomIncoming}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="flex justify-center py-2">
                              <CustomCheckbox
                                id="rearBottomOutgoing"
                                name="rearBottomOutgoing"
                                checked={formData.rearBottomOutgoing}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div>
                        <div className="flex items-center">
                          <CustomCheckbox
                            id="wallMounting"
                            name="wallMounting"
                            checked={formData.wallMounting}
                            onChange={handleChange}
                          />
                          <label htmlFor="wallMounting" className="ml-2 block text-sm">
                            Wall Mounting Enclosure
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Materials Section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Materials & Finishing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-6">
                        {/* Sheet Material */}
                        <div>
                          <label htmlFor="sheetMaterial" className="block text-sm font-medium">
                            Sheet Material
                          </label>
                          <select
                            id="sheetMaterial"
                            name="sheetMaterial"
                            value={formData.sheetMaterial}
                            onChange={handleChange}
                            className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Sheet Material</option>
                            <option value="MILD_STEEL">Mild Steel</option>
                            <option value="POWDER_COATING">Powder Coating</option>
                            <option value="ZN_ALUM">Zn Aluminium</option>
                            <option value="ZN_COATED">Zn Coated</option>
                            <option value="STAINLESS_STEEL">Stainless Steel</option>
                          </select>
                        </div>

                        {/* Painting Thickness */}
                        <div>
                          <label htmlFor="paintingThickness" className="block text-sm font-medium">
                            Painting Thickness
                          </label>
                          <select
                            id="paintingThickness"
                            name="paintingThickness"
                            value={formData.paintingThickness}
                            onChange={handleChange}
                            className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Painting Thickness</option>
                            <option value="STANDARD">Standard</option>
                            <option value="OPTIONAL">Optional</option>
                          </select>
                        </div>

                        {/* Primer Checkbox */}
                        <div className="flex items-center">
                          <CustomCheckbox
                            id="primer"
                            name="primer"
                            checked={formData.primer}
                            onChange={handleChange}
                          />
                          <label htmlFor="primer" className="ml-2 block text-sm">
                            Primer
                          </label>
                        </div>

                        {/* Color */}
                        <div>
                          <label htmlFor="color" className="block text-sm font-medium">
                            Colour
                          </label>
                          <select
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Colour</option>
                            <option value="BLACK">Black</option>
                            <option value="WHITE">White</option>
                            <option value="GREY">Grey</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        {/* Powder Coating */}
                        <div>
                          <label htmlFor="powderCoating" className="block text-sm font-medium">
                            Powder Coating
                          </label>
                          <select
                            id="powderCoating"
                            name="powderCoating"
                            value={formData.powderCoating}
                            onChange={handleChange}
                            className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Powder Coating</option>
                            <option value="RAL">RAL</option>
                          </select>
                        </div>

                        {/* Surface Type */}
                        <div>
                          <label htmlFor="surfaceType" className="block text-sm font-medium">
                            Surface Type
                          </label>
                          <select
                            id="surfaceType"
                            name="surfaceType"
                            value={formData.surfaceType}
                            onChange={handleChange}
                            className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Surface Type</option>
                            <option value="GLOSS">Gloss</option>
                            <option value="TEXTURED">Textured</option>
                          </select>
                        </div>

                        {/* HDG Checkbox */}
                        <div className="flex items-center">
                          <CustomCheckbox
                            id="hdg"
                            name="hdg"
                            checked={formData.hdg}
                            onChange={handleChange}
                          />
                          <label htmlFor="hdg" className="ml-2 block text-sm">
                            Hot-Dip Galvanizing (HDG)
                          </label>
                        </div>

                        {/* Remarks */}
                        <div>
                          <label htmlFor="remarks" className="block text-sm font-medium">
                            Remarks
                          </label>
                          <textarea
                            id="remarks"
                            name="remarks"
                            rows="3"
                            value={formData.remarks}
                            onChange={handleChange}
                            className="mt-1 block w-full bg-blue-50 border border-transparent rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add any additional specifications or notes here..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className='flex justify-end mt-4 mr-4'>
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className='bg-[#3C50E0] text-white px-6 py-2 rounded mr-4 hover:bg-blue-700 disabled:bg-[#3C50E0]'
            >
              {submitting ? <ButtonLoader text={isEditMode ? "Updating..." : "Saving..."} /> : (isEditMode ? 'Update' : 'Save')}
            </button>
            <button 
              type='button'
              onClick={handleCancel}
              disabled={submitting}
              className='bg-gray-100 text-black border border-[#3B50DF] px-4 py-2 rounded hover:bg-gray-100 disabled:opacity-50'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddJobPage;