const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/appointment.service');
const {
  createAppointmentSchema,
  listAppointmentsSchema,
  updateStatusSchema,
} = require('../validators/appointment.validator');

// POST /api/appointments
exports.create = asyncHandler(async (req, res) => {
  const data = createAppointmentSchema.parse(req.body);
  res.status(201).json(await service.create(data, req.user.id));
});

// GET /api/appointments?date=&status=
exports.list = asyncHandler(async (req, res) => {
  const filters = listAppointmentsSchema.parse(req.query);
  res.json(await service.list(filters));
});

// PATCH /api/appointments/:id/status
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = updateStatusSchema.parse(req.body);
  res.json(await service.updateStatus(req.params.id, status));
});

// GET /api/patients/:id/appointments
exports.listByPatient = asyncHandler(async (req, res) => {
  res.json(await service.listByPatient(req.params.id));
});