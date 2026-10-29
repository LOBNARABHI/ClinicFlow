const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/patient.service');
const {
  createPatientSchema,
  updatePatientSchema,
  listPatientsSchema,
} = require('../validators/patient.validator');

// POST /api/patients
exports.create = asyncHandler(async (req, res) => {
  const data = createPatientSchema.parse(req.body);
  res.status(201).json(await service.create(data));
});

// GET /api/patients?search=&page=&limit=
exports.list = asyncHandler(async (req, res) => {
  const query = listPatientsSchema.parse(req.query);
  res.json(await service.list(query));
});

// GET /api/patients/:id
exports.getById = asyncHandler(async (req, res) => {
  res.json(await service.getById(req.params.id));
});

// PUT /api/patients/:id
exports.update = asyncHandler(async (req, res) => {
  const data = updatePatientSchema.parse(req.body);
  res.json(await service.update(req.params.id, data));
});

// DELETE /api/patients/:id (admin)
exports.remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.status(204).send();
});