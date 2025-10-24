import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Appointment {
  id: number;
  appointmentType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes: string;
  consultationFee: number;
  isTelemedicine: boolean;
  doctorFirstName: string;
  doctorLastName: string;
  doctorTitle: string;
  hospitalName: string;
  city: string;
  specialtyName: string;
}

interface TreatmentPlan {
  id: number;
  planName: string;
  description: string;
  estimatedCost: number;
  estimatedDuration: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  doctorFirstName: string;
  doctorLastName: string;
  doctorTitle: string;
  hospitalName: string;
  treatmentName: string;
  successRate: number;
}

export const PatientDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'treatments' | 'records'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && token) {
      fetchDashboardData();
    }
  }, [user, token]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch appointments
      const appointmentsResponse = await fetch('/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);
      }

      // Fetch treatment plans
      const plansResponse = await fetch('/api/treatment-plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setTreatmentPlans(plansData);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointmentDate) >= new Date() && apt.status === 'scheduled'
  ).slice(0, 3);

  const activeTreatmentPlans = treatmentPlans.filter(plan => 
    plan.status === 'active' || plan.status === 'in-progress'
  ).slice(0, 3);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Please Log In</h2>
          <p className="text-gray-600">You need to be logged in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600">Manage your healthcare journey with AfyaConnect</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'appointments', label: 'Appointments' },
                { id: 'treatments', label: 'Treatment Plans' },
                { id: 'records', label: 'Medical Records' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Stats */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v-4m0 0V9a4 4 0 00-8 0v6m4 0h8m-4 0v4" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-dark">{appointments.length}</p>
                        <p className="text-sm text-gray-600">Total Appointments</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-dark">{treatmentPlans.length}</p>
                        <p className="text-sm text-gray-600">Treatment Plans</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-dark">{upcomingAppointments.length}</p>
                        <p className="text-sm text-gray-600">Upcoming</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-dark">{activeTreatmentPlans.length}</p>
                        <p className="text-sm text-gray-600">Active Plans</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-dark mb-4">Upcoming Appointments</h3>
                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingAppointments.map((appointment) => (
                          <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-dark">
                                  {appointment.doctorTitle} {appointment.doctorFirstName} {appointment.doctorLastName}
                                </h4>
                                <p className="text-sm text-gray-600">{appointment.specialtyName}</p>
                                <p className="text-sm text-gray-500">{appointment.hospitalName}</p>
                                <div className="flex items-center mt-2 text-sm">
                                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v-4m0 0V9a4 4 0 00-8 0v6m4 0h8m-4 0v4" />
                                  </svg>
                                  {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                  {appointment.status}
                                </span>
                                {appointment.isTelemedicine && (
                                  <div className="mt-1">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                      Online
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-dark mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => window.location.hash = '#/search'}
                        className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors text-left flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Find Doctors & Hospitals
                      </button>
                      
                      <button className="w-full border border-primary text-primary py-3 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors text-left flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Upload Medical Records
                      </button>
                      
                      <button className="w-full border border-secondary text-secondary py-3 px-4 rounded-lg font-medium hover:bg-secondary/5 transition-colors text-left flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Get Cost Estimate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-dark">My Appointments</h3>
                  <button
                    onClick={() => window.location.hash = '#/search'}
                    className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Book New Appointment
                  </button>
                </div>

                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h4 className="text-lg font-medium text-dark">
                                  {appointment.doctorTitle} {appointment.doctorFirstName} {appointment.doctorLastName}
                                </h4>
                                <p className="text-primary font-medium">{appointment.specialtyName}</p>
                                <p className="text-sm text-gray-600">{appointment.hospitalName}, {appointment.city}</p>
                              </div>
                            </div>
                            
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Date & Time</p>
                                <p className="font-medium">{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                                <p className="font-medium">{appointment.appointmentTime}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Type</p>
                                <p className="font-medium capitalize">{appointment.appointmentType.replace('-', ' ')}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Format</p>
                                <p className="font-medium">{appointment.isTelemedicine ? 'Online' : 'In-person'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Fee</p>
                                <p className="font-medium">${appointment.consultationFee}</p>
                              </div>
                            </div>

                            {appointment.notes && (
                              <div className="mt-4">
                                <p className="text-gray-500 text-sm">Notes:</p>
                                <p className="text-sm">{appointment.notes}</p>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                            <div className="mt-4 space-y-2">
                              {appointment.status === 'scheduled' && (
                                <>
                                  <button className="block w-full text-sm text-primary hover:text-primary/80">
                                    Reschedule
                                  </button>
                                  <button className="block w-full text-sm text-red-600 hover:text-red-800">
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v-4m0 0V9a4 4 0 00-8 0v6m4 0h8m-4 0v4" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                    <p className="text-gray-600 mb-4">Book your first consultation with our expert doctors</p>
                    <button
                      onClick={() => window.location.hash = '#/search'}
                      className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Find Doctors
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'treatments' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-dark">Treatment Plans</h3>
                  <button className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Create New Plan
                  </button>
                </div>

                {treatmentPlans.length > 0 ? (
                  <div className="space-y-4">
                    {treatmentPlans.map((plan) => (
                      <div key={plan.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-dark">{plan.planName}</h4>
                            <p className="text-primary font-medium">{plan.treatmentName}</p>
                            <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                            
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Doctor</p>
                                <p className="font-medium">{plan.doctorTitle} {plan.doctorFirstName} {plan.doctorLastName}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Hospital</p>
                                <p className="font-medium">{plan.hospitalName}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Duration</p>
                                <p className="font-medium">{plan.estimatedDuration}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Estimated Cost</p>
                                <p className="font-medium">${plan.estimatedCost}</p>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(plan.priority)}`}>
                              {plan.priority} priority
                            </span>
                            <div className="mt-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                                {plan.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No treatment plans yet</h3>
                    <p className="text-gray-600">Work with our doctors to create personalized treatment plans</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'records' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-dark">Medical Records</h3>
                  <button className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Upload Records
                  </button>
                </div>

                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records uploaded</h3>
                  <p className="text-gray-600 mb-4">Upload your medical records to share with doctors</p>
                  <button className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Upload First Record
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};