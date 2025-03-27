import React, { useState, useEffect, useRef } from 'react';
import DataTable from 'react-data-table-component';
import axiosInstance from '../../../../../axiosInstance.js';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { saveAs } from 'file-saver';
import { CSVLink } from 'react-csv';
import Select from 'react-select';
import '../../../../Custom.css';
import '../ProjectStyles.css';
import { BiDotsVertical, BiSolidEditAlt } from 'react-icons/bi';
import { LiaTimesSolid } from 'react-icons/lia';
import { IoMdDownload, IoMdPersonAdd } from 'react-icons/io';
import { IoGrid } from 'react-icons/io5';
import {
  FaThList,
  FaFolderPlus,
  FaEdit,
  FaGoogleDrive,
  FaChevronLeft,
  FaFile,
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaFileCsv,
} from 'react-icons/fa';
import { MdFolderOff } from 'react-icons/md';
import { RiAddLargeFill } from 'react-icons/ri';
import { AiOutlineFileAdd } from 'react-icons/ai';
import { BsQrCode, BsFillFolderFill } from 'react-icons/bs';
import { GrMultiple, GrDocumentCsv } from 'react-icons/gr';
import ifcIcon from '../../../../assets/images/ifc-icon.png';
import pdfIcon from '../../../../assets/images/pdf-icon.png';
import dxfIcon from '../../../../assets/images/dxf-icon.png';
import {
  Modal,
  Button,
  ToastContainer,
  Toast,
} from 'react-bootstrap';
import ProjectSidebar from '../ProjectFolderSidebar';
import SidebarOffcanvas from '../MobileSidebar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import useWindowWidth from './windowWidthHook.jsx';
import { useLoader } from '../../../Loaders/LoaderContext';

// import useDrivePicker from 'react-google-drive-picker';

import QrCodeGenerator from '../../../../QrCodeGenerator.jsx';
import * as WEBIFC from 'web-ifc';
import * as BUI from '@thatopen/ui';
import * as OBC from '@thatopen/components';
import { FragmentsGroup } from '@thatopen/fragments';

