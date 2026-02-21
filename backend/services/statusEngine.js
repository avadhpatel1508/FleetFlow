import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';

/**
 * Handle system state transitions automatically
 */
export const statusEngine = {

    // When a trip is Dispatched
    dispatchTrip: async (vehicleId, driverId, req) => {
        const vehicle = await Vehicle.findById(vehicleId);
        const driver = await Driver.findById(driverId);

        if (vehicle.status !== 'Available') {
            throw new Error('Vehicle is not currently available for dispatch');
        }

        let driverValid = true;
        if (new Date(driver.licenseExpiryDate) < new Date()) driverValid = false;
        if (!driverValid) throw new Error('Driver license is expired. Cannot be assigned.');

        if (driver.status !== 'Off Duty') {
            throw new Error(`Driver cannot be assigned because they are currently ${driver.status}`);
        }

        vehicle.status = 'On Trip';
        await vehicle.save();

        driver.status = 'On Duty';
        await driver.save();

        // Emit real-time status updates
        if (req && req.app) {
            req.app.get('io').emit('vehicleUpdated', vehicle);
            req.app.get('io').emit('driverUpdated', driver);
        }

        return { vehicle, driver };
    },

    // When a trip is Completed
    completeTrip: async (vehicleId, driverId, endOdometer, req) => {
        const vehicle = await Vehicle.findById(vehicleId);
        const driver = await Driver.findById(driverId);

        vehicle.status = 'Available';
        vehicle.odometer = endOdometer;
        await vehicle.save();

        driver.status = 'Off Duty';
        await driver.save();

        // Emit real-time status updates
        if (req && req.app) {
            req.app.get('io').emit('vehicleUpdated', vehicle);
            req.app.get('io').emit('driverUpdated', driver);
        }

        return { vehicle, driver };
    },

    // When a trip is Cancelled
    cancelTrip: async (vehicleId, driverId, req) => {
        const vehicle = await Vehicle.findById(vehicleId);
        const driver = await Driver.findById(driverId);

        vehicle.status = 'Available';
        await vehicle.save();

        driver.status = 'Off Duty';
        await driver.save();

        if (req && req.app) {
            req.app.get('io').emit('vehicleUpdated', vehicle);
            req.app.get('io').emit('driverUpdated', driver);
        }
    },

    // When maintenance is logged
    logMaintenance: async (vehicleId, req) => {
        const vehicle = await Vehicle.findById(vehicleId);

        if (vehicle.status === 'On Trip') {
            throw new Error('Cannot log maintenance for a vehicle currently On Trip');
        }

        vehicle.status = 'In Shop';
        await vehicle.save();

        if (req && req.app) {
            req.app.get('io').emit('vehicleUpdated', vehicle);
        }

        return vehicle;
    }
};
