import mongoose, { Document, Schema } from "mongoose";

// Step interface
export interface IStep extends Document {
  name: string;
  description: string;
  resourceLinks: string[];
  completedBy: mongoose.Types.ObjectId[];
  order: number;
  path: mongoose.Types.ObjectId;
  completionCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Step schema
const stepSchema = new Schema<IStep>(
  {
    name: {
      type: String,
      required: [true, "Step title is required"],
      trim: true,
      minlength: [2, "Step title must be at least 2 characters long"],
      maxlength: [100, "Step title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Step description is required"],
      trim: true,
      minlength: [10, "Step description must be at least 10 characters long"],
      maxlength: [1000, "Step description cannot exceed 1000 characters"],
    },
    resourceLinks: [
      {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string) {
            // Basic URL validation
            const urlRegex =
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
            return !v || urlRegex.test(v);
          },
          message: "Resource link must be a valid URL",
        },
      },
    ],
    completedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    order: {
      type: Number,
      required: [true, "Step order is required"],
      min: [1, "Step order must be at least 1"],
    },
    path: {
      type: Schema.Types.ObjectId,
      ref: "Path",
      required: [true, "PathId reference is required"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Virtual for completion count
stepSchema.virtual("completionCount").get(function () {
  return this.completedBy.length;
});

// Compound index to ensure unique order within a path
stepSchema.index({ path: 1, order: 1 }, { unique: true });

// Create and export the model
const Step = mongoose.model<IStep>("Step", stepSchema);

export default Step;
