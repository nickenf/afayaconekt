import React, { useState } from 'react';


interface CheckInData {
  hospitalName: string;
  appointmentId?: number;
  checkInTime: string;
  location: string;
  purpose: string;
}

interface QRCheckInProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCheckIn: React.FC<QRCheckInProps> = ({ isOpen, onClose }) => {
  
  const [isScanning, setIsScanning] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);

  const simulateQRScan = () => {
    setIsScanning(true);
    
    // Simulate QR code scanning
    setTimeout(() => {
      const mockCheckInData: CheckInData = {
        hospitalName: 'Apollo Hospitals Chennai',
        appointmentId: 12345,
        checkInTime: new Date().toLocaleString(),
        location: 'Main Reception',
        purpose: 'Consultation Appointment'
      };
      
      setCheckInData(mockCheckInData);
      setCheckInSuccess(true);
      setIsScanning(false);
    }, 3000);
  };

  const resetCheckIn = () => {
    setCheckInSuccess(false);
    setCheckInData(null);
    setIsScanning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[70] md:items-center">
      <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-primary text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">QR Check-In</h2>
              <p className="text-secondary-light text-sm">Hospital visit check-in</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {!checkInSuccess ? (
            <div className="text-center space-y-6">
              {!isScanning ? (
                <>
                  <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-12 h-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11a6 6 0 11-12 0v-1m6 0V9a6.002 6.002 0 016 0v1m0 0v1a6 6 0 01-6 6 6 6 0 01-6-6v-1m6 0V9" />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-dark mb-2">Scan Hospital QR Code</h3>
                    <p className="text-gray-600 text-sm">
                      Point your camera at the QR code displayed at the hospital reception or appointment desk
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">📱 Quick Check-In Benefits</h4>
                    <ul className="text-blue-800 text-sm space-y-1 text-left">
                      <li>• Skip waiting lines</li>
                      <li>• Automatic appointment confirmation</li>
                      <li>• Real-time location tracking</li>
                      <li>• Instant notifications to family</li>
                    </ul>
                  </div>

                  <button
                    onClick={simulateQRScan}
                    className="w-full bg-secondary text-white py-4 px-6 rounded-lg font-medium hover:bg-secondary/90 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Scan QR Code
                  </button>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="animate-spin w-12 h-12 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-dark mb-2">Scanning QR Code...</h3>
                    <p className="text-gray-600 text-sm">
                      Please hold your device steady while we process the QR code
                    </p>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      📷 Make sure the QR code is clearly visible in the camera frame
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Check-In Successful!</h3>
                <p className="text-gray-600 text-sm">
                  You have been successfully checked in for your appointment
                </p>
              </div>

              {checkInData && (
                <div className="bg-green-50 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-green-900 mb-3">Check-In Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-800">Hospital:</span>
                      <span className="font-medium text-green-900">{checkInData.hospitalName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-800">Location:</span>
                      <span className="font-medium text-green-900">{checkInData.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-800">Purpose:</span>
                      <span className="font-medium text-green-900">{checkInData.purpose}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-800">Time:</span>
                      <span className="font-medium text-green-900">{checkInData.checkInTime}</span>
                    </div>
                    {checkInData.appointmentId && (
                      <div className="flex justify-between">
                        <span className="text-green-800">Appointment ID:</span>
                        <span className="font-medium text-green-900">#{checkInData.appointmentId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  View Appointment Details
                </button>
                <button className="w-full border border-primary text-primary py-3 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors">
                  Get Directions
                </button>
                <button
                  onClick={resetCheckIn}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Scan Another Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};