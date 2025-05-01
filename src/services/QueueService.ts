import { v4 as uuidv4 } from 'uuid';

// Types of tasks that can be queued
export enum TaskType {
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_IMPORT = 'DATA_IMPORT',
  EMAIL_CAMPAIGN = 'EMAIL_CAMPAIGN',
  REPORT_GENERATION = 'REPORT_GENERATION',
  BULK_UPDATE = 'BULK_UPDATE',
  CANDIDATE_MATCHING = 'CANDIDATE_MATCHING',
}

// Status of a queued task
export enum TaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

// A task to be processed asynchronously
export interface QueuedTask<T = any> {
  id: string;
  type: TaskType;
  data: T;
  status: TaskStatus;
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  userId: string;
  priority: number;
}

// Options for creating a new task
interface CreateTaskOptions<T> {
  type: TaskType;
  data: T;
  userId: string;
  priority?: number; // 0 is highest, 10 is lowest
}

// Processing function signature
type TaskProcessor<T = any, R = any> = (task: QueuedTask<T>) => Promise<R>;

/**
 * A service for managing asynchronous tasks
 * This is a frontend mock of a real queue service that would typically run on the backend
 */
class QueueService {
  private static instance: QueueService;
  private tasks: Map<string, QueuedTask>;
  private processors: Map<TaskType, TaskProcessor>;
  private activeProcesses: number = 0;
  private maxConcurrent: number = 2; // Maximum number of concurrent tasks to process
  private listeners: Map<string, Array<(task: QueuedTask) => void>>;
  private isProcessing: boolean = false;

  private constructor() {
    this.tasks = new Map();
    this.processors = new Map();
    this.listeners = new Map();

    // Start processing tasks
    this.startProcessing();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  /**
   * Register a processor for a specific task type
   * @param taskType Type of task
   * @param processor Function to process tasks of this type
   */
  public registerProcessor<T, R>(taskType: TaskType, processor: TaskProcessor<T, R>): void {
    this.processors.set(taskType, processor as TaskProcessor);
  }

  /**
   * Add a task to the queue
   * @param options Task options
   * @returns The created task
   */
  public enqueue<T>(options: CreateTaskOptions<T>): QueuedTask<T> {
    const { type, data, userId, priority = 5 } = options;

    const task: QueuedTask<T> = {
      id: uuidv4(),
      type,
      data,
      status: TaskStatus.PENDING,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
      priority,
    };

    this.tasks.set(task.id, task);
    this.notifyListeners(task);
    console.log(`Task ${task.id} of type ${task.type} added to queue`);

    // Trigger processing if needed
    if (!this.isProcessing) {
      this.startProcessing();
    }

    return task;
  }

  /**
   * Get the status of a task
   * @param taskId Task ID
   * @returns The task or null if not found
   */
  public getTask<T>(taskId: string): QueuedTask<T> | null {
    return (this.tasks.get(taskId) as QueuedTask<T>) || null;
  }

  /**
   * Get all tasks for a user
   * @param userId User ID
   * @returns Array of tasks
   */
  public getUserTasks<T>(userId: string): QueuedTask<T>[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    ) as QueuedTask<T>[];
  }

