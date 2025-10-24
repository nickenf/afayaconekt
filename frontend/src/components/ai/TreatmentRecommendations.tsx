import React, { useState } from 'react';

interface Recommendation {
  id: string;
  treatmentName: string;
  specialty: string;
  confidence: number;
  reasoning: string;
  estimatedCost: number;
  duration: string;
  successRate: number;
  riskLevel: string;
  recommendedHospitals: string[];
  recommendedDoctors: string[];
  urgency: 'low' | 'medium' | 'high';
  alternativeOptions: string[];
}

interface TreatmentRecommendationsProps {
  symptoms?: string[];
  medicalHistory?: string[];
  age?: number;
  gender?: string;
}

export const TreatmentRecommendations: React.FC<TreatmentRecommendationsProps> = () => {
  
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userSymptoms, setUserSymptoms] = useState<string>('');
  const [showForm, setShowForm] = useState(true);

  // Mock AI recommendations based on symptoms
  const generateRecommendations = async (symptomsText: string) => {
    setIsLoading(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock recommendations based on common symptoms
    const mockRecommendations: Recommendation[] = [];

    if (symptomsText.toLowerCase().includes('chest pain') || symptomsText.toLowerCase().includes('heart')) {
      mockRecommendations.push({
        id: 'cardio-1',
        treatmentName: 'Cardiac Evaluation & Treatment',
        specialty: 'Cardiology',
        confidence: 92,
        reasoning: 'Based on reported chest pain symptoms, a comprehensive cardiac evaluation is recommended to rule out coronary artery disease.',
        estimatedCost: 5000,
        duration: '3-5 days',
        successRate: 95,
        riskLevel: 'low',
        recommendedHospitals: ['Apollo Hospitals Chennai', 'Fortis Hospital Gurgaon'],
        recommendedDoctors: ['Dr. Rajesh Kumar', 'Dr. Amit Singh'],
        urgency: 'high',
        alternativeOptions: ['Stress Test', 'Echocardiogram', 'Angiography']
      });
    }

    if (symptomsText.toLowerCase().includes('joint pain') || symptomsText.toLowerCase().includes('knee') || symptomsText.toLowerCase().includes('hip')) {
      mockRecommendations.push({
        id: 'ortho-1',
        treatmentName: 'Orthopedic Consultation & Joint Care',
        specialty: 'Orthopedics',
        confidence: 88,
        reasoning: 'Joint pain symptoms suggest potential orthopedic issues that may benefit from specialized evaluation and treatment.',
        estimatedCost: 3500,
        duration: '2-4 weeks',
        successRate: 90,
        riskLevel: 'low',
        recommendedHospitals: ['Fortis Hospital Gurgaon', 'Max Super Speciality Hospital Delhi'],
        recommendedDoctors: ['Dr. Amit Singh'],
        urgency: 'medium',
        alternativeOptions: ['Physical Therapy', 'Joint Replacement', 'Arthroscopy']
      });
    }

    if (symptomsText.toLowerCase().includes('vision') || symptomsText.toLowerCase().includes('eye') || symptomsText.toLowerCase().includes('sight')) {
      mockRecommendations.push({
        id: 'ophth-1',
        treatmentName: 'Comprehensive Eye Examination',
        specialty: 'Ophthalmology',
        confidence: 85,
        reasoning: 'Vision-related symptoms require thorough ophthalmologic evaluation to determine appropriate treatment options.',
        estimatedCost: 1500,
        duration: '1-2 days',
        successRate: 98,
        riskLevel: 'low',
        recommendedHospitals: ['Max Super Speciality Hospital Delhi', 'Apollo Hospitals Chennai'],
        recommendedDoctors: ['Dr. Sunita Patel'],
        urgency: 'medium',
        alternativeOptions: ['LASIK Surgery', 'Cataract Surgery', 'Retinal Treatment']
      });
    }

    // Default general recommendation
    if (mockRecommendations.length === 0) {
      mockRecommendations.push({
        id: 'general-1',
        treatmentName: 'General Health Assessment',
        specialty: 'General Medicine',
        confidence: 75,
        reasoning: 'A comprehensive health assessment is recommended to evaluate your symptoms and determine the best course of action.',
        estimatedCost: 800,
        duration: '1 day',
        successRate: 95,
        riskLevel: 'low',
        recommendedHospitals: ['Apollo Hospitals Chennai', 'Fortis Hospital Gurgaon', 'Max Super Speciality Hospital Delhi'],
        recommendedDoctors: ['Available specialists'],
        urgency: 'low',
        alternativeOptions: ['Specialist Consultation', 'Diagnostic Tests', 'Preventive Care']
      });
    }

    setRecommendations(mockRecommendations);
    setIsLoading(false);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userSymptoms.trim()) {
      generateRecommendations(userSymptoms);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-purple-100 rounded-lg mr-4">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-dark">AI Treatment Recommendations</h3>
          <p className="text-gray-600">Get personalized treatment suggestions based on your symptoms</p>
        </div>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-dark mb-2">
              Describe Your Symptoms
            </label>
            <textarea
              id="symptoms"
              value={userSymptoms}
              onChange={(e) => setUserSymptoms(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Please describe your symptoms in detail (e.g., chest pain, joint pain, vision problems, etc.)"
              required
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">🤖 AI-Powered Analysis</h4>
            <p className="text-blue-800 text-sm">
              Our AI system will analyze your symptoms and provide personalized treatment recommendations 
              based on medical databases and successful treatment outcomes.
            </p>
          </div>

          <button
            type="submit"
            disabled={!userSymptoms.trim()}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Get AI Recommendations
          </button>
        </form>
      ) : isLoading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <svg className="animate-spin w-8 h-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-dark mb-2">Analyzing Your Symptoms</h3>
          <p className="text-gray-600">Our AI is processing your information to provide personalized recommendations...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-dark">Recommended Treatments</h4>
            <button
              onClick={() => setShowForm(true)}
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              New Analysis
            </button>
          </div>

          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h5 className="text-lg font-semibold text-dark">{recommendation.treatmentName}</h5>
                  <p className="text-primary font-medium">{recommendation.specialty}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center mb-2">
                    <span className="text-sm text-gray-600 mr-2">AI Confidence:</span>
                    <span className="font-bold text-purple-600">{recommendation.confidence}%</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(recommendation.urgency)}`}>
                    {recommendation.urgency} urgency
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{recommendation.reasoning}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Estimated Cost</p>
                  <p className="font-semibold text-dark">${recommendation.estimatedCost}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-semibold text-dark">{recommendation.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="font-semibold text-green-600">{recommendation.successRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Risk Level</p>
                  <p className={`font-semibold ${getRiskColor(recommendation.riskLevel)}`}>
                    {recommendation.riskLevel}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Recommended Hospitals:</p>
                <div className="flex flex-wrap gap-2">
                  {recommendation.recommendedHospitals.map((hospital, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {hospital}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Alternative Options:</p>
                <div className="flex flex-wrap gap-2">
                  {recommendation.alternativeOptions.map((option, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {option}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Book Consultation
                </button>
                <button className="flex-1 border border-primary text-primary py-2 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors">
                  Get Second Opinion
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Save for Later
                </button>
              </div>
            </div>
          ))}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Medical Disclaimer</h4>
                <p className="text-yellow-800 text-sm">
                  These AI recommendations are for informational purposes only and should not replace professional medical advice. 
                  Please consult with qualified healthcare providers for proper diagnosis and treatment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};