import { Request, Response, NextFunction } from "express";
import PathService, {
  CreatePathData,
  UpdatePathData,
} from "../services/path.service";
import User from "../models/user.model";
import { sendSuccessResponse, sendErrorResponse } from "../utils/helpers";
import { HTTP_STATUS } from "../utils/constants";

export class PathController {
  /**
   * Create a new path
   * POST /api/paths
   */
  static async createPath(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title, description, category }: CreatePathData = req.body;

      // Validate required fields
      if (!title || !description || !category) {
        sendErrorResponse(
          res,
          "Title, description, and category are required",
          HTTP_STATUS.BAD_REQUEST
        );
        return;
      }

      // Create path
      const path = await PathService.createPath({
        title,
        description,
        category,
      });

      sendSuccessResponse(
        res,
        "Path created successfully",
        {
          path: {
            id: path.id,
            title: path.title,
            description: path.description,
            category: path.category,
            steps: path.steps,
            stepCount: path.stepCount,
            createdAt: path.createdAt,
            updatedAt: path.updatedAt,
          },
        },
        HTTP_STATUS.CREATED
      );
    } catch (error: any) {
      // Handle specific errors
      if (error.message === "Invalid path data") {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
        return;
      }

      sendErrorResponse(
        res,
        "Failed to create path",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Search and filter paths with advanced options
   * GET /api/paths
   */
  static async searchPaths(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        category,
        difficulty,
        search,
        aiRelevance,
        page = "1",
        limit = "10",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Build filters object
      const filters: any = {};
      if (category) filters.category = category as string;
      if (difficulty) filters.difficulty = difficulty as string;
      if (search) filters.search = search as string;
      if (aiRelevance) filters.aiRelevance = aiRelevance as string;

      // Add user ID for AI-based recommendations if user is authenticated
      if (req.user) {
        filters.userId = req.user.id;
      }

      // Build pagination options
      const paginationOptions = {
        page: parseInt(page as string, 10) || 1,
        limit: Math.min(parseInt(limit as string, 10) || 10, 100), // Max 100 items per page
        sortBy: sortBy as string,
        sortOrder:
          (sortOrder as string) === "asc"
            ? ("asc" as const)
            : ("desc" as const),
      };

      const result = await PathService.searchPaths(filters, paginationOptions);

      sendSuccessResponse(res, "Paths retrieved successfully", {
        paths: result.paths.map((path) => ({
          id: path.id,
          title: path.title,
          description: path.description,
          category: path.category,
          stepCount: path.stepCount,
          steps: path.steps,
          createdAt: path.createdAt,
          updatedAt: path.updatedAt,
        })),
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error: any) {
      sendErrorResponse(
        res,
        "Failed to search paths",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get path by ID
   * GET /api/paths/:id
   */
  static async getPathById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const path = await PathService.getPathById(id);

      sendSuccessResponse(res, "Path retrieved successfully", {
        path: {
          id: path!.id,
          title: path!.title,
          description: path!.description,
          category: path!.category,
          stepCount: path!.stepCount,
          steps: path!.steps,
          createdAt: path!.createdAt,
          updatedAt: path!.updatedAt,
        },
      });
    } catch (error: any) {
      // Handle specific errors
      if (error.message === "Path not found") {
        sendErrorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
        return;
      }

      if (error.message === "Invalid path ID") {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
        return;
      }

      sendErrorResponse(
        res,
        "Failed to fetch path",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update path by ID
   * PUT /api/paths/:id
   */
  static async updatePath(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdatePathData = req.body;

      const path = await PathService.updatePath(id, updateData);

      sendSuccessResponse(res, "Path updated successfully", {
        path: {
          id: path!.id,
          title: path!.title,
          description: path!.description,
          category: path!.category,
          stepCount: path!.stepCount,
          steps: path!.steps,
          createdAt: path!.createdAt,
          updatedAt: path!.updatedAt,
        },
      });
    } catch (error: any) {
      // Handle specific errors
      if (error.message === "Path not found") {
        sendErrorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
        return;
      }

      if (
        error.message === "Invalid path data" ||
        error.message === "Invalid path ID"
      ) {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
        return;
      }

      sendErrorResponse(
        res,
        "Failed to update path",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Delete path by ID
   * DELETE /api/paths/:id
   */
  static async deletePath(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      await PathService.deletePath(id);

      sendSuccessResponse(res, "Path deleted successfully");
    } catch (error: any) {
      // Handle specific errors
      if (error.message === "Path not found") {
        sendErrorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
        return;
      }

      if (error.message === "Invalid path ID") {
        sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
        return;
      }

      sendErrorResponse(
        res,
        "Failed to delete path",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get paths by category
   * GET /api/paths/category/:category
   */
  static async getPathsByCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { category } = req.params;

      const paths = await PathService.getPathsByCategory(category);

      sendSuccessResponse(res, "Paths retrieved successfully", {
        paths: paths.map((path) => ({
          id: path.id,
          title: path.title,
          description: path.description,
          category: path.category,
          stepCount: path.stepCount,
          steps: path.steps,
          createdAt: path.createdAt,
          updatedAt: path.updatedAt,
        })),
        total: paths.length,
      });
    } catch (error: any) {
      sendErrorResponse(
        res,
        "Failed to fetch paths by category",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get path statistics
   * GET /api/paths/stats
   */
  static async getPathStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await PathService.getPathStats();

      sendSuccessResponse(res, "Path statistics retrieved successfully", {
        stats,
      });
    } catch (error: any) {
      sendErrorResponse(
        res,
        "Failed to get path statistics",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default PathController;
