import { cache } from 'react'
import { auth } from './auth'

// Deduplicate auth() calls within the same request via React.cache().
// Multiple server components calling getSession() share one session lookup.
export const getSession = cache(auth)
