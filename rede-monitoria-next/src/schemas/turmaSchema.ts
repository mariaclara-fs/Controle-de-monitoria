import { z } from "zod";

const nomeRegex = /^[A-Za-zÀ-ÿ0-9\s-]+$/;
const cursoRegex = /^[A-Za-zÀ-ÿ\s]+$/;

export const turmaSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "Informe um nome válido.")
    .max(100, "O nome da turma deve ter no máximo 100 caracteres.")
    .regex(
      nomeRegex,
      "Apenas letras, números, espaços e hífen são permitidos."
    ),

  curso: z
    .string()
    .trim()
    .min(3, "Informe um curso válido.")
    .max(60, "O curso deve ter no máximo 60 caracteres.")
    .regex(
      cursoRegex,
      "Apenas letras e espaços são permitidos."
    ),
});

export type TurmaFormData = z.infer<typeof turmaSchema>;