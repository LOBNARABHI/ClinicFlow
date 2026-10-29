const { z } = require('zod');

// Schéma de création : les champs obligatoires du sujet
const createPatientSchema = z.object({
  fullName: z.string().trim().min(2, 'Nom trop court').max(120),
  cin: z.string().trim().min(4, 'CIN invalide').max(20).transform(v => v.toUpperCase()),
  phone: z.string().trim().regex(/^[0-9+\s-]{8,20}$/, 'Téléphone invalide'),
  // Format attendu : YYYY-MM-DD, et pas de date dans le futur
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : YYYY-MM-DD')
    .refine(d => new Date(d) <= new Date(), 'Date de naissance dans le futur'),
  // Adresse optionnelle
  address: z.string().trim().max(500).optional().nullable(),
});

// Pour la modification : on réutilise le même schéma (PUT = remplacement complet)
const updatePatientSchema = createPatientSchema;

// Paramètres de la liste : recherche + pagination (convertis en nombres)
const listPatientsSchema = z.object({
  search: z.string().trim().optional().default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

module.exports = { createPatientSchema, updatePatientSchema, listPatientsSchema };