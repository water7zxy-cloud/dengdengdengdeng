import { roles } from './content'
import type { RoleId } from './rules'

export const roleFor = (role: RoleId) => roles.find((candidate) => candidate.id === role)!
export const randomCard = () => Math.floor(Math.random() * 20) + 1
