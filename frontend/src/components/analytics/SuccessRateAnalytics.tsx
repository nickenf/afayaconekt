import React, { useState } from 'react';

interface TreatmentStats {
  treatmentName: string;
  specialty: string;
  totalCases: number;
  successRate: number;
  averageCost: number;
  averageDuration: string;
  patientSatisfaction: number;
  complicationRate: number;
  recoveryTime: string;
  hospitalData: {
    hospitalName: string;
    cases: number;
    successRate: number;
    cost: number;
  }[];
}

export const SuccessRateAnalytics: React.FC = () => {
  const [selectedTreatment, setSelectedTreatment] = useState<string>('Heart Bypass Surgery');

  const treatmentStats: Record<string, TreatmentStats> = {
    'Heart Bypass Surgery': {
      treatmentName: 'Heart Bypass Surgery',
      specialty: 'Cardiology',
      totalCases: 1250,
      successRate: 96.8,
      averageCost: 8500,
      averageDuration: '5-7 days',
      patientSatisfaction: 4.8,
      complicationRate: 2.1,
      recoveryTime: '6-8 weeks',
      hospitalData: [
        { hospitalName: 'Apollo Hospitals Chennai', cases: 450, successRate: 97.2, cost: 9000 },
        { hospitalName: 'Fortis Hospital Gurgaon', cases: 380, successRate: 96.8, cost: 8200 },
        { hospitalName: 'Max Super Speciality Hospital Delhi', cases: 420, successRate: 96.4, cost: 8800 }
      ]
    },
    'Knee Replacement': {
      treatmentName: 'Knee Replacement',
      specialty: 'Orthopedics',
      totalCases: 2100,
      successRate: 98.2,
      averageCost: 6500,
      averageDuration: '3-5 days',
      patientSatisfaction: 4.9,
      complicationRate: 1.2,
      recoveryTime: '3-6 months',
      hospitalData: [
        { hospitalName: 'Fortis Hospital Gurgaon', cases: 750, successRate: 98.5, cost: 6200 },
        { hospitalName: 'Apollo Hospitals Chennai', cases: 680, successRate: 98.1, cost: 6800 },
        { hospitalName: 'Max Super Speciality Hospital Delhi', cases: 670, successRate: 97.9, cost: 6500 }
      ]
    },
    'Cataract Surgery': {
      treatmentName: 'Cataract Surgery',
      specialty: 'Ophthalmology',
      totalCases: 3500,
      successRate: 99.1,
      averageCost: 1500,
      averageDuration: '1 day',
      patientSatisfaction: 4.9,
      complicationRate: 0.5,
      recoveryTime: '1-2 weeks',
      hospitalData: [
        { hospitalName: 'Max Super Speciality Hospital Delhi', cases: 1200, successRate: 99.3, cost: 1400 },
        { hospitalName: 'Apollo Hospitals Chennai', cases: 1150, successRate: 99.0, cost: 1550 },
        { hospitalName: 'Fortis Hospital Gurgaon', cases: 1150, successRate: 99.0, cost: 1520 }
      ]
    },
    'IVF Treatment': {
      treatmentName: 'IVF Treatment',
      specialty: 'Fertility',
      totalCases: 890,
      successRate: 68.5,
      averageCost: 5000,
      averageDuration: '2-3 weeks',
      patientSatisfaction: 4.7,
      complicationRate: 3.2,
      recoveryTime: '2-4 weeks',
      hospitalData: [
        { hospitalName: 'Max Super Speciality Hospital Delhi', cases: 320, successRate: 72.1, cost: 5200 },
        { hospitalName: 'Apollo Hospitals Chennai', cases: 290, successRate: 66.8, cost: 4900 },
        { hospitalName: 'Fortis Hospital Gurgaon', cases: 280, successRate: 65.7, cost: 4800 }
      ]
    }
  };

  const currentStats = treatmentStats[selectedTreatment];

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateBackground = (rate: number) => {
    if (rate >= 95) return 'bg-green-100';
    if (rate >= 85) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-dark mb-2">Treatment Success Analytics</h3>
          <p className="text-gray-600">Comprehensive data on treatment outcomes and success rates</p>
        </div>
        <div>
          <select
            value={selectedTreatment}
            onChange={(e) => setSelectedTreatment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {Object.keys(treatmentStats).map(treatment => (
              <option key={treatment} value={treatment}>
                {treatment}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${getSuccessRateBackground(currentStats.successRate)}`}>
            <span className={`text-2xl font-bold ${getSuccessRateColor(currentStats.successRate)}`}>
              {currentStats.successRate}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Success Rate</p>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
            <span className="text-2xl font-bold text-blue-600">{currentStats.totalCases}</span>
          </div>
          <p className="text-sm text-gray-600">Total Cases</p>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-3">
            <span className="text-xl font-bold text-purple-600">{currentStats.patientSatisfaction}⭐</span>
          </div>
          <p className="text-sm text-gray-600">Patient Rating</p>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-3">
            <span className="text-lg font-bold text-orange-600">${currentStats.averageCost}</span>
          </div>
          <p className="text-sm text-gray-600">Avg Cost</p>
        </div>
      </div>

      {/* Treatment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h4 className="text-lg font-semibold text-dark mb-4">Treatment Overview</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Specialty:</span>
              <span className="font-medium text-primary">{currentStats.specialty}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Average Duration:</span>
              <span className="font-medium text-dark">{currentStats.averageDuration}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Recovery Time:</span>
              <span className="font-medium text-dark">{currentStats.recoveryTime}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Complication Rate:</span>
              <span className="font-medium text-red-600">{currentStats.complicationRate}%</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-dark mb-4">Success Rate Breakdown</h4>
          <div className="space-y-3">
            {/* Success Rate Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Success Rate</span>
                <span className="font-medium">{currentStats.successRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${currentStats.successRate}%` }}
                />
              </div>
            </div>

            {/* Patient Satisfaction Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Patient Satisfaction</span>
                <span className="font-medium">{currentStats.patientSatisfaction}/5.0</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStats.patientSatisfaction / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Complication Rate Bar (inverted) */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Safety Score</span>
                <span className="font-medium">{(100 - currentStats.complicationRate).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${100 - currentStats.complicationRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Comparison */}
      <div>
        <h4 className="text-lg font-semibold text-dark mb-4">Hospital Performance Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Hospital</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Cases</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Success Rate</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Average Cost</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentStats.hospitalData.map((hospital, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-dark">{hospital.hospitalName}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium text-dark">{hospital.cases}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-bold ${getSuccessRateColor(hospital.successRate)}`}>
                      {hospital.successRate}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium text-dark">${hospital.cost.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="bg-primary text-white py-1 px-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h5 className="font-medium text-green-900">Key Insights</h5>
          </div>
          <ul className="text-green-800 text-sm space-y-1">
            <li>• Success rates consistently above 95% across all hospitals</li>
            <li>• Patient satisfaction scores exceed 4.5/5.0</li>
            <li>• Complication rates well below international standards</li>
            <li>• Cost savings of 60-80% compared to Western countries</li>
          </ul>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h5 className="font-medium text-blue-900">Quality Indicators</h5>
          </div>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• JCI and NABH accredited facilities</li>
            <li>• International standard protocols</li>
            <li>• Experienced medical teams</li>
            <li>• Advanced medical technology</li>
          </ul>
        </div>
      </div>

      {/* Trending Treatments */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-dark mb-4">Trending Treatments</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'LASIK Surgery', growth: '+25%', cases: 1200, successRate: 98.5 },
            { name: 'Hip Replacement', growth: '+18%', cases: 890, successRate: 97.2 },
            { name: 'Cancer Treatment', growth: '+15%', cases: 650, successRate: 89.3 }
          ].map((trend, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-dark">{trend.name}</h5>
                <span className="text-green-600 text-sm font-medium">{trend.growth}</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>{trend.cases} cases • {trend.successRate}% success rate</p>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${trend.successRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold mb-2">Ready to Start Your Treatment?</h4>
            <p className="opacity-90">Join thousands of successful patients who chose AfyaConnect</p>
          </div>
          <div className="space-y-2">
            <button className="block bg-white text-primary py-2 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Get Consultation
            </button>
            <button className="block border border-white text-white py-2 px-6 rounded-lg font-medium hover:bg-white/10 transition-colors">
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};