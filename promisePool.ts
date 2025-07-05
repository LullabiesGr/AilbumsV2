/**
 * Promise pool utility for controlling concurrency
 * Processes tasks with a maximum number of concurrent operations
 */
export async function promisePool<T>(
  tasks: (() => Promise<T>)[], 
  concurrency = 2
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let taskIndex = 0;

  async function worker(): Promise<void> {
    while (taskIndex < tasks.length) {
      const currentIndex = taskIndex++;
      try {
        results[currentIndex] = await tasks[currentIndex]();
      } catch (error) {
        // Store the error in results - caller can handle it
        results[currentIndex] = error as T;
      }
    }
  }

  // Create worker promises up to concurrency limit
  const workers = Array(Math.min(concurrency, tasks.length))
    .fill(0)
    .map(() => worker());

  await Promise.all(workers);
  return results;
}

/**
 * Promise pool with progress tracking
 * Calls onProgress after each task completion
 */
export async function promisePoolWithProgress<T>(
  tasks: (() => Promise<T>)[], 
  concurrency = 2,
  onProgress?: (completed: number, total: number, currentTasks: string[]) => void
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  const taskNames: string[] = new Array(tasks.length);
  const activeTasks = new Set<string>();
  let taskIndex = 0;
  let completedCount = 0;

  async function worker(): Promise<void> {
    while (taskIndex < tasks.length) {
      const currentIndex = taskIndex++;
      const taskName = `Task ${currentIndex + 1}`;
      taskNames[currentIndex] = taskName;
      
      activeTasks.add(taskName);
      
      // Update progress with current active tasks
      if (onProgress) {
        onProgress(completedCount, tasks.length, Array.from(activeTasks));
      }

      try {
        results[currentIndex] = await tasks[currentIndex]();
      } catch (error) {
        results[currentIndex] = error as T;
      }

      activeTasks.delete(taskName);
      completedCount++;
      
      // Update progress after completion
      if (onProgress) {
        onProgress(completedCount, tasks.length, Array.from(activeTasks));
      }
    }
  }

  // Create worker promises up to concurrency limit
  const workers = Array(Math.min(concurrency, tasks.length))
    .fill(0)
    .map(() => worker());

  await Promise.all(workers);
  return results;
}