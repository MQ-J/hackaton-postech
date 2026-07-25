import { z } from 'zod'

function parseBrDate(value: string): string | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const [, dd, mm, yyyy] = match
  const date = new Date(`${yyyy}-${mm}-${dd}`)
  if (isNaN(date.getTime())) return null
  return `${yyyy}-${mm}-${dd}`
}

export const taskSchema = z.object({
  title: z
    .string()
    .max(120, 'Título deve ter no máximo 120 caracteres')
    .optional(),

  description: z
    .string()
    .max(120, 'Descrição deve ter no máximo 120 caracteres')
    .optional(),

})

export type TaskFormValues = z.infer<typeof taskSchema>

export function formDateToIso(dateBr: string): string {
  return parseBrDate(dateBr) ?? dateBr
}

export function isoToFormDate(isoDate: string): string {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return isoDate
  return `${match[3]}/${match[2]}/${match[1]}`
}
