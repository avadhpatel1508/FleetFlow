import Driver from '../models/Driver.js';
import { logAction } from '../services/auditService.js';

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
export const getDrivers = async (req, res) => {
    try {
        const query = { isActive: true };
        if (req.query.status) query.status = req.query.status;

        const drivers = await Driver.find(query);
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single driver
// @route   GET /api/drivers/:id
// @access  Private
export const getDriverById = async (req, res) => {
    try {
        const driver = await Driver.findOne({ _id: req.params.id, isActive: true });
        if (driver) {
            res.json(driver);
        } else {
            res.status(404).json({ message: 'Driver not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a driver
// @route   POST /api/drivers
// @access  Private/Fleet Manager
export const createDriver = async (req, res) => {
    try {
        const { name, licenseExpiryDate, allowedVehicleType } = req.body;

        const driver = await Driver.create({
            name,
            licenseExpiryDate,
            allowedVehicleType,
            safetyScore: 100,
            completionRate: 100,
            status: 'Off Duty'
        });

        req.app.get('io').emit('driverCreated', driver);

        await logAction(req, 'Create', 'Driver', driver._id, { name });

        res.status(201).json(driver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a driver
// @route   PUT /api/drivers/:id
// @access  Private/Fleet Manager
export const updateDriver = async (req, res) => {
    try {
        const driver = await Driver.findOne({ _id: req.params.id, isActive: true });

        if (driver) {
            const previousStatus = driver.status;

            driver.name = req.body.name || driver.name;
            driver.licenseExpiryDate = req.body.licenseExpiryDate || driver.licenseExpiryDate;
            driver.allowedVehicleType = req.body.allowedVehicleType || driver.allowedVehicleType;
            driver.safetyScore = req.body.safetyScore !== undefined ? req.body.safetyScore : driver.safetyScore;
            driver.completionRate = req.body.completionRate !== undefined ? req.body.completionRate : driver.completionRate;
            driver.status = req.body.status || driver.status;

            const updatedDriver = await driver.save();

            req.app.get('io').emit('driverUpdated', updatedDriver);

            if (previousStatus !== driver.status) {
                await logAction(req, 'StatusChange', 'Driver', driver._id, { from: previousStatus, to: driver.status });
            } else {
                await logAction(req, 'Update', 'Driver', driver._id, { note: 'Driver details updated' });
            }

            res.json(updatedDriver);
        } else {
            res.status(404).json({ message: 'Driver not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Soft Delete a driver
// @route   DELETE /api/drivers/:id
// @access  Private/Fleet Manager
export const deleteDriver = async (req, res) => {
    try {
        const driver = await Driver.findOne({ _id: req.params.id, isActive: true });

        if (driver) {
            if (driver.status === 'On Duty') {
                return res.status(400).json({ message: 'Cannot delete a driver currently On Duty' });
            }

            driver.isActive = false;
            driver.status = 'Suspended';
            await driver.save();

            req.app.get('io').emit('driverDeleted', req.params.id);
            req.app.get('io').emit('driverUpdated', driver);

            await logAction(req, 'Delete', 'Driver', driver._id, { note: 'Soft deleted' });

            res.json({ message: 'Driver removed' });
        } else {
            res.status(404).json({ message: 'Driver not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
