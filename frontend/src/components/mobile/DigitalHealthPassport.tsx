import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface MedicalInfo {
  bloodType: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
}

interface DigitalHealthPassportProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalHealthPassport: React.FC<DigitalHealthPassportProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'qr'>('overview');

  // Mock medical data - in production, this would come from the backend
  const medicalInfo: MedicalInfo = {
    bloodType: 'O+',
    allergies: ['Penicillin', 'Shellfish'],
    medications: ['Lisinopril 10mg', 'Metformin 500mg'],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    insurance: {
      provider: 'International Health Insurance',
      policyNumber: 'IHI-2024-789456',
      groupNumber: 'GRP-001'
    }
  };

  const generateQRCode = () => {
    // In production, this would generate a real QR code with encrypted medical data
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="white"/><rect x="20" y="20" width="160" height="160" fill="none" stroke="black" stroke-width="2"/><text x="100" y="100" text-anchor="middle" font-size="12" fill="black">QR Code</text><text x="100" y="120" text-anchor="middle" font-size="8" fill="black">Medical ID</text></svg>`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[70] md:items-center">
      <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden md:max-h-[80vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Digital Health Passport</h2>
              <p className="text-primary-light text-sm">Secure medical ID</p>
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

          {/* Patient Info */}
          {user && (
            <div className="mt-4 flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-lg font-bold mr-3">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                <p className="text-sm opacity-90">{user.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'medical', label: 'Medical', icon: '💊' },
              { id: 'qr', label: 'QR Code', icon: '📱' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="block">{tab.icon}</span>
                <span className="block mt-1">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-red-800 font-semibold text-sm">Blood Type</p>
                  <p className="text-red-900 text-lg font-bold">{medicalInfo.bloodType}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-blue-800 font-semibold text-sm">Allergies</p>
                  <p className="text-blue-900 text-sm">{medicalInfo.allergies.length} known</p>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Critical Alerts</h4>
                <ul className="text-yellow-800 text-sm space-y-1">
                  {medicalInfo.allergies.map((allergy, index) => (
                    <li key={index}>• Allergic to {allergy}</li>
                  ))}
                </ul>
              </div>

            </div>
          )}

          {activeTab === 'medical' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-dark mb-3">Current Medications</h4>
                <div className="space-y-2">
                  {medicalInfo.medications.map((medication, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-900 font-medium">{medication}</span>
                      <span className="text-blue-700 text-sm">Daily</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-dark mb-3">Medical Conditions</h4>
                <div className="space-y-2">
                  {medicalInfo.conditions.map((condition, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-900 font-medium">{condition}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-dark mb-3">Allergies</h4>
                <div className="space-y-2">
                  {medicalInfo.allergies.map((allergy, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg">
                      <span className="text-red-900 font-medium">⚠️ {allergy}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {activeTab === 'qr' && (
            <div className="text-center space-y-6">
              <div>
                <h4 className="font-semibold text-dark mb-3">Medical QR Code</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Show this QR code to medical professionals for instant access to your critical medical information
                </p>
              </div>

              <div className="flex justify-center">
                <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                  <img
                    src={generateQRCode()}
                    alt="Medical QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">📱 How to Use</h5>
                <ul className="text-blue-800 text-sm space-y-1 text-left">
                  <li>• Show QR code to medical staff</li>
                  <li>• Provides instant access to critical info</li>
                  <li>• Works offline in emergencies</li>
                  <li>• Encrypted and secure</li>
                </ul>
              </div>

              <div className="space-y-2">
                <button className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Share QR Code
                </button>
                <button className="w-full border border-primary text-primary py-2 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors">
                  Download QR Code
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</span>
            <button className="text-primary hover:text-primary/80 font-medium">
              Update Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};