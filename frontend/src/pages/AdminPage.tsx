import { useState, useEffect } from 'react';
import { Inquiry } from '../types/index.ts';
import { Loader } from '../components/common/Loader.tsx';
import { ErrorMessage } from '../components/common/ErrorMessage.tsx';
import { fetchInquiries } from '../services/api.ts';
import { HospitalFormModal } from '../components/admin/HospitalFormModal.tsx';
import { DoctorFormModal } from '../components/admin/DoctorFormModal.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { AuthModal } from '../components/auth/AuthModal.tsx';

export const AdminPage = () => {
    const { user, token, isLoading: authLoading } = useAuth();

    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'hospitals' | 'appointments' | 'inquiries' | 'testimonials' | 'analytics' | 'accommodation'>('overview');
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [appointments] = useState<any[]>([]);
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [accommodationBookings, setAccommodationBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Hospital modal state
    const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
    const [editingHospital, setEditingHospital] = useState<any>(null);

    // Doctor modal state
    const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<any>(null);

    // Auth modal state
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch inquiries
            const inquiriesData = await fetchInquiries();
            setInquiries(inquiriesData);

            // Fetch hospitals
            const hospitalsResponse = await fetch('/api/hospitals');
            if (hospitalsResponse.ok) {
                const hospitalsData = await hospitalsResponse.json();
                setHospitals(hospitalsData);
            }

            // Fetch doctors
            const doctorsResponse = await fetch('/api/doctors');
            if (doctorsResponse.ok) {
                const doctorsData = await doctorsResponse.json();
                // For demo purposes, we'll use doctors as users
                setUsers(doctorsData);
            }

            // Fetch all testimonials (including pending ones for admin review)
            const testimonialsResponse = await fetch('/api/admin/testimonials', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            if (testimonialsResponse.ok) {
                const testimonialsData = await testimonialsResponse.json();
                setTestimonials(testimonialsData);
            }

            // Fetch accommodation bookings
            const accommodationResponse = await fetch('/api/admin/accommodation-bookings', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            if (accommodationResponse.ok) {
                const accommodationData = await accommodationResponse.json();
                setAccommodationBookings(accommodationData);
            }

        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const stats = {
        totalUsers: users.length,
        totalHospitals: hospitals.length,
        totalInquiries: inquiries.length,
        totalAppointments: appointments.length,
        activeUsers: Math.floor(users.length * 0.7),
        revenue: '$125,000',
        successRate: '98.5%',
        avgRating: '4.8'
    };

    // Testimonial management functions
    const handleApproveTestimonial = async (testimonialId: number) => {
        try {
            const response = await fetch(`/api/admin/testimonials/${testimonialId}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                // Refresh testimonials
                fetchDashboardData();
                alert('Testimonial approved successfully!');
            } else {
                alert('Failed to approve testimonial');
            }
        } catch (error) {
            console.error('Error approving testimonial:', error);
            alert('Error approving testimonial');
        }
    };

    const handleRejectTestimonial = async (testimonialId: number) => {
        if (!confirm('Are you sure you want to reject this testimonial?')) return;

        try {
            const response = await fetch(`/api/admin/testimonials/${testimonialId}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                // Refresh testimonials
                fetchDashboardData();
                alert('Testimonial rejected');
            } else {
                alert('Failed to reject testimonial');
            }
        } catch (error) {
            console.error('Error rejecting testimonial:', error);
            alert('Error rejecting testimonial');
        }
    };

    const handlePublishTestimonial = async (testimonialId: number) => {
        try {
            const response = await fetch(`/api/admin/testimonials/${testimonialId}/publish`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                // Refresh testimonials
                fetchDashboardData();
                alert('Testimonial published successfully!');
            } else {
                alert('Failed to publish testimonial');
            }
        } catch (error) {
            console.error('Error publishing testimonial:', error);
            alert('Error publishing testimonial');
        }
    };

    const handleUnpublishTestimonial = async (testimonialId: number) => {
        try {
            const response = await fetch(`/api/admin/testimonials/${testimonialId}/unpublish`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                // Refresh testimonials
                fetchDashboardData();
                alert('Testimonial unpublished');
            } else {
                alert('Failed to unpublish testimonial');
            }
        } catch (error) {
            console.error('Error unpublishing testimonial:', error);
            alert('Error unpublishing testimonial');
        }
    };

    // Accommodation booking management functions
    const updateBookingStatus = async (bookingId: number, status: string, notes?: string) => {
        try {
            const response = await fetch(`/api/admin/accommodation-bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ status, notes })
            });

            if (response.ok) {
                // Refresh data
                fetchDashboardData();
                alert(`Booking ${status} successfully`);
            } else {
                alert('Failed to update booking status');
            }
        } catch (error) {
            console.error('Error updating booking status:', error);
            alert('Error updating booking status');
        }
    };

    // Hospital management functions
    const handleAddHospital = () => {
        setEditingHospital(null);
        setIsHospitalModalOpen(true);
    };

    const handleEditHospital = async (hospital: any) => {
        try {
            // Fetch full hospital details for editing
            const response = await fetch(`/api/hospitals/${hospital.id}`);
            if (response.ok) {
                const fullHospitalData = await response.json();
                setEditingHospital(fullHospitalData);
                setIsHospitalModalOpen(true);
            } else {
                alert('Failed to load hospital details for editing');
            }
        } catch (error) {
            console.error('Error fetching hospital details:', error);
            alert('Error loading hospital details');
        }
    };

    const handleDeleteHospital = async (hospitalId: number) => {
        if (!confirm('Are you sure you want to delete this hospital? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/hospitals/${hospitalId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Refresh hospitals list
                fetchDashboardData();
                alert('Hospital deleted successfully');
            } else {
                const errorData = await response.json();
                alert(`Failed to delete hospital: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error deleting hospital:', error);
            alert('Error deleting hospital');
        }
    };

    const handleHospitalSave = () => {
        // Refresh the hospitals list
        fetchDashboardData();
    };

    // Doctor management functions
    const handleAddDoctor = () => {
        setEditingDoctor(null);
        setIsDoctorModalOpen(true);
    };

    const handleEditDoctor = async (doctor: any) => {
        try {
            // Fetch full doctor details for editing
            const response = await fetch(`/api/doctors/${doctor.id}`);
            if (response.ok) {
                const fullDoctorData = await response.json();
                setEditingDoctor(fullDoctorData);
                setIsDoctorModalOpen(true);
            } else {
                alert('Failed to load doctor details for editing');
            }
        } catch (error) {
            console.error('Error fetching doctor details:', error);
            alert('Error loading doctor details');
        }
    };

    const handleDeleteDoctor = async (doctorId: number) => {
        if (!confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/doctors/${doctorId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Refresh doctors list
                fetchDashboardData();
                alert('Doctor deleted successfully');
            } else {
                const errorData = await response.json();
                alert(`Failed to delete doctor: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error deleting doctor:', error);
            alert('Error deleting doctor');
        }
    };

    const handleDoctorSave = () => {
        // Refresh the doctors list
        fetchDashboardData();
    };

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader message="Checking authentication..." />
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!user || !token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-dark mb-4">Admin Access Required</h1>
                    <p className="text-gray-600 mb-6">
                        You need to be logged in as an administrator to access this page.
                    </p>
                    <div className="flex space-x-4 justify-center">
                        <button
                            onClick={() => {
                                setAuthMode('login');
                                setShowAuthModal(true);
                            }}
                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => window.location.href = '#/'}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Go to Home
                        </button>
                    </div>

                    {/* Auth Modal */}
                    <AuthModal
                        isOpen={showAuthModal}
                        onClose={() => setShowAuthModal(false)}
                        initialMode={authMode}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-dark mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Comprehensive management system for AfyaConnect platform</p>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { id: 'overview', label: 'Overview', icon: '📊' },
                                { id: 'users', label: 'Users', icon: '👥' },
                                { id: 'hospitals', label: 'Hospitals', icon: '🏥' },
                                { id: 'accommodation', label: 'Accommodation', icon: '🏨' },
                                { id: 'appointments', label: 'Appointments', icon: '📅' },
                                { id: 'inquiries', label: 'Inquiries', icon: '💬' },
                                { id: 'testimonials', label: 'Testimonials', icon: '⭐' },
                                { id: 'analytics', label: 'Analytics', icon: '📈' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                                        activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <Loader message="Loading dashboard data..." />
                    </div>
                ) : error ? (
                    <ErrorMessage message={error} />
                ) : (
                    <div className="space-y-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'bg-blue-500' },
                                        { title: 'Partner Hospitals', value: stats.totalHospitals, icon: '🏥', color: 'bg-green-500' },
                                        { title: 'Total Inquiries', value: stats.totalInquiries, icon: '💬', color: 'bg-purple-500' },
                                        { title: 'Success Rate', value: stats.successRate, icon: '✅', color: 'bg-orange-500' }
                                    ].map((stat, index) => (
                                        <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                                            <div className="flex items-center">
                                                <div className={`p-3 rounded-lg ${stat.color} text-white mr-4`}>
                                                    <span className="text-xl">{stat.icon}</span>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-dark">{stat.value}</p>
                                                    <p className="text-sm text-gray-600">{stat.title}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent Activity */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg shadow-sm p-6">
                                        <h3 className="text-lg font-semibold text-dark mb-4">Recent Inquiries</h3>
                                        <div className="space-y-3">
                                            {inquiries.slice(0, 5).map((inquiry) => (
                                                <div key={inquiry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-dark">{inquiry.patientName}</p>
                                                        <p className="text-sm text-gray-600">{inquiry.hospitalName}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(inquiry.submittedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow-sm p-6">
                                        <h3 className="text-lg font-semibold text-dark mb-4">Top Hospitals</h3>
                                        <div className="space-y-3">
                                            {hospitals.slice(0, 5).map((hospital) => (
                                                <div key={hospital.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-dark">{hospital.name}</p>
                                                        <p className="text-sm text-gray-600">{hospital.city}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-primary">{hospital.averageRating}⭐</p>
                                                        <p className="text-xs text-gray-500">{hospital.ratingCount} reviews</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-dark">Doctor Management</h3>
                                    <button
                                        onClick={handleAddDoctor}
                                        className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Add New Doctor
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Specialty</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Hospital</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center">
                                                            <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full mr-3" />
                                                            <div>
                                                                <p className="font-medium text-dark">{user.title} {user.firstName} {user.lastName}</p>
                                                                <p className="text-sm text-gray-600">{user.qualifications}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">{user.specialtyName}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">{user.hospitalName}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-sm font-medium text-primary">{user.rating}⭐</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEditDoctor(user)}
                                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDoctor(user.id)}
                                                                className="text-red-600 hover:text-red-800 text-sm"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'hospitals' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-dark">Hospital Management</h3>
                                    <button
                                        onClick={handleAddHospital}
                                        className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Add New Hospital
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {hospitals.map((hospital) => (
                                        <div key={hospital.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-dark">{hospital.name}</h4>
                                                    <p className="text-sm text-gray-600">{hospital.city}, {hospital.state}</p>
                                                </div>
                                                <span className="text-sm font-medium text-primary">{hospital.averageRating}⭐</span>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{hospital.description}</p>
                                            <div className="flex justify-between text-xs text-gray-500 mb-3">
                                                <span>{hospital.bedCount} beds</span>
                                                <span>{hospital.doctorCount} doctors</span>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditHospital(hospital)}
                                                    className="flex-1 bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteHospital(hospital.id)}
                                                    className="flex-1 bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'accommodation' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-dark">Accommodation Bookings</h3>
                                    <div className="flex items-center space-x-4">
                                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                            <option value="">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Guest</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Accommodation</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Check-in</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Check-out</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Guests</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Total Cost</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {accommodationBookings.map((booking) => (
                                                <tr key={booking.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <p className="font-medium text-dark">{booking.guestName || `${booking.firstName} ${booking.lastName}`}</p>
                                                            <p className="text-sm text-gray-600">{booking.guestEmail || booking.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">{booking.accommodationName}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        {new Date(booking.checkInDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        {new Date(booking.checkOutDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">{booking.numberOfGuests}</td>
                                                    <td className="py-3 px-4 text-sm font-medium text-primary">
                                                        {booking.currency} {booking.totalCost}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                            booking.bookingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            booking.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {booking.bookingStatus}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex space-x-2">
                                                            {booking.bookingStatus === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                                                        className="text-green-600 hover:text-green-800 text-sm"
                                                                    >
                                                                        Confirm
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                                                                View Details
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'inquiries' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-dark mb-6">Patient Inquiries</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Patient</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Hospital</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Message</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inquiries.map((inquiry) => (
                                                <tr key={inquiry.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        {new Date(inquiry.submittedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <p className="font-medium text-dark">{inquiry.patientName}</p>
                                                            <p className="text-sm text-gray-600">{inquiry.patientEmail}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">{inquiry.hospitalName}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate" title={inquiry.message}>
                                                        {inquiry.message}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex space-x-2">
                                                            <button className="text-blue-600 hover:text-blue-800 text-sm">Reply</button>
                                                            <button className="text-green-600 hover:text-green-800 text-sm">Resolve</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'testimonials' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-dark">Testimonials Management</h3>
                                    <div className="flex space-x-2">
                                        <button className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                                            Publish All Approved
                                        </button>
                                        <button className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                            Refresh
                                        </button>
                                    </div>
                                </div>

                                {/* Testimonials Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-yellow-600">{testimonials.filter(t => !t.isApproved).length}</div>
                                        <div className="text-sm text-yellow-700">Pending Review</div>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-blue-600">{testimonials.filter(t => t.isApproved && !t.isPublished).length}</div>
                                        <div className="text-sm text-blue-700">Approved</div>
                                    </div>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-green-600">{testimonials.filter(t => t.isPublished).length}</div>
                                        <div className="text-sm text-green-700">Published</div>
                                    </div>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-red-600">{testimonials.length}</div>
                                        <div className="text-sm text-red-700">Total</div>
                                    </div>
                                </div>

                                {/* Testimonials List */}
                                <div className="space-y-4">
                                    {testimonials.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">⭐</div>
                                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No testimonials yet</h3>
                                            <p className="text-gray-500">Patient testimonials will appear here for review.</p>
                                        </div>
                                    ) : (
                                        testimonials.map((testimonial) => (
                                            <div key={testimonial.id} className="border border-gray-200 rounded-lg p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h4 className="text-lg font-semibold text-dark">{testimonial.patientName}</h4>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                testimonial.isPublished
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : testimonial.isApproved
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {testimonial.isPublished ? 'Published' : testimonial.isApproved ? 'Approved' : 'Pending'}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            {testimonial.patientCountry} • {testimonial.treatmentType} • {testimonial.hospitalName}
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                                            <span>⭐ {testimonial.rating}/5</span>
                                                            <span>Dr. {testimonial.doctorName}</span>
                                                            {testimonial.costSaved && <span>Saved ${testimonial.costSaved.toLocaleString()}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="text-right text-sm text-gray-500">
                                                        {new Date(testimonial.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <p className="text-gray-700 italic">"{testimonial.testimonialText}"</p>
                                                </div>

                                                {testimonial.tags && testimonial.tags.length > 0 && (
                                                    <div className="mb-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {testimonial.tags.map((tag: string, index: number) => (
                                                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-600">
                                                        Submitted by: {testimonial.submitterFirstName} {testimonial.submitterLastName}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        {!testimonial.isApproved && (
                                                            <button
                                                                onClick={() => handleApproveTestimonial(testimonial.id)}
                                                                className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        {testimonial.isApproved && !testimonial.isPublished && (
                                                            <button
                                                                onClick={() => handlePublishTestimonial(testimonial.id)}
                                                                className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                                                            >
                                                                Publish
                                                            </button>
                                                        )}
                                                        {testimonial.isPublished && (
                                                            <button
                                                                onClick={() => handleUnpublishTestimonial(testimonial.id)}
                                                                className="bg-orange-600 text-white py-1 px-3 rounded text-sm hover:bg-orange-700 transition-colors"
                                                            >
                                                                Unpublish
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleRejectTestimonial(testimonial.id)}
                                                            className="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button className="border border-gray-300 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-50 transition-colors">
                                                            View Details
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { title: 'Monthly Revenue', value: stats.revenue, change: '+12%', color: 'text-green-600' },
                                        { title: 'Active Users', value: stats.activeUsers, change: '+8%', color: 'text-blue-600' },
                                        { title: 'Success Rate', value: stats.successRate, change: '+0.2%', color: 'text-purple-600' },
                                        { title: 'Avg Rating', value: stats.avgRating, change: '+0.1', color: 'text-orange-600' }
                                    ].map((metric, index) => (
                                        <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                                            <h4 className="text-sm font-medium text-gray-600 mb-2">{metric.title}</h4>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold text-dark">{metric.value}</span>
                                                <span className={`text-sm font-medium ${metric.color}`}>{metric.change}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h3 className="text-lg font-semibold text-dark mb-4">Platform Performance</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center">
                                            <div className="text-3xl mb-2">📈</div>
                                            <div className="text-2xl font-bold text-green-600">+25%</div>
                                            <div className="text-sm text-gray-600">Growth This Month</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl mb-2">⏱️</div>
                                            <div className="text-2xl font-bold text-blue-600">2.3s</div>
                                            <div className="text-sm text-gray-600">Avg Response Time</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl mb-2">🌍</div>
                                            <div className="text-2xl font-bold text-purple-600">15</div>
                                            <div className="text-sm text-gray-600">Countries Served</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Hospital Form Modal */}
                <HospitalFormModal
                    isOpen={isHospitalModalOpen}
                    onClose={() => setIsHospitalModalOpen(false)}
                    onSave={handleHospitalSave}
                    hospital={editingHospital}
                />

                {/* Doctor Form Modal */}
                <DoctorFormModal
                    isOpen={isDoctorModalOpen}
                    onClose={() => setIsDoctorModalOpen(false)}
                    onSave={handleDoctorSave}
                    doctor={editingDoctor}
                />
            </div>
        </div>
    );
};