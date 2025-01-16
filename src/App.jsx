// Layout.js
import React from 'react';
import {BrowserRouter, Routes, Route, useLocation, Navigate, useParams  } from 'react-router-dom';
import Login from './components/Login/Login';
import SideBar from './components/SideBar/SideBar';
import UsersList from './components/AdminPages/UsersList/UsersLIst';

import Projects from './components/AdminPages/Projects/Projects';
import AddProject from './components/AdminPages/Projects/AddProject';
import EditProject from './components/AdminPages/Projects/EditProjects';
import ProjectFolder from './components/AdminPages/Projects/ProjectFolder';

import ProjectViews from './components/AdminPages/Projects/ProjectFolderPages/ProjectViews';
import ProjectTopics from './components/AdminPages/Projects/ProjectFolderPages/ProjectTopics';
import ProjectToDo from './components/AdminPages/Projects/ProjectFolderPages/ProjectToDo';
import ProjectReleases from './components/AdminPages/Projects/ProjectFolderPages/ProjectReleases';
import ProjectExplorer from './components/AdminPages/Projects/ProjectFolderPages/ProjectExplorer';
import ProjectContributors from './components/AdminPages/Projects/ProjectFolderPages/ProjectContributors';
import ProjectActivity from './components/AdminPages/Projects/ProjectFolderPages/ProjectActivity';

import ProjectSettings from './components/AdminPages/Projects/ProjectFolderPages/ProjectSettingsPages/EditProject';
import TopicSettings from './components/AdminPages/Projects/ProjectFolderPages/ProjectSettingsPages/TopicSettings';
import UnitSettings from './components/AdminPages/Projects/ProjectFolderPages/ProjectSettingsPages/UnitSettings';

import StaffLogs from './components/AdminPages/StaffLogs/StaffLogs';
import AddNewUser from './components/AdminPages/UsersList/AddNewUser';
import EditUser from './components/AdminPages/UsersList/EditUser';
import UserRoleManagement from './components/AdminPages/UserManagement/UsersManagement';
import EditUserRole from './components/AdminPages/UserManagement/EditUserRole';
import AddNewRole from './components/AdminPages/UserManagement/AddNewRole';
import MyProfile from './components/AdminPages/MyProfile/MyProfile';
import ProtectedRoute from './components/PrivateRoute/PrivateRoute';
import { AuthContextProvider } from './components/Authentication/authContext';
import {getCookie} from './components/Authentication/getCookie';
import { LoaderProvider } from './components/Loaders/LoaderContext';
import ForgotPassword from './components/PasswordReset/ForgotPassword';
import ResetPassword from './components/PasswordReset/ResetPassword';
import CheckEmail from './components/PasswordReset/CheckEmail';

import IfcUploadPage from './components/AdminPages/IfcUploadPage/IfcUploadPage';
import IfcViewer from './components/AdminPages/IfcViewer/IfcViewer';
import ProjectMap from './components/AdminPages/Projects/ProjectFolderPages/ProjectMap';

import QrCodeGenerator from './QrCodeGenerator';
function Layout() {
  const location = useLocation();
  const userRole = getCookie('role_name');

  const isSegmentCorrect = (url, pathNameURL) => {
    const regex = new RegExp(`/${pathNameURL}/[a-zA-Z0-9]+$/`);
    return regex.test(url);
  };
  
  // Function to check if the route should hide the sidebar
  const shouldHideSidebar = () => {
    const noSidebarPaths = ['/', '/not-authorized', '/forgot-password', '/open-email'];
  
    // Check static no-sidebar paths
    if (noSidebarPaths.includes(location.pathname)) return true;
  
    // Check if the route matches project-folder or ifc-viewer
    const isProjectFolder = /^\/project-folder\/[a-zA-Z0-9]+/.test(location.pathname);
    const isIfcViewer = /^\/ifc-viewer\/[a-zA-Z0-9]+\/[a-zA-Z0-9._-]+$/.test(location.pathname);

    return isProjectFolder || isIfcViewer;
  };
//  console.log(location);
  return (
    <LoaderProvider>
    <AuthContextProvider>
    <>
       {!shouldHideSidebar() && <SideBar role={userRole} />}
      <Routes>
        <Route path="/qr-code-generator" element={<QrCodeGenerator/>} />
        <Route path="/" element={<Login />} />
        <Route path="/userlist" element={<ProtectedRoute element={<UsersList />} allowedRoles={['Admin']} />} />
        <Route path="/uploaded-ifc-file" element={<ProtectedRoute element={<IfcUploadPage />} allowedRoles={['Admin']} />} />
        <Route path="/ifc-viewer/:projectId/:fileName"element={<IfcViewer/>}/>
        {/* <Route path="/ifc-viewer/:projectId/:fileName"element={<ProtectedRoute element={<IfcViewer />} allowedRoles={['Admin', 'Client']} /> }/> */}
        <Route path="/forgot-password"  element={<ForgotPassword />}/>
        <Route path="/reset-password/:passwordToken" name="reset-password"  element={<ResetPassword />}/>
        <Route path="/open-email"  element={<CheckEmail />}/>
        <Route path="/user-management" element={<ProtectedRoute element={<UserRoleManagement />} allowedRoles={['Admin']} />} />
        <Route path="/staff-logs" element={<ProtectedRoute element={<StaffLogs />} allowedRoles={['Admin',]} />} />

        <Route path="/projects" element={<ProtectedRoute element={<Projects />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/add-project" element={<ProtectedRoute element={<AddProject />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/edit-project/:projectId" element={<ProtectedRoute element={<EditProject />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/project-folder/:projectId" element={<ProtectedRoute element={<ProjectFolder />} allowedRoles={['Admin', 'Client']} />} />

        <Route path="/project-folder/:projectId/data/project-explorer" element={<ProtectedRoute element={<ProjectExplorer />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/project-folder/:projectId/data/project-views" element={<ProtectedRoute element={<ProjectViews />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/project-folder/:projectId/data/project-releases" element={<ProtectedRoute element={<ProjectReleases />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/project-folder/:projectId/project-activity" element={<ProtectedRoute element={<ProjectActivity />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/project-folder/:projectId/project-topics" element={<ProtectedRoute element={<ProjectTopics />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/project-folder/:projectId/project-ToDos" element={<ProtectedRoute element={<ProjectToDo />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/project-folder/:projectId/project-contributors" element={<ProtectedRoute element={<ProjectContributors />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/project-folder/:projectId/settings/edit-project" element={<ProtectedRoute element={<ProjectSettings />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/project-folder/:projectId/settings/topic-settings" element={<ProtectedRoute element={<TopicSettings />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/project-folder/:projectId/settings/unit-settings" element={<ProtectedRoute element={<UnitSettings />} allowedRoles={['Admin', 'Client']} />} />
 
        <Route path="/add-new-user" element={<ProtectedRoute element={<AddNewUser />} allowedRoles={['Admin']} />} />
        <Route path="/edit-user/:userId" element={<ProtectedRoute element={<EditUser />} allowedRoles={['Admin']} />} />
        <Route path="/edit-user-role/:roleId" element={<ProtectedRoute element={<EditUserRole />} allowedRoles={['Admin']} />} />
        <Route path="/add-new-role" element={<ProtectedRoute element={<AddNewRole />} allowedRoles={['Admin']} />} />

        <Route path="/my-profile" element={<ProtectedRoute element={<MyProfile />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="map" element={ProjectMap}/>
      </Routes>
    </>
    </AuthContextProvider>
    </LoaderProvider>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </div>
  );
}

export default App;
