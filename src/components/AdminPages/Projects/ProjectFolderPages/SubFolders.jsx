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
import { RiAddLargeFill, RiEdit2Fill } from 'react-icons/ri';
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
  Breadcrumb,
} from 'react-bootstrap';
import ProjectSidebar from '../ProjectFolderSidebar';
import SidebarOffcanvas from '../MobileSidebar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import useWindowWidth from './windowWidthHook.jsx';
import JSZip from 'jszip';

// import useDrivePicker from 'react-google-drive-picker';

// import * as htmlToImage from "html-to-image";
// import QRCode from 'react-qr-code';
// import '../../../../QRCodeStyle.css'
import QrCodeGenerator from '../../../../QrCodeGenerator.jsx';
import * as WEBIFC from 'web-ifc';
import * as BUI from '@thatopen/ui';
import * as OBC from '@thatopen/components';
import { FragmentsGroup } from '@thatopen/fragments';

function SubFolder() {
  // const [openPicker, data, authResponse] = useDrivePicker();

  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const { projectId, folderName } = useParams();
  const decodedFolderName = decodeURIComponent(folderName);
  const formattedFolderName = decodedFolderName.split('/').pop();
  const extractedRootFolder = decodedFolderName.split('/')[0];
  // console.log(extractedRootFolder);
  const [projectName, setProjectName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedprojectId, setSelectedprojectId] = useState(null);
  const [ownerName, setOwnerName] = useState('');
  const [currentFolder, setCurrentFolder] = useState(null);

  const [viewType, setViewType] = useState('list');
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [offcanvasMenuOpen, setOffcanvasMenuOpen] = useState(false);

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

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

  const [explorerSubfolders, setExplorerSubfolders] = useState([]);
  const [explorerTable, setExplorerTable] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  console.table(selectedFiles);
  const [currentDataTablePage, setCurrentDataTablePage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const handleSelectAll = () => {
    const startIndex = (currentDataTablePage - 1) * rowsPerPage;
    const endIndex = Math.min(
      startIndex + rowsPerPage,
      filteredData.length
    );
    const currentPageFiles = filteredData
      .slice(startIndex, endIndex)
      .map((file) => file.fileName);

    setSelectedFiles((prevSelected) => {
      const newSelected = new Set(prevSelected);

      // Check if all current page items are selected
      const allCurrentPageSelected = currentPageFiles.every(
        (fileName) => newSelected.has(fileName)
      );

      if (allCurrentPageSelected) {
        // If all current page items are selected, unselect them
        currentPageFiles.forEach((fileName) =>
          newSelected.delete(fileName)
        );
      } else {
        // Select all current page items
        currentPageFiles.forEach((fileName) =>
          newSelected.add(fileName)
        );
      }

      return newSelected;
    });

    setSelectAll(!selectAll);
  };

  // Update selectAll state when page changes or rows per page changes
  useEffect(() => {
    const startIndex = (currentDataTablePage - 1) * rowsPerPage;
    const endIndex = Math.min(
      startIndex + rowsPerPage,
      filteredData.length
    );
    const currentPageFiles = filteredData
      .slice(startIndex, endIndex)
      .map((file) => file.fileName);

    // Check if all current page items are selected
    const allCurrentPageSelected = currentPageFiles.every(
      (fileName) => selectedFiles.has(fileName)
    );
    setSelectAll(allCurrentPageSelected);
  }, [
    currentDataTablePage,
    rowsPerPage,
    filteredData,
    selectedFiles,
  ]);

  const navigate = useNavigate();

  const [showCanvas, setShowCanvas] = useState(false);
  const handleCloseCanvas = () => setShowCanvas(false);
  const handleShowCanvas = () => setShowCanvas(true);

  const [selectedRow, setSelectedRow] = useState(null); // State to hold the selected row details

  // Handle row click
  const handleRowClick = (row) => {
    setSelectedRow(row); // Set the clicked row's data
    handleShowCanvas(); // Show the Offcanvas
  };

  // Fetch project details and populate fields
  const fetchProjectDetails = async () => {
    try {
      const response = await axiosInstance.get(
        `/project/${projectId}`
      );
      const { id, project_name, owner, folderTree } = response.data;

      setProjectName(project_name);
      setOwnerName(`${owner.first_name} ${owner.last_name}`);

      // 🔍 Function to find a folder by name in the tree
      const findFolderInTree = (folderNode, targetName) => {
        if (!folderNode) return null;

        // If this is the target folder, return it
        if (folderNode.folderName === targetName) return folderNode;

        // Recursively search in subfolders
        if (
          folderNode.subfolders &&
          folderNode.subfolders.length > 0
        ) {
          for (let subfolder of folderNode.subfolders) {
            const found = findFolderInTree(subfolder, targetName);
            if (found) return found;
          }
        }

        return null;
      };

      // 🔍 Locate the specific folder
      const targetFolder = findFolderInTree(
        folderTree,
        formattedFolderName
      );

      // ✅ Extract files from the found folder
      const extractFiles = (folderNode) => {
        if (
          !folderNode ||
          !folderNode.files ||
          folderNode.files.length === 0
        )
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

      // ✅ Extract subfolders of the found folder (if needed)
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

      const filesInTargetFolder = extractFiles(targetFolder);
      const subfoldersInTargetFolder = extractDirectSubfolders(
        folderTree,
        folderTree.folderName
      );

      setExplorerSubfolders(subfoldersInTargetFolder);
      setExplorerTable(filesInTargetFolder);
      setFilteredData(filesInTargetFolder);

      // console.log(`Fetching files from folder: ${formattedFolderName}`);
      // console.table(filesInTargetFolder);
      // console.table(subfoldersInTargetFolder);
    } catch (error) {
      console.error('Error fetching project details:', error);
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
  }, [projectId, refreshKey, formattedFolderName]);

  useEffect(() => {
    const results = explorerTable.filter((file) =>
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(results);
  }, [searchTerm, explorerTable, selectedprojectId]);

  // Define columns for the table
  const explorerColumn = [
    // {
    //   name: ' ',
    //   cell: (row, index) => (
    //     <label className="del-checkbox">
    //       <input
    //         type="checkbox"
    //         onChange={(e) => {
    //           const checked = e.target.checked;
    //           setSelectedFiles((prev) =>
    //             checked
    //               ? [...prev, index]
    //               : prev.filter((i) => i !== index)
    //           );
    //         }}
    //         checked={selectedFiles.includes(index)}
    //       />
    //       <div className="del-checkmark" />
    //     </label>
    //   ),
    //   ignoreRowClick: true,
    //   allowOverflow: true,
    //   button: true,
    // },
    {
      name: (
        <label className="del-checkbox">
          <input
            type="checkbox"
            onChange={handleSelectAll}
            checked={selectAll}
          />
          <div className="del-checkmark" />
        </label>
      ),
      cell: (row) => (
        <label className="del-checkbox">
          <input
            type="checkbox"
            onChange={(e) => {
              const checked = e.target.checked;
              setSelectedFiles((prev) => {
                const newSet = new Set(prev);
                checked
                  ? newSet.add(row.fileName)
                  : newSet.delete(row.fileName);
                return newSet;
              });
            }}
            checked={selectedFiles.has(row.fileName)}
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
  const [newFiles, setNewFiles] = useState([]);
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
          formData.append('project_file', file);
        });

        await axiosInstance.post(
          `/upload-pdf-files/${projectId}/${encodeURIComponent(
            formattedFolderName
          )}`,
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
        `/upload-ifc-files/${projectId}/${encodeURIComponent(
          formattedFolderName
        )}`,
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

  const [newFolderName, setNewFolderName] = useState(null);
  const [openFolderRenamer, setOpenFolderRenamer] = useState(false);

  const handleRenameFolder = async () => {
    try {
      await axiosInstance.post(
        `/rename-folder/${projectId}/${encodeURIComponent(
          decodedFolderName
        )}/${encodeURIComponent(newFolderName)}`
      );

      Swal.fire({
        title: 'Success!',
        text: 'Folder has been renamed successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        // Navigate only after the user clicks "OK"
        navigate(
          `/project-folder/${projectId}/data/project-explorer`
        );
      });

      setOpenFolderRenamer(false);
      setRefreshKey((prevKey) => prevKey + 1);
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text:
          error.response?.data?.error || 'Failed to rename folder.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
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
        const filesToDelete = explorerTable.filter((file) =>
          selectedFiles.has(file.fileName)
        );

        for (const file of filesToDelete) {
          await axiosInstance.delete(
            `/delete-file/${projectId}/${file.fileName}`
          );
        }

        setExplorerTable((prev) =>
          prev.filter((file) => !selectedFiles.has(file.fileName))
        );
        setSelectedFiles(new Set());
        Swal.fire({
          // title: 'Deleted!',
          // text: 'Selected files have been deleted.',
          icon: 'success',
          // timerProgressBar: true,
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            htmlContainer: 'custom-swal-text',
          },
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

  // Bulk download handler (zip all selected files)
  const handleBulkDownload = async () => {
    if (!selectedFiles.size) return;
    const zip = new JSZip();
    const fileFetches = Array.from(selectedFiles).map(async (fileName) => {
      try {
        // If .frag, try to get the .ifc as in downloadFile
        let downloadTarget = fileName;
        if (fileName.endsWith('.frag')) {
          const response = await axiosInstance.get(`/project/${projectId}`);
          const folderTree = response.data.folderTree;
          const expectedIfcName = fileName.replace(/^[0-9]+-/, '').replace('.frag', '.ifc');
          const findMatchingIfcFile = (folderNode, expectedName) => {
            if (!folderNode.files || folderNode.files.length === 0) return null;
            return folderNode.files.find((f) => f.fileName === expectedName) ? expectedName : null;
          };
          const foundIfcFile = findMatchingIfcFile(folderTree, expectedIfcName);
          if (foundIfcFile) downloadTarget = foundIfcFile;
        }
        const res = await axiosInstance.get(`/download-file/${projectId}/${downloadTarget}`, { responseType: 'blob' });
        zip.file(downloadTarget, res.data);
      } catch (error) {
        // Optionally: handle error for this file
         console.error("Failed to zip. Please try again", error);
      }
    });
    Swal.fire({
      title: 'Preparing zip...',
      text: 'Please wait while files are being fetched.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    await Promise.all(fileFetches);
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const today = new Date().toISOString().split('T')[0];
    saveAs(zipBlob, `${projectName}_files_${today}.zip`);
    Swal.close();
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
    console.log(fileName);
    Swal.fire({
      title: 'Fetching file...',
      text: 'Please wait.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const response = await axiosInstance.get(
        `/download-file/${projectId}/${fileName}`,
        {
          responseType: 'blob',
        }
      );
      const blob = new Blob([response.data]);
      saveAs(blob, fileName);
      Swal.fire(
        'Success!',
        `${fileName} has been downloaded`,
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
                  onClick={() => setShowAddModal(true)}
                  // onClick={addMenuToggle}
                >
                  <RiAddLargeFill />
                </button>
                {isAddMenuOpen && (
                  <div className="addFile-dropdown" ref={menuRef}>
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
                    <Breadcrumb>
                      <Breadcrumb.Item
                        className="d-flex flex-row align-items-center"
                        onClick={() =>
                          navigate(
                            `/project-folder/${projectId}/data/project-explorer`
                          )
                        }
                      >
                        {' '}
                        <FaChevronLeft /> {projectName}
                      </Breadcrumb.Item>
                      <Breadcrumb.Item
                        active
                        className="d-flex align-items-center"
                      >
                        {formattedFolderName}{' '}
                        <RiEdit2Fill
                          className="ml-2"
                          size={18}
                          onClick={() => setOpenFolderRenamer(true)}
                        />
                      </Breadcrumb.Item>
                    </Breadcrumb>
                  </div>
                  <div className="search-div">
                    <input
                      // id="search-bar"
                      type="text"
                      placeholder="Enter a file name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                    {formattedFolderName !== 'Assemblies' &&
                      roleCheck.some((role) =>
                        ['Admin', 'Superadmin'].includes(role)
                      ) && (
                        <button
                          className="btn btn-icon"
                          id="batchEdit-pdf"
                          title="Edit Multiple PDFs"
                          onClick={() =>
                            navigate(
                              `/project-folder/multi-pdf-editor/${projectId}/${encodeURIComponent(
                                decodedFolderName
                              )}`
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
                {roleCheck.some((role) =>
                  ['Admin', 'Superadmin'].includes(role)
                ) && (
                  <button
                    onClick={() => handleDeleteFiles(projectId)}
                    id="deleteUploadedfilesbtn"
                    className="btn btn-danger"
                    disabled={selectedFiles.size === 0} // Disable button when no files are selected
                  >
                    Delete Files
                  </button>
                )}
                <button
                  className="btn btn-secondary ml-2"
                  onClick={handleBulkDownload}
                  disabled={selectedFiles.size === 0}
                >
                  Download Selected
                </button>

                <div className={`project-display ${viewType}`}>
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
                          <FaChevronCircleLeft />
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
                          <FaChevronCircleRight />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <DataTable
                      className="dataTables_wrapperz mt-3"
                      id="explorer-table"
                      columns={noDeleteColumn}
                      data={filteredData}
                      pagination={filteredData.length >= 10}
                      paginationPerPage={rowsPerPage}
                      paginationRowsPerPageOptions={[10, 20, 30, 40]}
                      onChangePage={(page) =>
                        setCurrentDataTablePage(page)
                      }
                      onChangeRowsPerPage={(currentRowsPerPage) => {
                        setRowsPerPage(currentRowsPerPage);
                        setCurrentDataTablePage(1); // Reset to first page when changing rows per page
                      }}
                      onRowClicked={handleRowClick}
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
                  setNewFiles(filesArray);
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
                    `/project-folder/pdf-viewer/${projectId}/${formattedFolderName}/${selectedRow.fileName}`
                  )
                }
                style={{ fontSize: '12px' }}
              >
                View PDF
              </button>
            )}

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
        <Modal.Header closeButton>
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

      {/* Folder Rename Modal */}
      <Modal
        show={openFolderRenamer}
        onHide={() => setOpenFolderRenamer(false)}
        centered
      >
        <Modal.Header>
          <Modal.Title> Rename Folder </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            id="folderName"
            placeholder="Enter new folder name..."
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            id="closeAdd"
            variant="secondary"
            onClick={() => setOpenFolderRenamer(false)}
          >
            Close
          </Button>
          <Button
            id="saveAdd"
            variant="primary"
            onClick={handleRenameFolder}
          >
            Rename
          </Button>
        </Modal.Footer>
      </Modal>

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

export default SubFolder;
