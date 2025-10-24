import React, { useState, useEffect } from 'react';

interface Treatment {
  id: number;
  name: string;
  specialtyName: string;
  averageCost: number;
  costRange: string;
  duration: string;
  recoveryTime: string;
  successRate: number;
  riskLevel: string;
}

interface CostEstimate {
  treatmentName: string;
  averageCost: number;
  costRange: string;
  duration: string;
  recoveryTime: string;
  hospitalCost?: number;
  costCurrency?: string;
  waitingTime?: string;
  hospitalName?: string;
  city?: string;
  priceRange?: string;
}

interface CostEstimatorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHospitalId?: number;
}

export const CostEstimator: React.FC<CostEstimatorProps> = ({ 
  isOpen, 
  onClose, 
  selectedHospitalId 
}) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState<number | null>(null);
  const [costEstimates, setCostEstimates] = useState<CostEstimate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTreatments();
    }
  }, [isOpen]);

  const fetchTreatments = async () => {
    try {
      const response = await fetch('/api/treatments');
      if (response.ok) {
        const data = await response.json();
        setTreatments(data);
      }
    } catch (error) {
      console.error('Failed to fetch treatments:', error);
    }
  };

  const fetchCostEstimate = async (treatmentId: number) => {
    setIsLoading(true);
    try {
      const url = selectedHospitalId 
        ? `/api/treatments/cost-estimate?treatmentId=${treatmentId}&hospitalId=${selectedHospitalId}`
        : `/api/treatments/cost-estimate?treatmentId=${treatmentId}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCostEstimates(data);
      }
    } catch (error) {
      console.error('Failed to fetch cost estimate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTreatmentSelect = (treatmentId: number) => {
    setSelectedTreatment(treatmentId);
    fetchCostEstimate(treatmentId);
  };

  const filteredTreatments = treatments.filter(treatment =>
    treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    treatment.specialtyName.toLowerCase().includes(searchQuery.toLowerCase())
  );


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[85vh] overflow-hidden">
        <div className="flex h-full">
          {/* Left Panel - Treatment Selection */}
          <div className="w-1/3 border-r border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-dark">Select Treatment</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search treatments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTreatments.map((treatment) => (
                <button
                  key={treatment.id}
                  onClick={() => handleTreatmentSelect(treatment.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTreatment === treatment.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-dark">{treatment.name}</div>
                  <div className="text-sm text-gray-600">{treatment.specialtyName}</div>
                  <div className="text-sm text-primary font-medium">{treatment.costRange}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel - Cost Estimates */}
          <div className="flex-1 p-6">
            <h2 className="text-xl font-bold text-dark mb-6">Cost Estimates</h2>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">Loading cost estimates...</p>
                </div>
              </div>
            ) : costEstimates.length > 0 ? (
              <div className="space-y-6">
                {costEstimates.map((estimate, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-dark">{estimate.treatmentName}</h3>
                        {estimate.hospitalName && (
                          <p className="text-gray-600">{estimate.hospitalName}, {estimate.city}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ${estimate.hospitalCost || estimate.averageCost}
                        </p>
                        <p className="text-sm text-gray-500">{estimate.costCurrency || 'USD'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Duration</p>
                        <p className="text-dark">{estimate.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Recovery</p>
                        <p className="text-dark">{estimate.recoveryTime}</p>
                      </div>
                      {estimate.waitingTime && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Waiting Time</p>
                          <p className="text-dark">{estimate.waitingTime}</p>
                        </div>
                      )}
                      {estimate.priceRange && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Price Category</p>
                          <p className="text-dark capitalize">{estimate.priceRange}</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Cost Range:</strong> {estimate.costRange}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        * Costs may vary based on individual case complexity and additional services required.
                      </p>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                        Request Detailed Quote
                      </button>
                      <button className="flex-1 border border-primary text-primary py-2 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors">
                        Book Consultation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedTreatment ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600">No cost estimates available for this treatment.</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600">Select a treatment to view cost estimates</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};