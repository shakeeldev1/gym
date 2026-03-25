import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Marks an endpoint as admin-only in Swagger by adding a 403 response note.
 * Keep this lightweight so it doesn't overwrite existing ApiOperation metadata.
 */
export function ApiAdminOnly() {
  return applyDecorators(
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
  );
}