  /**
   * Cancel a pending task
   * @param taskId Task ID
   * @returns True if task was cancelled, false if task was not found or already processing
   */
  public cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== TaskStatus.PENDING) {
      return false;
    }

    task.status = TaskStatus.CANCELLED;
    task.updatedAt = new Date();
    this.notifyListeners(task);
    return true;
  }

  /**
   * Subscribe to changes in a task's status
   * @param taskId Task ID
   * @param callback Function to call when task changes
   * @returns Unsubscribe function
   */
  public subscribeToTask(taskId: string, callback: (task: QueuedTask) => void): () => void {
    if (!this.listeners.has(taskId)) {
      this.listeners.set(taskId, []);
    }

    this.listeners.get(taskId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const taskListeners = this.listeners.get(taskId);
      if (taskListeners) {
        const index = taskListeners.indexOf(callback);
        if (index !== -1) {
          taskListeners.splice(index, 1);
        }
        if (taskListeners.length === 0) {
          this.listeners.delete(taskId);
        }
      }
    };
  }

  /**
   * Start processing tasks
   */
  private startProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processNextTasks();
  }

  /**
   * Process the next tasks in the queue
   */
  private processNextTasks(): void {
    if (this.activeProcesses >= this.maxConcurrent) {
      return;
    }

    // Get tasks sorted by priority (lower number = higher priority)
    const pendingTasks = Array.from(this.tasks.values())
      .filter((task) => task.status === TaskStatus.PENDING)
      .sort((a, b) => a.priority - b.priority);

    if (pendingTasks.length === 0) {
      if (this.activeProcesses === 0) {
        // No more tasks to process, stop processing
        this.isProcessing = false;
      }
      return;
    }

    // Process as many tasks as we can (up to maxConcurrent)
    const tasksToProcess = pendingTasks.slice(0, this.maxConcurrent - this.activeProcesses);

    for (const task of tasksToProcess) {
      this.processTask(task);
    }
  }

  /**
   * Process a single task
   * @param task Task to process
   */
  private async processTask(task: QueuedTask): Promise<void> {
    const processor = this.processors.get(task.type);
    if (!processor) {
      console.error(`No processor registered for task type ${task.type}`);
      task.status = TaskStatus.FAILED;
      task.error = `No processor registered for task type ${task.type}`;
      task.updatedAt = new Date();
      this.notifyListeners(task);
      return;
    }

    // Update task status to processing
    task.status = TaskStatus.PROCESSING;
    task.updatedAt = new Date();
    this.notifyListeners(task);

    this.activeProcesses++;

    try {
      // Execute the task processor
      const result = await processor(task);

      // Update task status to completed
      task.status = TaskStatus.COMPLETED;
      task.progress = 100;
      task.result = result;
      task.updatedAt = new Date();
      task.completedAt = new Date();

      console.log(`Task ${task.id} of type ${task.type} completed successfully`);
    } catch (error) {
      // Update task status to failed
      task.status = TaskStatus.FAILED;
      task.error = error instanceof Error ? error.message : String(error);
      task.updatedAt = new Date();

      console.error(`Task ${task.id} of type ${task.type} failed: ${task.error}`);
    } finally {
      this.activeProcesses--;
      this.notifyListeners(task);

      // Process next tasks
      this.processNextTasks();
    }
  }

  /**
   * Update task progress
   * @param taskId Task ID
   * @param progress Progress (0-100)
   */
  public updateTaskProgress(taskId: string, progress: number): void {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== TaskStatus.PROCESSING) {
      return;
    }

    task.progress = Math.min(Math.max(0, progress), 99); // Keep under 100 until complete
    task.updatedAt = new Date();
    this.notifyListeners(task);
  }

  /**
   * Notify all listeners for a task
   * @param task Task that changed
   */
  private notifyListeners(task: QueuedTask): void {
    const taskListeners = this.listeners.get(task.id);
    if (taskListeners) {
      for (const listener of taskListeners) {
        try {
          listener(task);
        } catch (error) {
          console.error(`Error notifying listener for task ${task.id}:`, error);
        }
      }
    }
  }

  /**
   * Clean up completed and failed tasks older than the given age
   * @param maxAgeMs Maximum age in milliseconds (default: 1 day)
   */
  public cleanupOldTasks(maxAgeMs: number = 86400000): void {
    const cutoffTime = new Date(Date.now() - maxAgeMs);

    for (const [taskId, task] of this.tasks.entries()) {
      if (
        (task.status === TaskStatus.COMPLETED ||
          task.status === TaskStatus.FAILED ||
          task.status === TaskStatus.CANCELLED) &&
        task.updatedAt < cutoffTime
      ) {
        this.tasks.delete(taskId);
        this.listeners.delete(taskId);
      }
    }
  }
}

// Export singleton instance
export default QueueService;
export const queueService = QueueService.getInstance();
