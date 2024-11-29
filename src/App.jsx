// Layout.js
import React from 'react';
import {BrowserRouter, Routes, Route, useLocation, Navigate  } from 'react-router-dom';
import Login from './components/Login/Login';
import SideBar from './components/SideBar/SideBar';
import UsersList from './components/AdminPages/UsersList/UsersLIst';

import Projects from './components/AdminPages/Projects/Projects';
import AddProject from './components/AdminPages/Projects/AddProject';
import EditProject from './components/AdminPages/Projects/EditProjects';

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


function Layout() {
  const location = useLocation();
  const userRole = getCookie('role_name');
  const noSidebarPaths = ['/', '/not-authorized'];

const  isSegmentCorrect = (url , pathNameURL) => {

    const url_check = pathNameURL;
    const regex = new RegExp(`/${url_check}/[a-zA-Z0-9]+$`);
    return regex.test(url);

  }

  // Check if the current path should hide the sidebar
  const shouldHideSidebar = noSidebarPaths.includes(location.pathname);
//  console.log(location);
  return (
    <LoaderProvider>
    <AuthContextProvider>
    <>
        {!shouldHideSidebar && location.pathname !== '/' && location.pathname !== '/forgot-password' && !isSegmentCorrect( location.pathname , "reset-password" ) && location.pathname !== '/open-email' && <SideBar role={userRole} />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/userlist" element={<ProtectedRoute element={<UsersList />} allowedRoles={['Admin']} />} />
        <Route path="/uploaded-ifc-file" element={<ProtectedRoute element={<IfcUploadPage />} allowedRoles={['Admin']} />} />
        <Route path="/Ifc-viewer" element={<ProtectedRoute element={<IfcViewer />} allowedRoles={['Admin']} />} />
        <Route path="/forgot-password"  element={<ForgotPassword />}/>
        <Route path="/reset-password/:passwordToken" name="reset-password"  element={<ResetPassword />}/>
        <Route path="/open-email"  element={<CheckEmail />}/>
        <Route path="/user-management" element={<ProtectedRoute element={<UserRoleManagement />} allowedRoles={['Admin']} />} />
        <Route path="/staff-logs" element={<ProtectedRoute element={<StaffLogs />} allowedRoles={['Admin',]} />} />

        <Route path="/projects" element={<ProtectedRoute element={<Projects />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/add-project" element={<ProtectedRoute element={<AddProject />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/edit-project/:projectId" element={<ProtectedRoute element={<EditProject />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="/add-new-user" element={<ProtectedRoute element={<AddNewUser />} allowedRoles={['Admin']} />} />
        <Route path="/edit-user/:userId" element={<ProtectedRoute element={<EditUser />} allowedRoles={['Admin']} />} />
        <Route path="/edit-user-role/:roleId" element={<ProtectedRoute element={<EditUserRole />} allowedRoles={['Admin']} />} />
        <Route path="/add-new-role" element={<ProtectedRoute element={<AddNewRole />} allowedRoles={['Admin']} />} />

        <Route path="/my-profile" element={<ProtectedRoute element={<MyProfile />} allowedRoles={['Admin', 'Client']} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
