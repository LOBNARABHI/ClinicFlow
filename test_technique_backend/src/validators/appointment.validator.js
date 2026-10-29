const { z } = require('zod');

const statusEnum = z.enum(['pending', 'confirmed', 'cancelled']);

// Création d'un rendez-vous
const createAppointmentSchema = z.object({
  patientId: z.string().uuid('patientId invalide'),
  // Date + heure au format ISO, ex : 2026-11-05T10:30:00Z
  appointmentDate: z.string().datetime({ offset: true, message: 'Date invalide (format ISO attendu)' }),
  // Statut optionnel, "pending" par défaut
  status: statusEnum.default('pending'),
  reason: z.string().trim().min(2, 'Motif requis').max(255),
  notes: z.string().trim().max(2000).optional().nullable(),
});

// Filtres de la liste : date (YYYY-MM-DD) et statut, tous deux optionnels
const listAppointmentsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : YYYY-MM-DD').optional(),
  status: statusEnum.optional(),
});

// Changement de statut
const updateStatusSchema = z.object({
  status: statusEnum,
});

module.exports = { createAppointmentSchema, listAppointmentsSchema, updateStatusSchema };