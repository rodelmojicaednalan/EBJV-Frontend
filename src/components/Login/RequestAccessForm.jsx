// Import necessary dependencies
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Access.css';
import axiosInstance from '../../../axiosInstance';

import { Modal, Button, ToastContainer, Toast } from 'react-bootstrap';

const RequestAccessForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [sex, setSex] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [reason, setReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    localStorage.removeItem('originalUrl'); // Clear stored URL
  }, []);

  const handleSubmitRequestForm = async () => {
    try {
      await axiosInstance.post("/request-access", {
        name,
        sex,
        email,
        contact,
        reason,
      });
      setToastMessage("Request sent successfully. Redirecting...");
      setIsError(false);
      setShowToast(true);
      setTimeout(() => navigate("/wait-instructions"), 3000);
    } catch (error) {
      setToastMessage("Oops! There seems to be an error. Please try again!");
      setIsError(true);
      setShowToast(true);
      console.log(error);
    }
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);
  const handleModalConfirm = () => {
    setShowModal(false);
    handleSubmitRequestForm();
  };

  return (
    <div className="request-form-page">
      <form onSubmit={handleConfirmSubmit}>
        <div className="request-access-form">
          <div className="request-form-header">
            <h4 className="form-title mt-3">Request Access Form</h4>
          </div>
          <div className="request-access-form-body">
            <div className="form-body">
              <div className="form-group-multiple mb-3">
                <div className="form-group-item">
                  <label htmlFor="requestName">Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="requestName"
                    placeholder="John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group-item">
                  <label htmlFor="formSex">Sex:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="formSex"
                    placeholder="Male"
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="formEmailAddress">Email address:</label>
                <input
                  type="email"
                  className="form-control"
                  id="emailAddress"
                  placeholder="johndoe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="formContact">Contact Number:</label>
                <input
                  type="text"
                  className="form-control"
                  id="formContact"
                  placeholder="0491 570 159"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="formReason">Reason for requesting access:</label>
                <textarea
                  className="form-control"
                  id="formReason"
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
          </div>
          <div className="access-btn-group">
            <div className="access-btn-group-item">
              <button type="submit" className="btn btn-primary login-btn">
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>
      <div className="access-request-page-footer mt-5">
        <p>© EBJV</p>
      </div>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>Please check the details before you submit.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Review
          </Button>
          <Button variant="primary" onClick={handleModalConfirm}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <ToastContainer className="p-3" position="top-end">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          style={{ backgroundColor: isError ? "#b04a4a" : "#4ab063", color: "#fff" }}
          delay={3000}
          autohide
        >
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default RequestAccessForm;
