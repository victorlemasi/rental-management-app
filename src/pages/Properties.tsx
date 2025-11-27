import { useState, useEffect } from 'react';
import { Plus, Search, Building2, MapPin, Trash2 } from 'lucide-react';
import { propertiesAPI } from '../services/api';
import type { Property } from '../types';
import Modal from '../components/Modal';

const PropertyCard = ({ property, onDelete }: { property: Property; onDelete: (id: string) => void }) => {
    const occupancyRate = Math.round((property.occupiedUnits / property.units) * 100);

    const statusColors = {
        active: 'bg-green-100 text-green-700',
        maintenance: 'bg-orange-100 text-orange-700',
        vacant: 'bg-gray-100 text-gray-700',
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center relative">
                <Building2 className="w-20 h-20 text-white opacity-50" />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this property?')) {
                            onDelete(property._id);
                        }
                    }}
                    className="absolute top-4 right-4 p-2 bg-white/90 rounded-lg text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{property.name}</h3>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>{property.address}</span>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[property.status]}`}>
                        {property.status}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-xs text-gray-500">Units</p>
                        <p className="text-lg font-semibold text-gray-900">{property.units}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Occupancy</p>
                        <p className="text-lg font-semibold text-gray-900">{occupancyRate}%</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">{property.type}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Monthly Revenue</p>
                        <p className="text-sm font-semibold text-primary-600">${property.monthlyRent.toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {property.amenities.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {amenity}
                        </span>
                    ))}
                    {property.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{property.amenities.length - 3} more
                        </span>
                    )}
                </div>

                <button className="w-full py-2 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100 transition-colors">
                    View Details
                </button>
            </div>
        </div>
    );
};

const Properties = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        type: 'apartment',
        units: 1,
        monthlyRent: 0,
        yearBuilt: new Date().getFullYear(),
        amenities: ''
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await propertiesAPI.getAll();
            setProperties(data);
        } catch (err) {
            setError('Failed to load properties. Make sure the backend server is running on port 5000.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const amenitiesList = formData.amenities.split(',').map(item => item.trim()).filter(Boolean);
            await propertiesAPI.create({
                ...formData,
                amenities: amenitiesList,
                occupiedUnits: 0,
                status: 'active'
            });
            setIsModalOpen(false);
            fetchProperties();
            setFormData({
                name: '',
                address: '',
                type: 'apartment',
                units: 1,
                monthlyRent: 0,
                yearBuilt: new Date().getFullYear(),
                amenities: ''
            });
        } catch (err) {
            console.error('Failed to create property:', err);
            alert('Failed to create property');
        }
    };

    const handleDeleteProperty = async (id: string) => {
        try {
            await propertiesAPI.delete(id);
            setProperties(properties.filter(p => p._id !== id));
        } catch (err) {
            console.error('Failed to delete property:', err);
            alert('Failed to delete property');
        }
    };

    const filteredProperties = properties.filter((property) => {
        const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || property.type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading properties...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-800 font-semibold mb-2">Error Loading Properties</h3>
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchProperties}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
                    <p className="text-gray-500 mt-1">Manage your rental properties • Connected to MongoDB Atlas</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Property
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search properties..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="all">All Types</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="condo">Condo</option>
                        <option value="commercial">Commercial</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                    <PropertyCard
                        key={property._id}
                        property={property}
                        onDelete={handleDeleteProperty}
                    />
                ))}
            </div>

            {filteredProperties.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No properties found</p>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Property"
            >
                <form onSubmit={handleAddProperty} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g. Sunset Apartments"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g. 123 Main St"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="condo">Condo</option>
                                <option value="commercial">Commercial</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                            <input
                                type="number"
                                required
                                value={formData.yearBuilt}
                                onChange={(e) => setFormData({ ...formData, yearBuilt: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Units</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.units}
                                onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent ($)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.monthlyRent}
                                onChange={(e) => setFormData({ ...formData, monthlyRent: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
                        <input
                            type="text"
                            value={formData.amenities}
                            onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g. Parking, Gym, Pool"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Add Property
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Properties;
