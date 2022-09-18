// Black color for one pixel
export const BLACK = 0xFF000000;
// White color for one pixel
export const WHITE = 0xFFFFFFFF;
// Size of the grid
export const SIZE = 1000;
// The number of threads 
export const THREADS = 5; // must be a divisor of SIZE

// The image memory used for handling the logic 
export const imageOffset = 2 * SIZE * SIZE;
export const syncOffset = imageOffset + 4 * SIZE * SIZE;