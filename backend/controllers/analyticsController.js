import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import Maintenance from '../models/Maintenance.js';
import Fuel from '../models/Fuel.js';
import Driver from '../models/Driver.js';
import Incident from '../models/Incident.js';

// @desc    Get dashboard KPIs
// @route   GET /api/analytics/kpi
// @access  Private
export const getDashboardKPIs = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ isActive: true });
        const trips = await Trip.find({ status: { $in: ['Draft', 'Dispatched'] }, isActive: true });

        const activeFleet = vehicles.filter(v => v.status === 'On Trip').length;
        const maintenanceAlerts = vehicles.filter(v => v.status === 'In Shop').length;
        const totalVehicles = vehicles.length;

        // Utilization Rate
        const utilizationRate = totalVehicles === 0 ? 0 : ((activeFleet / totalVehicles) * 100).toFixed(2);

        const pendingCargo = trips.reduce((acc, trip) => acc + trip.cargoWeight, 0);

        // Total revenue from completed trips
        const completedTrips = await Trip.find({ status: 'Completed', isActive: true });
        const totalRevenue = completedTrips.reduce((acc, t) => acc + (t.revenue || 0), 0);

        // Active (available / on-trip) drivers
        const activeDrivers = await Driver.countDocuments({ isActive: true });

        res.json({
            activeFleet,
            maintenanceAlerts,
            utilizationRate,
            pendingCargo,
            totalVehicles,
            totalRevenue,
            activeDrivers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Vehicle ROI and Fuel Efficiency metrics
// @route   GET /api/analytics/metrics
// @access  Private/Financial Analyst, Fleet Manager
export const getMetrics = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ isActive: true });

        const metrics = await Promise.all(vehicles.map(async (vehicle) => {
            const trips = await Trip.find({ vehicleId: vehicle._id, status: 'Completed', isActive: true });
            const maintenanceLogs = await Maintenance.find({ vehicleId: vehicle._id });
            const fuelLogs = await Fuel.find({ vehicleId: vehicle._id });

            // ROI = (revenue - maintenance - fuel) / acquisition cost
            const totalRevenue = trips.reduce((acc, t) => acc + (t.revenue || 0), 0);
            const totalMaintenance = maintenanceLogs.reduce((acc, m) => acc + m.cost, 0);
            const totalFuel = fuelLogs.reduce((acc, f) => acc + f.cost, 0);

            const roi = vehicle.acquisitionCost > 0
                ? ((totalRevenue - totalMaintenance - totalFuel) / vehicle.acquisitionCost) * 100
                : 0;

            // Fuel Efficiency = total distance / total liters
            const totalDistance = trips.reduce((acc, t) => {
                const dist = (t.endOdometer || 0) - (t.startOdometer || 0);
                return acc + (dist > 0 ? dist : 0);
            }, 0);

            const totalLiters = fuelLogs.reduce((acc, f) => acc + f.liters, 0);
            const fuelEfficiency = totalLiters > 0 ? totalDistance / totalLiters : 0;

            return {
                vehicle: {
                    id: vehicle._id,
                    model: vehicle.model,
                    licensePlate: vehicle.licensePlate
                },
                roi: roi.toFixed(2),
                fuelEfficiency: fuelEfficiency.toFixed(2),
                totalRevenue,
                totalMaintenance,
                totalFuel,
                totalDistance,
                totalLiters
            };
        }));

        res.json(metrics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recent activity feed for dashboard
// @route   GET /api/analytics/activity
// @access  Private
export const getActivityFeed = async (req, res) => {
    try {
        const [recentTrips, recentIncidents, recentMaintenance] = await Promise.all([
            Trip.find({ isActive: true }).sort('-createdAt').limit(5)
                .populate('vehicleId', 'model licensePlate')
                .populate('driverId', 'name'),
            Incident.find().sort('-createdAt').limit(5)
                .populate('driverId', 'name'),
            Maintenance.find().sort('-createdAt').limit(5)
                .populate('vehicleId', 'model licensePlate')
        ]);

        const events = [
            ...recentTrips.map(t => ({
                type: 'trip',
                icon: 'truck',
                title: `Trip ${t.status}`,
                detail: `${t.vehicleId?.model || 'Vehicle'} • Driver: ${t.driverId?.name || 'Unassigned'}`,
                color: t.status === 'Completed' ? 'emerald' : t.status === 'Dispatched' ? 'indigo' : 'slate',
                time: t.updatedAt || t.createdAt
            })),
            ...recentIncidents.map(i => ({
                type: 'incident',
                icon: 'shield',
                title: `${i.severity} Incident: ${i.type}`,
                detail: `Driver: ${i.driverId?.name || 'Unknown'} • Penalty: -${i.penaltyApplied}pts`,
                color: i.severity === 'Critical' ? 'rose' : i.severity === 'Medium' ? 'amber' : 'sky',
                time: i.createdAt
            })),
            ...recentMaintenance.map(m => ({
                type: 'maintenance',
                icon: 'wrench',
                title: `Maintenance: ${m.type}`,
                detail: `${m.vehicleId?.model || 'Vehicle'} • $${m.cost}`,
                color: m.status === 'Completed' ? 'emerald' : 'amber',
                time: m.createdAt
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
