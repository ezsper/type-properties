/**
 * A helper function to intrinsic inject type
 * @param type
 */
export function asType<T>(type: any): T {
  return type as any;
}