import Step, { IStep } from "../models/step.model";
import Path from "../models/path.model";
import { CustomError } from "../middleware/errorHandler";

export interface CreateStepData {
  title: string;
  description: string;
  resourceLinks?: string[];
  order: number;
  pathId: string;
}

export interface UpdateStepData {
  title?: string;
  description?: string;
  resourceLinks?: string[];
  order?: number;
}

export class StepService {
  /**
   * Add a new step to a path
   */
  static async addStepToPath(stepData: CreateStepData): Promise<IStep> {
    try {
      // Verify that the path exists
      const path = await Path.findById(stepData.pathId);
      if (!path) {
        const error = new Error("Path not found") as CustomError;
        error.statusCode = 404;
        throw error;
      }

      // Create the step
      const step = new Step(stepData);
      await step.save();

      // Add step to path's steps array
      await Path.findByIdAndUpdate(stepData.pathId, {
        $push: { steps: step._id },
      });

      return step;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }

      if (error.name === "ValidationError") {
        const customError = new Error("Invalid step data") as CustomError;
        customError.statusCode = 400;
        throw customError;
      }

      if (error.code === 11000) {
        const customError = new Error(
          "Step order must be unique within the path"
        ) as CustomError;
        customError.statusCode = 409;
        throw customError;
      }

      const customError = new Error("Failed to create step") as CustomError;
      customError.statusCode = 500;
      throw customError;
    }
  }

  /**
   * Get step by ID
   */
  static async getStepById(id: string): Promise<IStep | null> {
    try {
      const step = await Step.findById(id).populate("pathId", "title category");

      if (!step) {
        const error = new Error("Step not found") as CustomError;
        error.statusCode = 404;
        throw error;
      }

      return step;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }

      if (error.name === "CastError") {
        const customError = new Error("Invalid step ID") as CustomError;
        customError.statusCode = 400;
        throw customError;
      }

      const customError = new Error("Failed to fetch step") as CustomError;
      customError.statusCode = 500;
      throw customError;
    }
  }

  /**
   * Update step by ID
   */
  static async updateStep(
    id: string,
    updateData: UpdateStepData
  ): Promise<IStep | null> {
    try {
      const step = await Step.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate("path", "title category");

      if (!step) {
        const error = new Error("Step not found") as CustomError;
        error.statusCode = 404;
        throw error;
      }

      return step;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        const customError = new Error("Invalid step data") as CustomError;
        customError.statusCode = 400;
        throw customError;
      }

      if (error.name === "CastError") {
        const customError = new Error("Invalid step ID") as CustomError;
        customError.statusCode = 400;
        throw customError;
      }

      if (error.code === 11000) {
        const customError = new Error(
          "Step order must be unique within the path"
        ) as CustomError;
        customError.statusCode = 409;
        throw customError;
      }

      const customError = new Error("Failed to update step") as CustomError;
      customError.statusCode = 500;
      throw customError;
    }
  }

  /**
   * Delete step by ID
   */
  static async deleteStep(id: string): Promise<void> {
    try {
      const step = await Step.findById(id);
      if (!step) {
        const error = new Error("Step not found") as CustomError;
        error.statusCode = 404;
        throw error;
      }

      // Remove step from path's steps array
      await Path.findByIdAndUpdate(step.path, {
        $pull: { steps: step._id },
      });

      // Delete the step
      await Step.findByIdAndDelete(id);
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }

      if (error.name === "CastError") {
        const customError = new Error("Invalid step ID") as CustomError;
        customError.statusCode = 400;
        throw customError;
      }

      const customError = new Error("Failed to delete step") as CustomError;
      customError.statusCode = 500;
      throw customError;
    }
  }

  /**
   * Mark step as completed by user
   */
  static async markStepCompletedByUser(
    stepId: string,
    userId: string
  ): Promise<IStep | null> {
    try {
      const step = await Step.findById(stepId);
      if (!step) {
        const error = new Error("Step not found") as CustomError;
        error.statusCode = 404;
        throw error;
      }

      // Check if user has already completed this step
      const userObjectId = userId as any;
      const isCompleted = step.completedBy.some(
        (id) => id.toString() === userObjectId.toString()
      );

      if (isCompleted) {
        const error = new Error(
          "Step already completed by this user"
        ) as CustomError;
        error.statusCode = 409;
        throw error;
      }

      // Add user to completedBy array
      const updatedStep = await Step.findByIdAndUpdate(
        stepId,
        { $push: { completedBy: userObjectId } },
        { new: true }
      ).populate("path", "title category");

      return updatedStep;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }

      if (error.name === "CastError") {
        const customError = new Error("Invalid step or user ID") as CustomError;
        customError.statusCode = 400;
        throw customError;
      }

      const customError = new Error(
        "Failed to mark step as completed"
      ) as CustomError;
      customError.statusCode = 500;
      throw customError;
    }
  }

  /**
   * Mark step as incomplete by user (remove from completedBy)
   */
  static async markStepIncompleteByUser(
    stepId: string,
    userId: string
  ): Promise<IStep | null> {
    try {
      const step = await Step.findById(stepId);
      if (!step) {
        const error = new Error("Step not found") as CustomError;
        error.statusCode = 404;
        throw error;
      }

      // Check if user has completed this step
      const userObjectId = userId as any;
      const isCompleted = step.completedBy.some(
        (id) => id.toString() === userObjectId.toString()
      );

      if (!isCompleted) {
        const error = new Error(
          "Step not completed by this user"
        ) as CustomError;
        error.statusCode = 409;
        throw error;
      }

      // Remove user from completedBy array
      const updatedStep = await Step.findByIdAndUpdate(
        stepId,
        { $pull: { completedBy: userObjectId } },
        { new: true }
      ).populate("path", "title category");

      return updatedStep;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }

      if (error.name === "CastError") {
        const customError = new Error("Invalid step or user ID") as CustomError;
        customError.statusCode = 400;
        throw customError;
      }

      const customError = new Error(
        "Failed to mark step as incomplete"
      ) as CustomError;
      customError.statusCode = 500;
      throw customError;
    }
  }

  /**
   * Get steps by path ID
   */
  static async getStepsByPath(pathId: string): Promise<IStep[]> {
    try {
      console.log('StepService: Querying for steps with path ID:', pathId);

      const steps = await Step.find({ path: pathId })
        .populate("completedBy", "name email")
        .sort({ order: 1 });

      console.log('StepService: Found', steps.length, 'steps for path', pathId);

      // Log the first step if any exist
      if (steps.length > 0) {
        console.log('StepService: First step:', {
          id: steps[0]._id,
          name: steps[0].name,
          path: steps[0].path
        });
      }

      return steps;
    } catch (error: any) {
      console.log('StepService: Error querying steps:', error.message);
      if (error.name === "CastError") {
        const customError = new Error("Invalid path ID") as CustomError;
        customError.statusCode = 400;
        throw customError;
      }

      const customError = new Error("Failed to fetch steps") as CustomError;
      customError.statusCode = 500;
      throw customError;
    }
  }

  /**
   * Debug: Get all steps in database
   */
  static async getAllStepsForDebug(): Promise<IStep[]> {
    try {
      console.log('StepService: Getting ALL steps for debugging');

      const steps = await Step.find({})
        .populate("path", "title category")
        .sort({ createdAt: -1 });

      console.log('StepService: Found', steps.length, 'total steps in database');

      // Log details of each step
      steps.forEach((step, index) => {
        console.log(`Step ${index + 1}:`, {
          id: step._id,
          name: step.name,
          path: step.path,
          pathTitle: (step as any).path?.title || 'Unknown',
          order: step.order,
          createdAt: step.createdAt
        });
      });

      return steps;
    } catch (error: any) {
      console.log('StepService: Error getting all steps:', error.message);
      const customError = new Error("Failed to fetch all steps") as CustomError;
      customError.statusCode = 500;
      throw customError;
    }
  }

  /**
   * Get user's completed steps
   */
  static async getUserCompletedSteps(userId: string): Promise<IStep[]> {
    try {
      const steps = await Step.find({ completedBy: userId })
        .populate("path", "title category")
        .sort({ updatedAt: -1 });

      return steps;
    } catch (error: any) {
      if (error.name === "CastError") {
        const customError = new Error("Invalid user ID") as CustomError;
        customError.statusCode = 400;
        throw customError;
      }

      const customError = new Error(
        "Failed to fetch completed steps"
      ) as CustomError;
      customError.statusCode = 500;
      throw customError;
    }
  }

  /**
   * Get user progress for a specific path
   */
  static async getUserProgress(userId: string, pathId: string): Promise<{
    pathId: string;
    totalSteps: number;
    completedSteps: string[];
    completionRate: number;
    completedCount: number;
    remainingSteps: Array<{
      id: string;
      title: string;
      order: number;
      description: string;
    }>;
  }> {
    try {
      // Get all steps in the path
      const allSteps = await Step.find({ path: pathId }).sort({ order: 1 });

      if (allSteps.length === 0) {
        const error = new Error("No steps found for this path") as CustomError;
        error.statusCode = 404;
        throw error;
      }

      // Get completed steps by user
      const completedSteps = allSteps
        .filter(step => step.completedBy.some(id => id.toString() === userId))
        .map(step => (step._id as any).toString());

      const totalSteps = allSteps.length;
      const completedCount = completedSteps.length;
      const completionRate = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

      // Get remaining steps
      const remainingSteps = allSteps
        .filter(step => !completedSteps.includes((step._id as any).toString()))
        .map(step => ({
          id: (step._id as any).toString(),
          title: step.title,
          order: step.order,
          description: step.description
        }));

      return {
        pathId,
        totalSteps,
        completedSteps,
        completionRate: Math.round(completionRate * 100) / 100, // Round to 2 decimal places
        completedCount,
        remainingSteps
      };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }

      if (error.name === "CastError") {
        const customError = new Error("Invalid user or path ID") as CustomError;
        customError.statusCode = 400;
        throw customError;
      }

      const customError = new Error("Failed to get user progress") as CustomError;
      customError.statusCode = 500;
      throw customError;
    }
  }

  /**
   * Get step completion statistics
   */
  static async getStepCompletionStats(stepId: string): Promise<{
    totalCompletions: number;
    completedBy: Array<{ id: string; name: string; email: string }>;
  }> {
    try {
      const step = await Step.findById(stepId).populate(
        "completedBy",
        "name email"
      );

      if (!step) {
        const error = new Error("Step not found") as CustomError;
        error.statusCode = 404;
        throw error;
      }

      return {
        totalCompletions: step.completedBy.length,
        completedBy: step.completedBy.map((user) => ({
          id: (user as any)._id.toString(),
          name: (user as any).name,
          email: (user as any).email,
        })),
      };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }

      if (error.name === "CastError") {
        const customError = new Error("Invalid step ID") as CustomError;
        customError.statusCode = 400;
        throw customError;
      }

      const customError = new Error(
        "Failed to get completion statistics"
      ) as CustomError;
      customError.statusCode = 500;
      throw customError;
    }
  }
}

export default StepService;
