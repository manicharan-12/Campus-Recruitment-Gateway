const mongoose = require("mongoose");

const analyticsConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true,
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
    required: true,
  },
  configuration: {
    type: {
      type: String,
      enum: ["bar", "pie", "line", "table"],
      required: true,
    },
    dataSource: {
      field: String,
      subField: String,
      aggregation: {
        type: String,
        enum: ["count", "average", "sum", "min", "max"],
      },
    },
    filters: [
      {
        field: String,
        operator: {
          type: String,
          enum: ["equals", "gt", "lt", "contains", "between"],
        },
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    groupBy: String,
    sortBy: {
      field: String,
      order: {
        type: String,
        enum: ["asc", "desc"],
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

const AnalyticsConfig = mongoose.model(
  "AnalyticsConfig",
  analyticsConfigSchema
);
module.exports = AnalyticsConfig;