function ProjectExplorer() {
  // const [openPicker, data, authResponse] = useDrivePicker();
  const { setLoading } = useLoader();
  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [ownerName, setOwnerName] = useState('');

  const [viewType, setViewType] = useState('list');
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [offcanvasMenuOpen, setOffcanvasMenuOpen] = useState(false);

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [showAddFolderSubMenu, setShowAddFolderSubMenu] =
    useState(false);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [availableEmails, setAvailableEmails] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [releaseNote, setReleaseNote] = useState('');

  const [isGenerateQRCodeModalOpen, setIsGenerateQRCodeModalOpen] =
    useState(false);

  const handleOpenQRCodeModal = () =>
    setIsGenerateQRCodeModalOpen(true);
  const handleCloseQRCodeModal = () =>
    setIsGenerateQRCodeModalOpen(false);

  const handleOpenShareModal = () => setIsShareModalOpen(true);
  const handleCloseShareModal = () => setIsShareModalOpen(false);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastPosition, setToastPosition] = useState('bottom-end');
  const showToast = () => setShowSuccessToast(!showSuccessToast);

  const [roleCheck, setRoleCheck] = useState([]);
  // console.log(roleCheck);
  const addMenuToggle = () => {
    setIsAddMenuOpen(!isAddMenuOpen);
  };

  const handleOCMenuToggle = () => {
    setOffcanvasMenuOpen(!offcanvasMenuOpen);
  };

  const handleOCMenuOptionClick = (option) => {
    setOffcanvasMenuOpen(false);
    Swal.fire(`Function to ${option}`);
  };

  const [explorerSubfolders, setExplorerSubfolders] = useState([]);
  const [explorerTable, setExplorerTable] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuOptionClick = (option) => {
    setMenuOpen(false);
    Swal.fire(`Function to: ${option}`);
  };

  const [showCanvas, setShowCanvas] = useState(false);
  const handleCloseCanvas = () => setShowCanvas(false);
  const handleShowCanvas = () => setShowCanvas(true);

  const [selectedRow, setSelectedRow] = useState(null); // State to hold the selected row details

  // Handle row click
  const handleRowClick = (row) => {
    setSelectedRow(row); // Set the clicked row's data
    handleShowCanvas(); // Show the Offcanvas
  };

  const handleEditClick = () => {
    setShowEditCanvas(true);
  };

  // const handleOpenPicker = () => {
  //   openPicker({
  //     clientId: '1043565058642-l6jbl5nq0i519h8dctpoo0i1ru2vp5s6.apps.googleusercontent.com',
  //     developerKey: "AIzaSyCeFx5pGWMSp1kGmkFdCj5BTU8bCqP-ORo",
  //     viewId:"FOLDERS",
  //     showUploadView: true,
  //     showUploadFolders: true,
  //     supportDrives: true,
  //     multiselect: false,
  //     callbackFunction: (response) => {
  //       if (response.action === "picked") {
  //         const folderId = response.docs[0]?.id; // Get the selected folder ID
  //         console.log("Selected Folder ID:", folderId);
  //         fetchFolderContents(folderId); // Call a function to fetch folder contents
  //       } else {
  //         console.log("No folder selected.");
  //       }
  //     },
  //     onError: (error) => {
  //       console.error("Picker Error: ", error);
  //     },
  //   });
  // }

  // useEffect(() => {
  //   if (data && data.folders) {
  //     data.folders.map((i) => console.log(i));
  //   }
  // }, [data]);

  // const fetchFolderContents = async (folderId) => {
  //   const accessToken = authResponse.access_token; // Assuming you get this from the Picker's authResponse
  //   const apiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType)`;

  //   try {
  //     const response = await fetch(apiUrl, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     });
  //     const data = await response.json();
  //     console.log("Folder Contents:", data.files);

  //     // Example: Copy a file
  //     if (data.files.length > 0) {
  //       copyFile(data.files[0].id, "New File Name", folderId, accessToken);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching folder contents:", error);
  //   }
  // };

  // const copyFile = async (fileId, newName, parentFolderId, accessToken) => {
  //   const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/copy`;
  //   try {
  //     const response = await fetch(apiUrl, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         name: newName,
  //         parents: [parentFolderId], // Copy into the same folder
  //       }),
  //     });
  //     const data = await response.json();
  //     console.log("File copied:", data);
  //   } catch (error) {
  //     console.error("Error copying file:", error);
  //   }
  // };

  // Fetch project details and populate fields
  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/project/${projectId}`
      );
      const { id, project_name, owner, folderTree } = response.data;

      setProjectName(project_name);
      setOwnerName(`${owner.first_name} ${owner.last_name}`);

      // ✅ Extract ONLY top-level files, no deep recursion
      const extractTopLevelFiles = (folderNode) => {
        if (!folderNode.files || folderNode.files.length === 0)
          return [];

        return folderNode.files
          .filter(
            (file) =>
              !file.fileName.endsWith('.json') &&
              !file.fileName.endsWith('.ifc')
          )
          .map((file) => ({
            projectId: id,
            fileName: file.fileName,
            fileSize: `${(file.fileSize / (1024 * 1024)).toFixed(
              2
            )} MB`,
            fileOwner: file.fileOwner,
            created: new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            }).format(new Date(file.fileCreationTime)),
            lastAccessed: new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            }).format(new Date(file.fileLastAccessed)),
            lastModified: new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            }).format(new Date(file.fileLastModified)),
          }));
      };

      // ✅ Extract ONLY direct subfolders, no recursion
      const extractDirectSubfolders = (
        folderNode,
        parentPath = ''
      ) => {
        if (
          !folderNode.subfolders ||
          folderNode.subfolders.length === 0
        )
          return [];

        return folderNode.subfolders.map((subfolder) => ({
          folderName: subfolder.folderName,
          folderPath: parentPath
            ? `${parentPath}/${subfolder.folderName}`
            : subfolder.folderName, // ✅ Correct path
        }));
      };

      const topLevelFiles = extractTopLevelFiles(folderTree);
      const directSubfolders = extractDirectSubfolders(
        folderTree,
        folderTree.folderName
      );

      setExplorerSubfolders(directSubfolders); // Only direct subfolders
      setExplorerTable(topLevelFiles); // Only top-level files

      // console.table(topLevelFiles);
      // console.table(directSubfolders);
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const [currentUserResponse, projectResponse, usersResponse] =
        await Promise.all([
          axiosInstance.get(`/user`),
          axiosInstance.get(`/project-contributors/${projectId}`),
          axiosInstance.get(`/users`),
        ]);

      const currentUser = currentUserResponse.data;
      const userRole = currentUser.roles.map(
        (roleName) => roleName.role_name
      );
      setRoleCheck(userRole);
      const { contributors } = projectResponse.data; // Get contributors from project details
      const users = usersResponse.data;

      // Extract emails of contributors
      const contributorEmails = contributors.map(
        (contributor) => contributor.email
      );

      const formattedToAdd = users
        .filter(
          (user) =>
            user.email !== currentUser.email && // Exclude current user
            contributorEmails.includes(user.email)
        )
        .map((user) => ({
          label: `${user.first_name} ${user.last_name} (${user.email})`, // Label for dropdown
          value: user.email, // Value for dropdown
        }));

      setAvailableEmails(formattedToAdd);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchAvailableUsers();
    fetchProjectDetails();
  }, [projectId, refreshKey]);

  // Define columns for the table
  const explorerColumn = [
    {
      name: ' ',
      cell: (row, index) => (
        <label className="del-checkbox">
          <input
            type="checkbox"
            onChange={(e) => {
              const checked = e.target.checked;
              setSelectedFiles((prev) =>
                checked
                  ? [...prev, index]
                  : prev.filter((i) => i !== index)
              );
            }}
            checked={selectedFiles.includes(index)}
          />
          <div className="del-checkmark" />
        </label>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: 'File Name',
      key: 'fileName',
      // width: '30%',
      selector: (row) => row.fileName,
      sortable: true,
      grow: 2,
    },
    {
      name: 'File Owner',
      key: 'fileOwner',
      // width: '20%',
      selector: (row) => row.fileOwner,
      sortable: true,
      hide: 'sm',
    },
    {
      name: 'Last Modified',
      key: 'lastModified',
      // width: '20%',
      selector: (row) => row.lastModified,
      sortable: true,
      // right: true,
      hide: 'md',
    },
    {
      name: 'File Size',
      key: 'fileSize',
      selector: (row) => row.fileSize,
      sortable: true,
      // right: true,
      hide: 'md',
    },
  ];

  const noDeleteColumn = roleCheck.includes('Client')
    ? explorerColumn.slice(1) // Remove the first column
    : explorerColumn;

  const handleExportToCSV = () => {
    // Filter out the checkbox column (no selector property)
    const filteredColumns = noDeleteColumn.filter(
      (col) => col.selector
    );
    // Extract headers
    const headers = filteredColumns.map((col) => ({
      label: col.name,
      key: col.key,
    }));
    // Map data rows based on filtered columns
    const data = explorerTable.map((row) =>
      Object.fromEntries(
        filteredColumns.map((col) => [col.key, col.selector(row)]) // Extract values dynamically
      )
    );
    return { headers, data };
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [selectedSubfolders, setSelectedSubfolders] = useState([]);
  const [deleteFolderMode, setDeleteFolderMode] = useState(false);
  const [newFolder, setNewFolder] = useState('');
  const [newFiles, setNewFiles] = useState([]);
  // console.log(newFiles)

  // const handleAddNewFile = async () => {
  //   try {
  //     const formData = new FormData();
  //     newFiles.forEach((file) => {
  //       formData.append('project_file', file);
  //     });

  //     await axiosInstance.post(
  //       `/upload-ifc-files/${projectId}`,
  //       formData,
  //       {
  //         headers: { 'Content-Type': 'multipart/form-data' },
  //       }
  //     );

  //     Swal.fire({
  //       title: 'Success!',
  //       text: 'File(s) has been added successfully.',
  //       icon: 'success',
  //       confirmButtonText: 'OK',
  //     });

  //     setShowAddModal(false);
  //     setNewFiles({ file: null });
  //     setRefreshKey((prevKey) => prevKey + 1);
  //   } catch (error) {
  //     Swal.fire({
  //       title: 'Error!',
  //       text: error,
  //       icon: 'error',
  //       confirmButtonText: 'OK',
  //     });
  //   }
  // };

  // const [fragFile, setFragFile] = useState(null);
  // const [propertiesJSON, setPropertiesJSON] = useState('');
  const [components] = useState(() => new OBC.Components());

  const handleAddNewFile = async () => {
    try {
      console.log('Starting file processing...');
      if (!newFiles.length) {
        console.warn('No new files to process.');
        return;
      }

      Swal.fire({
        title: 'Processing Files...',
        text: 'Please wait.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const formData = new FormData();
      const fragments = components.get(OBC.FragmentsManager);
      const fragmentIfcLoader = components.get(OBC.IfcLoader);

      console.log('Filtering files...');
      const pdfFiles = newFiles.filter(
        (file) => file.type === 'application/pdf'
      );
      const ifcFiles = newFiles.filter(
        (file) => file.type !== 'application/pdf'
      );

      // Handle PDF Upload Immediately
      if (pdfFiles.length > 0) {
        console.log('📄 Found PDF files, uploading directly...');

        pdfFiles.forEach((file) => {
          // Extract original filename and remove extra ".pdf" if exists
          let fileName = file.name.replace(/\.pdf$/i, ''); // Remove trailing .pdf
          let extension = '.pdf';

          // Create a new File object with the cleaned-up name
          const updatedFile = new File(
            [file],
            `${fileName}${extension}`,
            { type: file.type }
          );

          // Append to FormData
          formData.append('project_file', updatedFile);
        });

        await axiosInstance.post(
          `/upload-pdf-files/${projectId}`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        console.log('✅ PDF files uploaded successfully.');
      }

      // Skip IFC processing if no IFC files exist
      if (ifcFiles.length === 0) {
        Swal.fire({
          title: 'Success!',
          text: 'PDF files uploaded successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });

        setShowAddModal(false);
        setNewFiles([]);
        setRefreshKey((prevKey) => prevKey + 1);
        return;
      }

      console.log('Setting up IFC loader...');
      await fragmentIfcLoader.setup();

      for (const file of ifcFiles) {
        try {
          console.log(`Processing IFC file: ${file.name}`);
          const data = await file.arrayBuffer();
          const buffer = new Uint8Array(data);
          console.log('File converted to Uint8Array.');

          console.log('Adding onFragmentsLoaded listener...');
          const onLoadHandler = async (model) => {
            try {
              console.log('🚀 Fragments loaded event triggered!');

              const groupsArray = Array.from(
                fragments.groups.values()
              );
              console.log(
                'Fragments Groups Found:',
                groupsArray.length
              );

              if (groupsArray.length === 0) {
                console.warn('⚠️ No fragment groups found!');
                return;
              }

              const group = groupsArray[0];
              console.log('Extracting fragment data...');
              const fragData = fragments.export(group);
              console.log(
                'Fragment data extracted, size:',
                fragData?.length
              );

              const fileName = file.name.split('.')[0];
              const dateID = Date.now();

              const fragBlob = new Blob([fragData]);
              console.log(
                'Fragment Blob created, size:',
                fragBlob.size
              );

              const fragFile = new File(
                [fragBlob],
                `${dateID}-${fileName}.frag`
              );
              console.log(
                'Fragment file created:',
                fragFile.name,
                'Size:',
                fragFile.size
              );

              const properties = group.getLocalProperties();
              console.log('Extracted properties:', properties);

              let propertiesFile = null;
              if (properties) {
                const propertiesBlob = new Blob([
                  JSON.stringify(properties),
                ]);
                console.log(
                  'Properties Blob created, size:',
                  propertiesBlob.size
                );

                propertiesFile = new File(
                  [propertiesBlob],
                  `${dateID}-${fileName}.json`
                );
                console.log(
                  'Properties file created:',
                  propertiesFile.name,
                  'Size:',
                  propertiesFile.size
                );
              }

              console.log('Appending to FormData...');
              formData.append('project_file', file);
              console.log('Original IFC File appended to FormData');
              formData.append('project_file', fragFile);
              console.log('Frag File appended to FormData');
              console.log('✅ FormData after adding fragFile:', [
                ...formData.entries(),
              ]);

              if (propertiesFile) {
                formData.append('properties', propertiesFile);
                console.log(
                  '✅ FormData after adding propertiesFile:',
                  [...formData.entries()]
                );
              }

              console.log(
                '✅ Completed processing for file:',
                file.name
              );
              fragments.onFragmentsLoaded.remove(onLoadHandler);
            } catch (error) {
              console.error(
                '❌ Error processing IFC fragments:',
                error
              );
              fragments.onFragmentsLoaded.remove(onLoadHandler);
            }
          };

          fragments.onFragmentsLoaded.add(onLoadHandler, {
            once: true,
          });

          console.log('🚀 Loading IFC file...');
          await fragmentIfcLoader.load(buffer);
          console.log('✅ IFC file loaded successfully.');
        } catch (error) {
          console.error('❌ Error loading IFC file:', error);
        }
      }

      console.log('🔄 Final FormData entries before sending:', [
        ...formData.entries(),
      ]);

      console.log('📤 Sending IFC FormData to server...');
      await axiosInstance.post(
        `/upload-ifc-files/${projectId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      console.log('✅ IFC files uploaded successfully.');

      Swal.fire({
        title: 'Success!',
        text: 'Files have been added successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
      });

      setShowAddModal(false);
      setNewFiles([]);
      setRefreshKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error('❌ Error during file upload:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to upload files. Try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  // const [newFileName, setNewFileName] = useState('')
  // const handleRenameFile = async () => {
  //   if (!newFileName.trim()) {
  //     alert('New file name cannot be empty.');
  //     return;
  //   }

  //   try {
  //     const response = await axiosInstance.post(`/rename-file/${projectId}`, {
  //       oldFileName: selectedRow.fileName,
  //       newFileName: newFileName,
  //     });

  //     if (response.status === 200) {
  //       setRefreshKey((prevKey) => prevKey + 1); //Trigger a refresh or update
  //       handleCloseEditCanvas(); // Close the Offcanvas
  //     }
  //   } catch (error) {
  //     console.error('Error renaming file:', error);
  //     alert('Failed to rename the file. Please try again.');
  //   }
  // };

  // // Extract the base name and extension from the current file name
  // const fileNameParts = selectedRow?.fileName ? selectedRow.fileName.split('.') : [];
  // const fileBaseName = fileNameParts.length > 1
  //   ? fileNameParts.slice(0, -1).join('.')
  //   : selectedRow?.fileName || 'Untitled';
  // const fileExtension = fileNameParts.length > 1
  //   ? fileNameParts[fileNameParts.length - 1]
  //   : 'ifc'; // Fallback to a default extension if not available

  const handleAddNewFolder = async () => {
    if (!newFolder.trim()) {
      Swal.fire({
        title: 'Error!',
        text: 'Folder name cannot be empty.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      await axiosInstance.post(`/create-folder/${projectId}`, {
        folder_name: newFolder.trim(),
      });

      showToast(); // Show success message
      setShowAddFolderModal(false);
      setNewFolder('');
      setRefreshKey((prevKey) => prevKey + 1); // Refresh UI
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text:
          error.response?.data?.error || 'Failed to create folder',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const toggleSelectSubfolder = (folderPath) => {
    setSelectedSubfolders(
      (prevSelected) =>
        prevSelected.includes(folderPath)
          ? prevSelected.filter((item) => item !== folderPath) // Deselect
          : [...prevSelected, folderPath] // Select
    );
  };

  const deleteSelectedSubfolders = async () => {
    if (selectedSubfolders.length === 0) return;

    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedSubfolders.length} folder(s). This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-secondary',
      },
    });

    if (confirmed.isConfirmed) {
      try {
        await axiosInstance.post(`/delete-folders/${projectId}`, {
          folderPaths: selectedSubfolders,
        });

        // Show success message
        Swal.fire({
          title: 'Deleted!',
          text: 'The selected folders have been deleted.',
          icon: 'success',
          confirmButtonText: 'OK',
        });

        // Clear selection
        setSelectedSubfolders([]);
        setDeleteFolderMode(false);

        // Refresh folder list
        setRefreshKey((prevKey) => prevKey + 1);
      } catch (error) {
        console.error('Error deleting folders:', error);
        Swal.fire(
          'Error',
          'Failed to delete subfolders. Try again.',
          'error'
        );
      }
    }
  };

  const handleDeleteFiles = async () => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You won’t be able to revert this!.',
        showCancelButton: true,
        icon: 'warning',
        confirmButtonColor: '#EC221F',
        cancelButtonColor: '#00000000',
        cancelTextColor: '#000000',
        confirmButtonText: 'Yes, delete it!',
        customClass: {
          container: 'custom-container',
          confirmButton: 'custom-confirm-button',
          cancelButton: 'custom-cancel-button',
          title: 'custom-swal-title',
        },
      });

      if (result.isConfirmed) {
        const filesToDelete = selectedFiles.map(
          (index) => explorerTable[index]
        );
        for (const file of filesToDelete) {
          await axiosInstance.delete(
            `/delete-file/${projectId}/${file.fileName}`
          );
        }
        setExplorerTable((prev) =>
          prev.filter((_, index) => !selectedFiles.includes(index))
        );
        setSelectedFiles([]); // Clear selected files
        Swal.fire({
          title: 'Deleted!',
          text: 'Selected files have been deleted.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        setRefreshKey((prevKey) => prevKey + 1);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleShare = () => {
    if (recipients.length === 0) {
      alert('Please select at least one recipient.');
      return;
    }
    console.log('Share data:', { recipients, releaseNote });
    // Perform the share action (e.g., API call)
    handleCloseShareModal();
    showToast();
  };

  // const handleShare = async () => {
  //   document.querySelector(".offcanvas").setAttribute("aria-hidden", "true");
  //   document.querySelector(".offcanvas").setAttribute("inert", "true");
  //   Swal.fire({
  //     title: 'Share Data',
  //     html: `
  //       <div style="text-align: left;">

  //         <label for="recipients" style="display: block; margin-bottom: 5px;">Choose recipient(s):</label>
  //         <div id="swal-recipient-select" style= "margin-bottom: 15px; width: 100%;"></div>

  //         <label for="release-note" style="display: block; margin-bottom: 5px;">Note/Message</label>
  //         <textarea id="release-note" class="swal2-input" placeholder="Write a note..." style="
  //           margin-bottom: 10px; width: 100%;
  //           white-space: pre-wrap; word-wrap: break-word;
  //           background-color: #FFF; color: black;
  //         "></textarea>
  //       </div>
  //     `,
  //     confirmButtonText: 'Share',
  //     showCancelButton: true,
  //     customClass: {
  //       confirmButton: "btn btn-success rel-btn-success",
  //       cancelButton: "btn btn-danger rel-btn-danger"
  //     },
  //     preConfirm: () => {
  //       const shareWith = document.getElementById('share-with').value.trim();
  //       const recipients = document.getElementById('recipients').value.trim();
  //       const releaseNote = document.getElementById('release-note').value.trim();

  //       if (!shareWith || !recipients) {
  //         Swal.showValidationMessage('Please fill in all required fields.');
  //         return null;
  //       }

  //       const recipientList = recipients.split(',').map((name) => name.trim());

  //       if (recipientList.length === 0) {
  //         Swal.showValidationMessage('Please enter at least one recipient.');
  //         return null;
  //       }

  //       return { shareWith, recipients: recipientList, releaseNote };
  //     },

  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       document.querySelector(".offcanvas").removeAttribute("aria-hidden");
  //       document.querySelector(".offcanvas").removeAttribute("inert");
  //       const { shareWith, recipients, releaseNote } = result.value;
  //       return console.log("success", shareWith, recipients, releaseNote)

  //       // try {
  //       //   await axiosInstance.post(`/share-data/${projectId}`, {
  //       //     shareWith,
  //       //     recipients,
  //       //     releaseNote,
  //       //   });
  //       //   Swal.fire('Success!', 'The new release has been added.', 'success');
  //       // } catch (error) {
  //       //   Swal.fire('Error!', 'Failed to add the release. Try again.', 'error');
  //       //   console.error(error);
  //       // }

  //     } else if (result.dismiss === Swal.DismissReason.cancel) {
  //       // If the user cancels, restore focus and remove inert attributes
  //       document.querySelector(".offcanvas").removeAttribute("aria-hidden");
  //       document.querySelector(".offcanvas").removeAttribute("inert");
  //       document.querySelector(".offcanvas button").focus();
  //     }
  //   });
  // };

  const menuRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
        setOffcanvasMenuOpen(false);
        setIsAddMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const downloadFile = async (fileName) => {
    Swal.fire({
      title: 'Fetching file...',
      text: 'Please wait.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      let downloadTarget = fileName; // Default: download requested file

      // ✅ If the file is a .frag, find the corresponding .ifc instead
      if (fileName.endsWith('.frag')) {
        const response = await axiosInstance.get(
          `/project/${projectId}`
        );
        const folderTree = response.data.folderTree;

        // Extract the original IFC file name by removing the timestamp
        const expectedIfcName = fileName
          .replace(/^\d+-/, '')
          .replace('.frag', '.ifc');

        console.log(
          `🔍 Looking for corresponding IFC file: ${expectedIfcName}`
        );

        // Function to search for the IFC file in the folderTree
        const findMatchingIfcFile = (folderNode, expectedName) => {
          if (!folderNode.files || folderNode.files.length === 0)
            return null;
          return folderNode.files.find(
            (file) => file.fileName === expectedName
          )
            ? expectedName
            : null;
        };

        const foundIfcFile = findMatchingIfcFile(
          folderTree,
          expectedIfcName
        );

        if (foundIfcFile) {
          console.log(`🎯 Found matching IFC file: ${foundIfcFile}`);
          downloadTarget = foundIfcFile; // Switch download to IFC file
        } else {
          console.warn(
            `⚠️ No matching IFC file found for: ${fileName}`
          );
          Swal.fire(
            'Error!',
            `No IFC file found for ${fileName}.`,
            'error'
          );
          return;
        }
      }

      // ✅ Download the determined file
      console.log(`📥 Downloading: ${downloadTarget}`);
      const response = await axiosInstance.get(
        `/download-file/${projectId}/${downloadTarget}`,
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data]);
      saveAs(blob, downloadTarget);
      console.log(`✅ Successfully downloaded: ${downloadTarget}`);

      Swal.fire(
        'Success!',
        `${downloadTarget} has been downloaded.`,
        'success'
      );
    } catch (error) {
      Swal.fire(
        'Error!',
        `Failed to download ${fileName}. Try again.`,
        'error'
      );
      console.error(error);
    } finally {
      Swal.close();
    }
  };

  // console.log(selectedRow?.projectId || '')

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.ifc')) return ifcIcon;
    if (fileName.endsWith('.pdf')) return pdfIcon;
    if (fileName.endsWith('.dxf')) return dxfIcon;
    return <FaFile size={24} color="#555" />;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 9;

  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = explorerTable.slice(
    indexOfFirstFile,
    indexOfLastFile
  );

  const totalPages = Math.ceil(explorerTable.length / filesPerPage);

  return (
    <div className="container">
      <h3 className="projectFolder-title" id="projectFolder-title">
        {ownerName}&apos;s {projectName}
      </h3>

      <div
        className="container-content"
        id="project-folder-container"
      >
        <div className="projectFolder-sidebar-container">
          {isMobile ? (
            <SidebarOffcanvas projectId={projectId} />
          ) : (
            <ProjectSidebar projectId={projectId} />
          )}
        </div>
        <div className="projectFolder-display">
          <div className="main">
            <div className="container-fluid moduleFluid">
              <div className="add-files-menu-container">
                <button
                  id="addFiles-btn"
                  className="btn addFiles-btn btn-primary"
                  title="Add"
                  // onClick={() => setShowAddModal(true)}
                  onClick={addMenuToggle}
                >
                  <RiAddLargeFill />
                </button>
                {isAddMenuOpen && (
                  <div className="addFile-dropdown" ref={menuRef}>
                    <div
                      className="addFile-dd-item"
                      // onMouseEnter={() => setShowAddFolderSubMenu(true)}
                      // onMouseLeave={() => setShowAddFolderSubMenu(false)}
                      onClick={setShowAddFolderModal}
                    >
                      <FaChevronLeft className="submenu-indicator" />
                      <FaFolderPlus className="addFile-dd-icon" />
                      <span>Create folder</span>
                      {/* {showAddFolderSubMenu && (
                    <div className="addFolder-subDropdown">
                      <div className="addFolder-subdd-item" onClick={handleOpenPicker}>
                        <FaGoogleDrive className="addFile-dd-icon" />
                        <span>Get Folder From Drive</span>
                      </div>
                      <div className="addFile-dd-divider" />
                      <div className="addFolder-subdd-item" onClick={setShowAddFolderModal}>
                        <FaEdit className="addFile-dd-icon" />
                        <span>Manually Create Folder</span>
                      </div>
                    </div>
                  )} */}
                    </div>
                    <div className="addFile-dd-divider" />
                    <div
                      className="addFile-dd-item"
                      onClick={() => setShowAddModal(true)}
                    >
                      <AiOutlineFileAdd className="addFile-dd-icon" />
                      <span>Upload files</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="project-content">
                <div className="table-header d-flex justify-content-between align-items-center">
                  <div className="page-title">
                    <h2>Explorer</h2>
                  </div>
                  <div
                    className="button-group d-flex"
                    id="explorer-buttons"
                  >
                    <button
                      id="gridView-toggle"
                      className={`btn btn-icon grid-view-btn ${
                        viewType === 'grid' ? 'active' : ''
                      }`}
                      title="Grid View"
                      onClick={() => setViewType('grid')}
                    >
                      <IoGrid />
                    </button>
                    <button
                      id="listView-toggle"
                      className={`btn btn-icon list-view-btn ${
                        viewType === 'list' ? 'active' : ''
                      }`}
                      title="List View"
                      onClick={() => setViewType('list')}
                    >
                      <FaThList />
                    </button>
                    {roleCheck.some((role) =>
                      ['Admin', 'Superadmin'].includes(role)
                    ) && (
                      <button
                        className="btn btn-icon"
                        id="batchEdit-pdf"
                        title="Edit Multiple PDFs"
                        onClick={() =>
                          navigate(
                            `/project-folder/multi-pdf-editor/${projectId}`
                          )
                        }
                      >
                        <GrMultiple />
                      </button>
                    )}
                    <button className="btn btn-icon" id="csv-export">
                      <CSVLink
                        {...handleExportToCSV()}
                        filename={`${ownerName}'s ${projectName}_IFC-Files.csv`}
                        className="exportToCSV"
                        target="_blank"
                        title="Export as CSV"
                      >
                        <GrDocumentCsv />
                      </CSVLink>
                    </button>
                    {/* <div className="menu-btn-container position-relative">
                      <button
                        className="btn btn-icon menu-btn"
                        title="Menu"
                        onClick={handleMenuToggle}
                      >
                        <BiDotsVertical />
                      </button>
                      {menuOpen && (
                        <div
                          className="dropdown-menu"
                          ref={menuRef}
                          id="explorer-dropdown"
                        >
                          <div className="dropdown-item">
                            <CSVLink
                              {...handleExportToCSV()}
                              filename={`${ownerName}'s ${projectName}_IFC-Files.csv`}
                              className="exportToCSV"
                              target="_blank"
                            >
                              Export to CSV
                            </CSVLink>
                          </div>
                         
                        </div>
                      )}
                    </div> */}
                    {roleCheck.some((role) =>
                      ['Admin', 'Superadmin'].includes(role)
                    ) && (
                      <button
                        id="addbtn"
                        className="btn btn-primary add-btn"
                        title="Add"
                        onClick={addMenuToggle}
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>

                <div className="d-flex flex-row deleteButtonGroup">
                  {roleCheck.some((role) =>
                    ['Admin', 'Superadmin'].includes(role)
                  ) && (
                    <button
                      onClick={() => handleDeleteFiles(projectId)}
                      id="deleteUploadedfilesbtn"
                      className="btn btn-danger"
                      disabled={selectedFiles.length === 0} // Disable button when no files are selected
                    >
                      Delete Files
                    </button>
                  )}

                  <button
                    className="btn mr-2 deleteModeBtn"
                    onClick={() =>
                      setDeleteFolderMode(!deleteFolderMode)
                    }
                  >
                    {deleteFolderMode ? 'Cancel' : 'Delete Folders'}
                  </button>

                  {deleteFolderMode &&
                    selectedSubfolders.length > 0 && (
                      <button
                        className="btn deleteFoldersBtn"
                        onClick={deleteSelectedSubfolders}
                      >
                        Confirm Delete ({selectedSubfolders.length})
                      </button>
                    )}
                </div>

                <div className={`project-display ${viewType}`}>
                  <div className="project_subfolders">
                    <label> Folders: </label>
                    {explorerSubfolders.length > 0 ? (
                      <div className="subFolder-card d-flex flex-row ">
                        {explorerSubfolders.map(
                          (subfolder, index) => (
                            <div
                              key={index}
                              className={`subfolder-item ${
                                selectedSubfolders.includes(
                                  subfolder.folderPath
                                )
                                  ? 'selected'
                                  : ''
                              }`}
                              onClick={(e) => {
                                if (deleteFolderMode) {
                                  toggleSelectSubfolder(
                                    subfolder.folderPath
                                  );
                                  e.stopPropagation(); // Prevent navigation
                                } else {
                                  navigate(
                                    `/project-folder/${projectId}/data/project-explorer/subfolder/${encodeURIComponent(
                                      subfolder.folderPath
                                    )}`
                                  );
                                }
                              }}
                            >
                              <BsFillFolderFill className="subfolder-icon" />{' '}
                              <span className="subfolderName">
                                {' '}
                                {subfolder.folderName}{' '}
                              </span>
                              {deleteFolderMode && (
                                <input
                                  type="checkbox"
                                  checked={selectedSubfolders.includes(
                                    subfolder.folderPath
                                  )}
                                  readOnly
                                />
                              )}
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div>No Folders Found</div>
                    )}
                  </div>
                  {viewType === 'grid' ? (
                    <div>
                      <div className="grid-view">
                        {currentFiles.map((row, index) => (
                          <div
                            key={index}
                            className="grid-item"
                            onClick={() => handleRowClick(row)}
                          >
                            <div className="file-icon mb-2">
                              {typeof getFileIcon(row.fileName) ===
                              'string' ? (
                                <img
                                  src={getFileIcon(row.fileName)}
                                  alt="file icon"
                                  className="icon-img"
                                />
                              ) : (
                                getFileIcon(row.fileName)
                              )}
                            </div>
                            <div className="file-info">
                              <h5>
                                <strong> {row.fileName} </strong>
                              </h5>
                              <p>
                                <span className="fileOwner">
                                  {' '}
                                  File Owner:
                                </span>{' '}
                                <strong> {row.fileOwner} </strong>
                              </p>
                              <p>
                                <span className="lastModified">
                                  {' '}
                                  Last Modified:
                                </span>{' '}
                                <strong> {row.lastModified} </strong>
                              </p>
                              <p>
                                <span className="fileSize">
                                  {' '}
                                  File Size:
                                </span>{' '}
                                <strong> {row.fileSize} </strong>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pagination-controls d-flex justify-content-center mt-4 mb-5 flex-row">
                        <button
                          className="btn btn-tertiary"
                          disabled={currentPage === 1}
                          onClick={() =>
                            setCurrentPage(currentPage - 1)
                          }
                        >
                          <FaChevronCircleLeft color="#eb6314" />
                        </button>
                        <span className="mx-2">
                          {' '}
                          Page {currentPage} of {totalPages}{' '}
                        </span>
                        <button
                          className="btn btn-tertiary"
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            setCurrentPage(currentPage + 1)
                          }
                        >
                          <FaChevronCircleRight color="#eb6314" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <DataTable
                      className="dataTables_wrapperz mt-3"
                      id="explorer-table"
                      columns={noDeleteColumn}
                      data={explorerTable}
                      pagination={explorerTable.length >= 20}
                      paginationPerPage={20}
                      paginationRowsPerPageOptions={[10, 20, 30, 40]}
                      onRowClicked={handleRowClick}
                      pointerOnHover
                      dense
                      responsive
                      noDataComponent={
                        <div className="noData mt-4">
                          <div className="circle">
                            <MdFolderOff size={65} color="#9a9a9c" />
                          </div>
                          <div className="no-display-text mt-2">
                            No IFC files found.
                          </div>
                        </div>
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Upload Files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-3">
              <label htmlFor="projectFile" className="form-label">
                You can select more than one file at a time.
              </label>
              <input
                type="file"
                name="projectFiles"
                accept=".ifc,.nc1,.dxf,.dwg,.pdf"
                multiple
                className="form-control"
                id="projectFile"
                onChange={(e) => {
                  const filesArray = Array.from(e.target.files);
                  if (filesArray.length) {
                    setNewFiles(filesArray);
                  }
                }}
              />
              {newFiles && newFiles.length > 0 && (
                <div className="mt-2">
                  <h6>Selected Files:</h6>
                  <ul>
                    {newFiles.map((file, index) => (
                      <li style={{ listStyle: 'none' }} key={index}>
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="closeAdd"
            variant="secondary"
            onClick={() => setShowAddModal(false)}
          >
            Close
          </Button>
          <Button
            id="saveAdd"
            variant="primary"
            onClick={handleAddNewFile}
          >
            Upload
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showAddFolderModal}
        onHide={() => setShowAddFolderModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-3">
              <label htmlFor="projectFolder" className="form-label">
                Please enter a name for the new folder:
              </label>
              <input
                type="text"
                name="projectFolders"
                className="form-control"
                id="projectFolder"
                placeholder="Folder name"
                onChange={(e) => setNewFolder(e.target.value)}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="closeAdd"
            variant="secondary"
            onClick={() => setShowAddFolderModal(false)}
          >
            Close
          </Button>
          <Button
            id="saveAdd"
            variant="primary"
            onClick={handleAddNewFolder}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={isShareModalOpen}
        onHide={() => setIsShareModalOpen(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>File Sharing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-3">
              <div style={{ marginBottom: '15px' }}>
                <label
                  htmlFor="recipients"
                  style={{ marginBottom: '5px', display: 'block' }}
                >
                  Choose recipient(s):
                </label>
                <Select
                  id="recipients"
                  options={availableEmails}
                  isMulti
                  onChange={(selectedOptions) =>
                    setRecipients(selectedOptions)
                  }
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label
                  htmlFor="release-note"
                  style={{ marginBottom: '5px', display: 'block' }}
                >
                  Note/Message
                </label>
                <textarea
                  id="release-note"
                  placeholder="Write a note..."
                  value={releaseNote}
                  onChange={(e) => setReleaseNote(e.target.value)}
                  style={{
                    width: '100%',
                    height: '80px',
                    padding: '8px',
                    resize: 'none',
                    backgroundColor: '#FFF',
                    color: 'black',
                  }}
                ></textarea>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="closeAdd"
            variant="secondary"
            onClick={() => setIsShareModalOpen(false)}
          >
            Close
          </Button>
          <Button
            id="saveAdd"
            variant="primary"
            onClick={handleShare}
          >
            Share
          </Button>
        </Modal.Footer>
      </Modal>

      <Offcanvas
        show={showCanvas}
        onHide={handleCloseCanvas}
        placement="end"
        //backdrop="static"
        className="offcanvas"
        id="explorer-offcanvas"
      >
        <Offcanvas.Header className="offcanvas-head">
          <Offcanvas.Title>
            <div className="offcanvas-header d-flex justify-content-between align-items-center">
              <span className="file-title">
                {selectedRow ? selectedRow.fileName : 'File Details'}
              </span>
              <div className="offcanvas-button-group">
                {/* <button className="offcanvas-btn" title="Edit" onClick={handleEditClick}>
              <BiSolidEditAlt size={18} />
            </button> */}
                <button
                  className="offcanvas-btn"
                  title="Close"
                  onClick={handleCloseCanvas}
                >
                  <LiaTimesSolid size={18} />
                </button>
              </div>
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="offcanvas-body">
          <div className="offcanvas-button-group2 mb-3 flex-wrap">
            <label htmlFor="buttons"> </label>
            {selectedRow?.fileName?.endsWith('.frag') ? (
              <button
                className="btn ml-1 mr-auto"
                onClick={() =>
                  navigate(
                    `/ifc-viewer/${projectId}/${selectedRow.fileName}`,
                    {
                      state: {
                        fileUrl: selectedRow.fileName,
                      },
                    }
                  )
                }
                style={{ fontSize: '12px' }}
              >
                View Model
              </button>
            ) : (
              <button
                className="btn ml-1 mr-auto"
                onClick={() =>
                  navigate(
                    `/project-folder/pdf-viewer/${projectId}/${selectedRow.fileName}`
                  )
                }
                style={{ fontSize: '12px' }}
              >
                View PDF
              </button>
            )}
            {/* {roleCheck.some((role) =>
              ['Admin', 'Superadmin'].includes(role)
            ) && (
              <button
                className="btn offcanvas-action-btn"
                onClick={handleOpenShareModal}
              >
                <IoMdPersonAdd size={20} />
              </button>
            )} */}

            <button
              className="btn offcanvas-action-btn"
              onClick={() => downloadFile(selectedRow.fileName)}
            >
              <IoMdDownload size={20} />
            </button>

            {roleCheck.some((role) =>
              ['Admin', 'Superadmin'].includes(role)
            ) &&
              (selectedRow?.fileName?.endsWith('.frag') ||
                selectedRow?.fileName?.endsWith('.pdf')) && (
                <button
                  className="btn offcanvas-action-btn mr-1"
                  onClick={handleOpenQRCodeModal}
                >
                  <BsQrCode size={20} />
                </button>
              )}

            {/* <button className="btn " onClick={handleOCMenuToggle}><BiDotsVertical size={20}/></button>  
              {offcanvasMenuOpen && (
                        <div className="dropdown-menu" id="offcanvas-dropdown" ref={menuRef}>
                           <div className="dropdown-item"
                                onClick={() => handleOCMenuOptionClick('Add Tags')}>
                            Add Tags
                          </div>
                           <div className="dropdown-item"
                                onClick={() => handleOCMenuOptionClick('Checkin')}>
                            Checkin Files
                          </div>
                          <div className="dropdown-item"
                               onClick={() => handleOCMenuOptionClick('Checkout')}>
                            Checkout Files
                          </div>
                          <div className="dropdown-item"
                               onClick={() => handleOCMenuOptionClick('Export to Excel')}>
                            Export to Excel
                          </div>
                        </div>
                      )}             */}
          </div>
          {selectedRow && (
            <div style={{ fontSize: '12px' }}>
              <p>
                <strong>Details: </strong>
              </p>
              <label style={{ margin: '0', fontWeight: '300' }}>
                File Size:
              </label>
              <p>{selectedRow.fileSize}</p>
              <label style={{ margin: '0', fontWeight: '300' }}>
                Date Created:
              </label>
              <p>
                {selectedRow.created} by {selectedRow.fileOwner}
              </p>
              <label style={{ margin: '0', fontWeight: '300' }}>
                Last Modified:
              </label>
              <p>
                {selectedRow.lastModified} by {selectedRow.fileOwner}
              </p>
              <label style={{ margin: '0', fontWeight: '300' }}>
                Last Accessed:
              </label>
              <p>
                {selectedRow.lastAccessed} by {selectedRow.fileOwner}
              </p>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* GENERATE QR MODAL */}
      <Modal
        show={isGenerateQRCodeModalOpen}
        onHide={() => setIsGenerateQRCodeModalOpen(false)}
        centered
      >
        <Modal.Header>
          <Modal.Title> Share QR Code </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <QrCodeGenerator
            fileName={selectedRow?.fileName || ''}
            projectId={selectedRow?.projectId || ''}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="closeAdd"
            variant="secondary"
            onClick={() => setIsGenerateQRCodeModalOpen(false)}
          >
            Close
          </Button>
          {/* <Button id="saveAdd" variant="primary" onClick={QrCodeGenerator.downloadQRCode}>
            Download
          </Button> */}
        </Modal.Footer>
      </Modal>

      {/* 
        <div
        className="position-relative toast-block"
        style={{ minHeight: '240px' }}> 
        <ToastContainer
          className="p-3"
          position={toastPosition}
          style={{ zIndex: 1046, position: 'fixed', maxWidth: '300px' }}
        >
        <Toast show={showSuccessToast} onClose={showToast} style={{backgroundColor: "#fec19db8"}} delay={5000} autohide>
          <Toast.Header className='justify-content-between' style={{backgroundColor: "#ee8a50b8"}}>
            <small > File Shared Successfully </small>
          </Toast.Header>
          <Toast.Body style={{fontSize: '.785rem'}}>
          &quot;Your file(s) have been shared with the selected recipient(s). They will receive an email notification shortly.&quot;
          </Toast.Body>
        </Toast>
        </ToastContainer>
        </div> */}
      {/* 
      <ToastContainer className="p-3" position={toastPosition}>
          <Toast className="success-toast-container" show={showEditToast} onClose={closeSuccessEdit} delay={5000} autohide>
            <Toast.Header className='success-toast-header justify-content-between'>
           <span> File Renamed Successfully! </span>   
            </Toast.Header>
            <Toast.Body className="success-toast-body">
              Review the details, share with your team, and proceed with the discussion on the topic.
            </Toast.Body>
          </Toast>
        </ToastContainer> */}
      <ToastContainer
        className="p-3"
        position={toastPosition}
        style={{ zIndex: 1046, position: 'fixed', maxWidth: '300px' }}
      >
        <Toast
          show={showSuccessToast}
          onClose={showToast}
          style={{ backgroundColor: '#fec19db8' }}
          delay={5000}
          autohide
        >
          <Toast.Header
            className="justify-content-between"
            style={{ backgroundColor: '#ee8a50b8' }}
          >
            <small> Folder Created Successfully </small>
          </Toast.Header>
          <Toast.Body style={{ fontSize: '.785rem' }}>
            Your folder has been created and is ready to store project
            files.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}

export default ProjectExplorer;
