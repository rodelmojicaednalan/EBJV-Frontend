import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';
import rme_login_image from '../../assets/images/rme_login_image.png';
import axiosInstance from '../../../axiosInstance.js';
import Swal from 'sweetalert2'
import close from "../../assets/images/close.png";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState({value: "" , isShow : false});
    const navigate = useNavigate();

    const login = async (event) => {
        event.preventDefault();
        try {
            const response = await axiosInstance.post('/login', {
                username,
                password,
            });

            const { user, accessToken, refreshToken, roleName } = response.data;

            document.cookie = `role_name=${roleName}; Path=/;`;
            document.cookie = `accessToken=${accessToken}; Path=/;`;
            document.cookie = `refreshToken=${refreshToken}; Path=/; `;

            localStorage.setItem('loginSuccess', 'true');
            if (roleName === 'Admin') {
                // console.log(user, accessToken, refreshToken, roleName);
                navigate('/userlist');
            } else {
                navigate('/projects');
            }
        } catch (error) {
            console.error('Login error:', error);

            setError({
                value : "Invalid login ,Please check your credentials ",
                isShow : true 
            });
            // Swal.fire({
            //     title: 'Invalid username or password!',
            //     text: 'Please check your credentials',
            //     imageUrl: close,
            //     imageWidth: 100,
            //     imageHeight: 100,
            //     confirmButtonText: "OK",
            //     confirmButtonColor: "#EC221F",
            //     customClass: {
            //         confirmButton: "custom-error-confirm-button",
            //         title: "custom-swal-title",
            //     },
            // })
            return;
        }
    };

    // useEffect(() => {
    //     const fetchBranches = async () => {
    //         try {
    //             const response = await axiosInstance.get('/branchLogin');
    //             setBranches(response.data);
    //         } catch (error) {
    //             console.error('Error fetching branches:', error);
    //         }
    //     };

    //     fetchBranches();
    // }, []);




    return (
        <div className="d-flex align-items-center justify-content-center custom-login">
            <div className="row">
                <div className="col-md-6 d-flex flex-column align-items-center justify-content-center custom-col">
                    <div className="header-title mt-5">
                        <h1>EBJV Construction <br></br> Modelling Portal</h1>
                        <br />

                    </div>
                    <div className='bg-image'>
                        <img className='img-fluid login_image' src={rme_login_image} alt="Login" />
                    </div>
                </div>

                <div className="col-md-6 d-flex align-items-center justify-content-center">
                    <div className="card p-4 login-form-wrap" style={{ width: '450px' }}>
                        <h2 className="text-left mb-4">Login</h2>
                        {error.value !== "" && error.isShow && (
                            <div className="alert alert-danger">
                                {error.value}
                                <div
                                    className="close-quick-alert"
                                    onClick={() => setError({ ...error, isShow: false })}
                                ></div>
                            </div>
                        )}
                        <form onSubmit={login}>

                            <label htmlFor="username">Username</label><br />
                            <div className="form-group mb-3 ">
                                <input
                                    type="text"
                                    id="username"
                                    className="form-control-lg w-100 mb-2"
                                    value={username}
                                    // placeholder="Username"
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                
                            </div>
                            <label htmlFor="password">Password</label><br />
                            <div className="form-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="form-control-lg w-100"
                                    value={password}
                                    // placeholder="Password"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="form-group group-field-password">
                                <input
                                    type="checkbox"
                                    id="showPassword"
                                    checked={showPassword}
                                    onChange={() => setShowPassword(!showPassword)}
                                /> &nbsp; 
                                <label htmlFor="showPassword">Show Password</label>
                                <a style={{cursor: "pointer"}} className='float-end' onClick={()=>navigate("/forgot-password")}>Forgot Password?</a>
                            </div>
                            <div className='d-flex'>
                                {/* <div className="d-flex mb-3 mr-3">
                                    <h6>
                                        <select
                                            id="branch"
                                            className="form-control-sm"
                                            value={selectedBranch}
                                            onChange={(e) => setSelectedBranch(e.target.value)}
                                        >
                                            <option value="">Branch</option>
                                            {branches.map((branch) => (
                                                <option key={branch.id} value={branch.branch_name}>
                                                    {branch.branch_name}
                                                </option>
                                            ))}
                                        </select>
                                    </h6>
                                </div> */}
                            </div>
                            <div className='d-flex justify-content-left mt-1'>
                                <button type="submit" className="mt-2 custom-btn">Login</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
