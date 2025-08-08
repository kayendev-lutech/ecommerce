/**
 * HTTP Response utility class for standardized API responses
 */
export class HttpResponse {
  /**
   * Success response (200)
   * @param data Response data
   * @param message Success message
   */
  static ok<T>(data?: T, message = 'Success') {
    return {
      status: 200,
      data,
      message,
    };
  }

  /**
   * Created response (201)
   * @param data Response data
   * @param message Success message
   */
  static created<T>(data?: T, message = 'Created') {
    return {
      status: 201,
      data,
      message,
    };
  }

  /**
   * No Content response (204)
   * @param message Optional message
   */
  static noContent(message = 'No Content') {
    return {
      status: 204,
      message,
    };
  }

  /**
   * Accepted response (202)
   * @param data Response data
   * @param message Success message
   */
  static accepted<T>(data?: T, message = 'Accepted') {
    return {
      status: 202,
      data,
      message,
    };
  }

  /**
   * Paginated response (200) with pagination metadata
   * @param data Array of items
   * @param total Total count
   * @param page Current page
   * @param limit Items per page
   * @param message Success message
   */
  static paginated<T>(data: T[], total: number, page: number, limit: number, message = 'Success') {
    const totalPages = Math.ceil(total / limit);
    return {
      status: 200,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
