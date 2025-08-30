import { Request, Response, NextFunction } from "express";
import StepService, {
  CreateStepData,
  UpdateStepData,
} from "../services/step.service";
import { sendSuccessResponse, sendErrorResponse } from "../utils/helpers";
import { HTTP_STATUS } from "../utils/constants";

export class StepController {
  /**
   * Add a new step to a path
   * POST /api/steps/:pathId
   */
  static async addStepToPath(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { pathId } = req.params;
      const { name, description, resourceLinks, order } =
        req.body;

      // Validate required fields
      if (!name || !description || order === undefined) {
        sendErrorResponse(
          res,
          "Name, description, and order are required",
          HTTP_STATUS.BAD_REQUEST
        );
        return;
      }

      // Create step data
      const stepData: CreateStepData = {
        name,
        description,
        path: pathId,
        order,
        resourceLinks: resourceLinks || [],
      };

      const step = await StepService.addStepToPath(stepData);

      sendSuccessResponse(
        res,
        "Step added successfully",
        {
          step: {
            id: step.id,
            name: step.name,
            description: step.description,
            resourceLinks: step.resourceLinks,
            order: step.order,
            path: step.path,
            completedBy: step.completedBy,
            completionCount: step.completionCount,
            createdAt: step.createdAt,
            updatedAt: step.updatedAt,
          },
        },
        HTTP_STATUS.CREATED
      );
    } catch (error: any) {
      // Handle specific errors
      if (error.message === "Path not found") {
        sendErrorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
        return;
      }

      if (
        error.message === "Invalid step data" ||
        error.message === "Step order must be unique within the path"
      ) {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
        return;
      }

      sendErrorResponse(
        res,
        "Failed to add step",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update step by ID
   * PUT /api/steps/:id
   */
  static async updateStep(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateStepData = req.body;

      const step = await StepService.updateStep(id, updateData);

      sendSuccessResponse(res, "Step updated successfully", {
        step: {
          id: step!.id,
          name: step!.name,
          description: step!.description,
          resourceLinks: step!.resourceLinks,
          order: step!.order,
          path: step!.path,
          completedBy: step!.completedBy,
          completionCount: step!.completionCount,
          createdAt: step!.createdAt,
          updatedAt: step!.updatedAt,
        },
      });
    } catch (error: any) {
      // Handle specific errors
      if (error.message === "Step not found") {
        sendErrorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
        return;
      }

      if (
        error.message === "Invalid step data" ||
        error.message === "Invalid step ID" ||
        error.message === "Step order must be unique within the path"
      ) {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
        return;
      }

      sendErrorResponse(
        res,
        "Failed to update step",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Delete step by ID
   * DELETE /api/steps/:id
   */
  static async deleteStep(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      await StepService.deleteStep(id);

      sendSuccessResponse(res, "Step deleted successfully");
    } catch (error: any) {
      // Handle specific errors
      if (error.message === "Step not found") {
        sendErrorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
        return;
      }

      if (error.message === "Invalid step ID") {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
        return;
      }

      sendErrorResponse(
        res,
        "Failed to delete step",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Mark step as completed by user
   * PATCH /api/steps/:id/complete
   */
  static async markStepCompleted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.user) {
        sendErrorResponse(
          res,
          "User not authenticated",
          HTTP_STATUS.UNAUTHORIZED
        );
        return;
      }

      const step = await StepService.markStepCompletedByUser(id, req.user.id);

      sendSuccessResponse(res, "Step marked as completed", {
        step: {
          id: step!.id,
          name: step!.name,
          description: step!.description,
          resourceLinks: step!.resourceLinks,
          order: step!.order,
          path: step!.path,
          completedBy: step!.completedBy,
          completionCount: step!.completionCount,
          createdAt: step!.createdAt,
          updatedAt: step!.updatedAt,
        },
      });
    } catch (error: any) {
      // Handle specific errors
      if (error.message === "Step not found") {
        sendErrorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
        return;
      }

      if (error.message === "Step already completed by this user") {
        sendErrorResponse(res, error.message, HTTP_STATUS.CONFLICT);
        return;
      }

      if (error.message === "Invalid step or user ID") {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
        return;
      }

      sendErrorResponse(
        res,
        "Failed to mark step as completed",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Mark step as incomplete by user
   * PATCH /api/steps/:id/incomplete
   */
  static async markStepIncomplete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.user) {
        sendErrorResponse(
          res,
          "User not authenticated",
          HTTP_STATUS.UNAUTHORIZED
        );
        return;
      }

      const step = await StepService.markStepIncompleteByUser(id, req.user.id);

      sendSuccessResponse(res, "Step marked as incomplete", {
        step: {
          id: step!.id,
          name: step!.name,
          description: step!.description,
          resourceLinks: step!.resourceLinks,
          order: step!.order,
          path: step!.path,
          completedBy: step!.completedBy,
          completionCount: step!.completionCount,
          createdAt: step!.createdAt,
          updatedAt: step!.updatedAt,
        },
      });
    } catch (error: any) {
      // Handle specific errors
      if (error.message === "Step not found") {
        sendErrorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
        return;
      }

      if (error.message === "Step not completed by this user") {
        sendErrorResponse(res, error.message, HTTP_STATUS.CONFLICT);
        return;
      }

      if (error.message === "Invalid step or user ID") {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
        return;
      }

      sendErrorResponse(
        res,
        "Failed to mark step as incomplete",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get steps by path ID
   * GET /api/steps/path/:pathId
   */
  static async getStepsByPath(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { pathId } = req.params;

      console.log("StepController: Getting steps for path ID:", pathId);

      const steps = await StepService.getStepsByPath(pathId);

      console.log("StepController: Found steps:", steps.length, "steps");

      sendSuccessResponse(res, "Steps retrieved successfully", {
        steps: steps.map((step) => ({
          id: step.id,
          name: step.name,
          description: step.description,
          resourceLinks: step.resourceLinks,
          order: step.order,
          path: step.path,
          completedBy: step.completedBy,
          completionCount: step.completionCount,
          createdAt: step.createdAt,
          updatedAt: step.updatedAt,
        })),
        total: steps.length,
      });
    } catch (error: any) {
      console.log("StepController: Error getting steps:", error.message);
      if (error.message === "Invalid path ID") {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
        return;
      }

      sendErrorResponse(
        res,
        "Failed to fetch steps",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Debug: Get all steps in database
   * GET /api/steps/debug/all
   */
  static async getAllStepsDebug(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log("StepController: Getting ALL steps for debugging");

      const steps = await StepService.getAllStepsForDebug();

      console.log(
        "StepController: Found",
        steps.length,
        "total steps in database"
      );

      sendSuccessResponse(res, "All steps retrieved for debugging", {
        steps: steps.map((step) => ({
          id: step.id,
          name: step.name,
          description: step.description,
          path: step.path,
          order: step.order,
          resourceLinks: step.resourceLinks,
          completedBy: step.completedBy,
          completionCount: step.completionCount,
          createdAt: step.createdAt,
          updatedAt: step.updatedAt,
          // Show the full step object for debugging
          fullStep: step,
        })),
        total: steps.length,
      });
    } catch (error: any) {
      console.log("StepController: Error getting all steps:", error.message);
      sendErrorResponse(
        res,
        "Failed to fetch all steps",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get user's completed steps
   * GET /api/steps/completed
   */
  static async getUserCompletedSteps(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        sendErrorResponse(
          res,
          "User not authenticated",
          HTTP_STATUS.UNAUTHORIZED
        );
        return;
      }

      const steps = await StepService.getUserCompletedSteps(req.user.id);

      sendSuccessResponse(res, "Completed steps retrieved successfully", {
        steps: steps.map((step) => ({
          id: step.id,
          name: step.name,
          description: step.description,
          resourceLinks: step.resourceLinks,
          order: step.order,
          path: step.path,
          completedBy: step.completedBy,
          completionCount: step.completionCount,
          createdAt: step.createdAt,
          updatedAt: step.updatedAt,
        })),
        total: steps.length,
      });
    } catch (error: any) {
      if (error.message === "Invalid user ID") {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
        return;
      }

      sendErrorResponse(
        res,
        "Failed to fetch completed steps",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get user progress for a specific path
   * GET /api/users/:userId/progress?pathId=xxx
   */
  static async getUserProgress(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const { pathId } = req.query;

      if (!req.user) {
        sendErrorResponse(
          res,
          "User not authenticated",
          HTTP_STATUS.UNAUTHORIZED
        );
        return;
      }

      // Users can only view their own progress
      if (req.user.id !== userId) {
        sendErrorResponse(
          res,
          "You can only view your own progress",
          HTTP_STATUS.FORBIDDEN
        );
        return;
      }

      if (!pathId || typeof pathId !== "string") {
        sendErrorResponse(res, "Path ID is required", HTTP_STATUS.BAD_REQUEST);
        return;
      }

      const progress = await StepService.getUserProgress(userId, pathId);

      sendSuccessResponse(res, "User progress retrieved successfully", {
        progress,
      });
    } catch (error: any) {
      // Handle specific errors
      if (error.message === "No steps found for this path") {
        sendErrorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
        return;
      }

      if (error.message === "Invalid user or path ID") {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
        return;
      }

      sendErrorResponse(
        res,
        "Failed to get user progress",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get step completion statistics
   * GET /api/steps/:id/stats
   */
  static async getStepCompletionStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const stats = await StepService.getStepCompletionStats(id);

      sendSuccessResponse(
        res,
        "Step completion statistics retrieved successfully",
        {
          stats,
        }
      );
    } catch (error: any) {
      // Handle specific errors
      if (error.message === "Step not found") {
        sendErrorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
        return;
      }

      if (error.message === "Invalid step ID") {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
        return;
      }

      sendErrorResponse(
        res,
        "Failed to get completion statistics",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default StepController;
