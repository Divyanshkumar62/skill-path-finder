import Step from "../models/step.model";
import Path from "../models/path.model";
import UserService from "./user.service";
import StepService from "./step.service";
import { CustomError } from "../middleware/errorHandler";

export interface AISuggestionInput {
  userId: string;
  pathId: string;
  completedSteps: string[];
}

export interface AISuggestionOutput {
  nextStep: string | null;
  suggestions: string[];
  miniProjects: string[];
  skillGaps: string[];
  personalizedPath: Array<{
    stepId: string;
    name: string;
    order: number;
    priority: "high" | "medium" | "low";
    estimatedTime: string;
  }>;
}

export interface SkillGapAnalysis {
  missingSkills: string[];
  recommendedSteps: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedCompletionTime: string;
}

export interface MiniProject {
  title: string;
  description: string;
  skills: string[];
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  resources: string[];
}

export class AIService {
  /**
   * Generate personalized AI suggestions for a user
   */
  static async generateSuggestions(
    input: AISuggestionInput
  ): Promise<AISuggestionOutput> {
    try {
      // Validate inputs
      const { userId, pathId, completedSteps } = input;

      // Get user profile
      const user = await UserService.findById(userId);
      if (!user) {
        const error = new Error("User not found") as CustomError;
        error.statusCode = 404;
        throw error;
      }

      // Get path with steps
      const path = await Path.findById(pathId).populate({
        path: "steps",
        populate: {
          path: "completedBy",
          select: "name email",
        },
        options: { sort: { order: 1 } },
      });

      if (!path) {
        const error = new Error("Path not found") as CustomError;
        error.statusCode = 404;
        throw error;
      }

      // Analyze user progress
      const progressAnalysis = await this.analyzeUserProgress(
        userId,
        pathId,
        completedSteps
      );

      // Generate skill gap analysis
      const skillGaps = await this.analyzeSkillGaps(progressAnalysis, path);

      // Generate personalized suggestions
      const suggestions = await this.generatePersonalizedSuggestions(
        progressAnalysis,
        skillGaps
      );

      // Generate mini-projects
      const miniProjects = await this.generateMiniProjects(
        progressAnalysis,
        skillGaps
      );

      // Create personalized learning path
      const personalizedPath = await this.createPersonalizedPath(
        path,
        completedSteps,
        progressAnalysis
      );

      return {
        nextStep: personalizedPath.length > 0 ? personalizedPath[0].name : null,
        suggestions,
        miniProjects: miniProjects.map((p) => p.title),
        skillGaps: skillGaps.missingSkills,
        personalizedPath,
      };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }

      const customError = new Error(
        "Failed to generate AI suggestions"
      ) as CustomError;
      customError.statusCode = 500;
      throw customError;
    }
  }

  /**
   * Analyze user progress in a learning path
   */
  private static async analyzeUserProgress(
    userId: string,
    pathId: string,
    completedSteps: string[]
  ): Promise<{
    completedCount: number;
    totalSteps: number;
    completionRate: number;
    averageTimePerStep: number;
    learningPattern: "fast" | "steady" | "slow";
    strengths: string[];
    weaknesses: string[];
  }> {
    try {
      // Get all steps in the path
      const steps = await Step.find({ path: pathId }).sort({ order: 1 });

      const totalSteps = steps.length;
      const completedCount = completedSteps.length;
      const completionRate =
        totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

      // Analyze learning pattern based on completion rate and time
      let learningPattern: "fast" | "steady" | "slow" = "steady";
      if (completionRate > 70) {
        learningPattern = "fast";
      } else if (completionRate < 30) {
        learningPattern = "slow";
      }

      // Identify strengths and weaknesses based on step categories
      const strengths: string[] = [];
      const weaknesses: string[] = [];

      // This would be enhanced with actual step categorization
      if (completionRate > 50) {
        strengths.push("Good progress rate");
      } else {
        weaknesses.push("Needs to maintain consistent progress");
      }

      return {
        completedCount,
        totalSteps,
        completionRate,
        averageTimePerStep: 45, // Placeholder - would be calculated from actual data
        learningPattern,
        strengths,
        weaknesses,
      };
    } catch (error) {
      throw new Error("Failed to analyze user progress");
    }
  }

  /**
   * Analyze skill gaps based on user progress
   */
  private static async analyzeSkillGaps(
    progressAnalysis: any,
    path: any
  ): Promise<SkillGapAnalysis> {
    try {
      const missingSkills: string[] = [];
      const recommendedSteps: string[] = [];

      // Analyze based on completion patterns
      if (progressAnalysis.completionRate < 50) {
        missingSkills.push("Consistent learning habits");
        recommendedSteps.push("Review foundational concepts");
      }

      if (progressAnalysis.learningPattern === "slow") {
        missingSkills.push("Time management skills");
        recommendedSteps.push("Break down complex topics into smaller tasks");
      }

      // Add path-specific skill gaps
      if (
        path.category === "web-development" &&
        progressAnalysis.completionRate < 60
      ) {
        missingSkills.push("HTML/CSS fundamentals");
        recommendedSteps.push("Complete basic web development projects");
      }

      const difficulty: "beginner" | "intermediate" | "advanced" =
        progressAnalysis.completionRate < 30
          ? "beginner"
          : progressAnalysis.completionRate < 70
          ? "intermediate"
          : "advanced";

      const estimatedCompletionTime =
        difficulty === "beginner"
          ? "2-3 weeks"
          : difficulty === "intermediate"
          ? "1-2 weeks"
          : "3-5 days";

      return {
        missingSkills,
        recommendedSteps,
        difficulty,
        estimatedCompletionTime,
      };
    } catch (error) {
      throw new Error("Failed to analyze skill gaps");
    }
  }

  /**
   * Generate personalized suggestions
   */
  private static async generatePersonalizedSuggestions(
    progressAnalysis: any,
    skillGaps: SkillGapAnalysis
  ): Promise<string[]> {
    try {
      const suggestions: string[] = [];

      // Base suggestions on progress analysis
      if (progressAnalysis.learningPattern === "fast") {
        suggestions.push(
          "You're progressing quickly! Consider taking on more challenging projects."
        );
        suggestions.push("Share your knowledge with others in the community.");
      } else if (progressAnalysis.learningPattern === "slow") {
        suggestions.push(
          "Take breaks between learning sessions to avoid burnout."
        );
        suggestions.push("Consider pairing with a study buddy for motivation.");
      }

      // Add skill gap based suggestions
      skillGaps.missingSkills.forEach((skill) => {
        suggestions.push(`Focus on improving your ${skill.toLowerCase()}.`);
      });

      // Add general learning tips
      suggestions.push("Practice regularly with small, consistent sessions.");
      suggestions.push("Apply what you learn by building real projects.");
      suggestions.push("Join online communities for support and networking.");

      return suggestions;
    } catch (error) {
      throw new Error("Failed to generate personalized suggestions");
    }
  }

  /**
   * Generate mini-projects based on user progress
   */
  private static async generateMiniProjects(
    progressAnalysis: any,
    skillGaps: SkillGapAnalysis
  ): Promise<MiniProject[]> {
    try {
      const projects: MiniProject[] = [];

      // Generate projects based on skill gaps and progress
      if (skillGaps.missingSkills.includes("HTML/CSS fundamentals")) {
        projects.push({
          title: "Personal Portfolio Website",
          description:
            "Create a responsive portfolio website showcasing your projects",
          skills: ["HTML", "CSS", "Responsive Design"],
          difficulty: "medium",
          estimatedTime: "1 week",
          resources: [
            "https://developer.mozilla.org/en-US/docs/Web/HTML",
            "https://developer.mozilla.org/en-US/docs/Web/CSS",
          ],
        });
      }

      if (skillGaps.missingSkills.includes("Time management skills")) {
        projects.push({
          title: "Learning Tracker App",
          description:
            "Build an app to track your learning progress and time management",
          skills: ["JavaScript", "Local Storage", "Time Management"],
          difficulty: "hard",
          estimatedTime: "2 weeks",
          resources: [
            "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
            "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
          ],
        });
      }

      // Add general projects based on progress
      if (progressAnalysis.completionRate > 50) {
        projects.push({
          title: "Code Review Tool",
          description: "Create a tool to help review and improve code quality",
          skills: ["Code Analysis", "Best Practices", "Feedback"],
          difficulty: "hard",
          estimatedTime: "3 weeks",
          resources: ["https://github.com/", "https://stackoverflow.com/"],
        });
      }

      return projects;
    } catch (error) {
      throw new Error("Failed to generate mini-projects");
    }
  }

  /**
   * Create personalized learning path
   */
  private static async createPersonalizedPath(
    path: any,
    completedSteps: string[],
    progressAnalysis: any
  ): Promise<
    Array<{
      stepId: string;
      name: string;
      order: number;
      priority: "high" | "medium" | "low";
      estimatedTime: string;
    }>
  > {
    try {
      const personalizedPath: Array<{
        stepId: string;
        name: string;
        order: number;
        priority: "high" | "medium" | "low";
        estimatedTime: string;
      }> = [];

      // Get remaining steps
      const remainingSteps = path.steps.filter(
        (step: any) => !completedSteps.includes(step._id.toString())
      );

      // Prioritize steps based on progress analysis
      remainingSteps.forEach((step: any, index: number) => {
        let priority: "high" | "medium" | "low" = "medium";
        let estimatedTime = "45 minutes";

        // Adjust priority based on learning pattern
        if (progressAnalysis.learningPattern === "fast" && index < 2) {
          priority = "high";
          estimatedTime = "30 minutes";
        } else if (progressAnalysis.learningPattern === "slow" && index < 1) {
          priority = "high";
          estimatedTime = "60 minutes";
        }

        personalizedPath.push({
          stepId: step._id.toString(),
          name: step.title,
          order: step.order,
          priority,
          estimatedTime,
        });
      });

      // Sort by priority and order
      personalizedPath.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.order - b.order;
      });

      return personalizedPath;
    } catch (error) {
      throw new Error("Failed to create personalized path");
    }
  }

  /**
   * Get learning analytics for a user
   */
  static async getLearningAnalytics(userId: string): Promise<{
    totalPaths: number;
    completedSteps: number;
    averageCompletionRate: number;
    learningStreak: number;
    favoriteCategories: string[];
    recentActivity: Array<{
      pathTitle: string;
      stepName: string;
      completedAt: Date;
    }>;
  }> {
    try {
      // Get user's completed steps
      const completedSteps = await Step.find({ completedBy: userId })
        .populate("path", "title category")
        .sort({ updatedAt: -1 });

      // Calculate analytics
      const totalPaths = new Set(
        completedSteps.map((step) => (step as any).path._id.toString())
      ).size;
      const completedCount = completedSteps.length;

      // Get favorite categories
      const categoryCount: Record<string, number> = {};
      completedSteps.forEach((step) => {
        const category = (step as any).path.category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const favoriteCategories = Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

      // Recent activity (last 10 completed steps)
      const recentActivity = completedSteps.slice(0, 10).map((step) => ({
        pathTitle: (step as any).path.title,
        stepName: step.name,
        completedAt: step.updatedAt,
      }));

      return {
        totalPaths,
        completedSteps: completedCount,
        averageCompletionRate: 75, // Placeholder - would be calculated from actual data
        learningStreak: 5, // Placeholder - would be calculated from actual data
        favoriteCategories,
        recentActivity,
      };
    } catch (error) {
      const customError = new Error(
        "Failed to get learning analytics"
      ) as CustomError;
      customError.statusCode = 500;
      throw customError;
    }
  }
}

export default AIService;
