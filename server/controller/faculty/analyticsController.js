const AnalyticsConfig = require("../../models/AnalyticsConfig");
const Student = require("../../models/Student");

exports.getAllAnalytics = async (req, res) => {
  try {
    const configs = await AnalyticsConfig.find({ faculty: req.faculty._id });
    res.json(configs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching analytics data" });
  }
};

exports.createAnalytics = async (req, res) => {
  try {
    const config = new AnalyticsConfig({
      ...req.body,
      faculty: req.faculty._id,
      university: req.faculty.university,
    });
    await config.save();
    res.status(201).json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating analytics" });
  }
};

exports.getAnalyticsOnConfiguration = async (req, res) => {
  try {
    const config = await AnalyticsConfig.findById(req.params.configId);
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    const { field, aggregation } = config.configuration.dataSource;
    const pipeline = [];

    // Match documents for the university
    pipeline.push({
      $match: { university: config.university },
    });

    // Apply filters if any
    if (
      config.configuration.filters &&
      config.configuration.filters.length > 0
    ) {
      const filterConditions = config.configuration.filters.map((filter) => {
        const condition = {};
        switch (filter.operator) {
          case "equals":
            condition[filter.field] = filter.value;
            break;
          case "gt":
            condition[filter.field] = { $gt: filter.value };
            break;
          case "lt":
            condition[filter.field] = { $lt: filter.value };
            break;
          case "contains":
            condition[filter.field] = { $regex: filter.value, $options: "i" };
            break;
          case "between":
            condition[filter.field] = {
              $gte: filter.value[0],
              $lte: filter.value[1],
            };
            break;
        }
        return condition;
      });
      pipeline.push({ $match: { $and: filterConditions } });
    }

    // Group by field if specified
    if (config.configuration.groupBy) {
      pipeline.push({
        $group: {
          _id: `$${config.configuration.groupBy}`,
          value: {
            $cond: {
              if: { $eq: [aggregation, "count"] },
              then: { $sum: 1 },
              else: {
                $cond: {
                  if: { $eq: [aggregation, "average"] },
                  then: { $avg: `$${field}` },
                  else: {
                    $cond: {
                      if: { $eq: [aggregation, "sum"] },
                      then: { $sum: `$${field}` },
                      else: {
                        $cond: {
                          if: { $eq: [aggregation, "min"] },
                          then: { $min: `$${field}` },
                          else: { $max: `$${field}` },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    // Sort if specified
    if (config.configuration.sortBy) {
      pipeline.push({
        $sort: {
          [config.configuration.sortBy.field]:
            config.configuration.sortBy.order === "asc" ? 1 : -1,
        },
      });
    }

    const data = await Student.aggregate(pipeline);
    res.json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching analytics data on configuration" });
  }
};

exports.deleteAnalytics = async (req, res) => {
  try {
    await AnalyticsConfig.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting analytics" });
  }
};
