import type { BuildAction } from 'remix/fetch-router'
import { redirect } from 'remix/response/redirect'

import type { routes } from '../routes.ts'

export const home: BuildAction<'GET', typeof routes.home> = {
  handler() {
    return redirect('/story-app')
  },
}
