/**
 * @template T
 * @typedef {Object} Success
 * @property {T} data - The successful result
 * @property {null} error - Always null on success
 */

/**
 * @template E
 * @typedef {Object} Failure
 * @property {null} data - Always null on failure
 * @property {E} error - The error object
 */

/**
 * @template T
 * @template E
 * @typedef {Success<T> | Failure<E>} Result
 */

/**
 * Executes an async operation and returns a Result object.
 *
 * @template T
 * @template E
 * @param {Promise<T> | (() => Promise<T>)} operation - The async operation or function returning a promise
 * @returns {Promise<Result<T, E>>}
 *
 * @example
 * const { data, error } = await useTryCatch(fetchJSON(url));
 * const { data, error } = await useTryCatch(() => fetchJSON(url));
 */
export const useTryCatch = async (operation) => {
  try {
    const data =
      operation instanceof Function ? await operation() : await operation;
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};
