// WhatsAppTemplateForm.jsx - Form for WhatsApp template-based messages
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, RefreshCw, Calendar, Clock } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { useForm, Controller, useWatch } from "react-hook-form";

const WhatsAppTemplateForm = ({
  students,
  notificationType,
  onBack,
  onSuccess,
  onError,
}) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [templatePreviews, setTemplatePreviews] = useState([]);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      templateId: "",
      variables: {},
    },
  });

  // Watch for selected template and variables for preview
  const watchedValues = useWatch({ control });

  // Fetch WhatsApp templates based on notification type
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // This would be replaced with your actual API endpoint
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_API_URL}/faculty/notifications/whatsapp-templates/${notificationType}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("userCookie")}`,
            },
          }
        );

        // Transform the data to match the expected format
        const formattedTemplates = response.data.map((template) => {
          // Create arrays to store header and body variables separately
          const headerVariables = template.variableMapping?.header || [];
          const bodyVariables = template.variableMapping?.body || [];

          // Create a combined array of all variables (for UI display)
          // Make sure each variable is unique in the combined array
          const allVariables = [];
          const variableIndices = {};

          // Process header variables first
          headerVariables.forEach((variable) => {
            if (!variableIndices.hasOwnProperty(variable)) {
              variableIndices[variable] = allVariables.length;
              allVariables.push({
                name: variable,
                section: "header",
                formType: getFormType(variable),
              });
            }
          });

          // Then process body variables
          bodyVariables.forEach((variable) => {
            if (!variableIndices.hasOwnProperty(variable)) {
              variableIndices[variable] = allVariables.length;
              allVariables.push({
                name: variable,
                section: "body",
                formType: getFormType(variable),
              });
            }
          });

          // Create position mappings for easy lookup
          const headerPositions = {};
          headerVariables.forEach((variable, index) => {
            headerPositions[index + 1] = {
              variable,
              index: variableIndices[variable],
            };
          });

          const bodyPositions = {};
          bodyVariables.forEach((variable, index) => {
            bodyPositions[index + 1] = {
              variable,
              index: variableIndices[variable],
            };
          });

          return {
            ...template,
            variables: allVariables,
            headerPositions,
            bodyPositions,
          };
        });

        setTemplates(formattedTemplates);
        // Generate previews for all templates
        generateTemplatePreviews(formattedTemplates);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch WhatsApp templates:", error);
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [notificationType]);

  // Helper function to determine form field type based on variable name
  const getFormType = (variable) => {
    if (variable === "Deadline" || variable.includes("Deadline")) {
      return "date";
    } else if (variable === "Time" || variable.includes("Time")) {
      return "time";
    } else {
      return "text";
    }
  };

  // Generate previews for all templates
  const generateTemplatePreviews = (templates) => {
    const previews = templates.map((template) => {
      let previewContent = "";

      if (template.header) {
        previewContent += `*${template.header}*\n\n`;
      }

      if (template.body) {
        previewContent += `${template.body}\n\n`;
      }

      if (template.footer) {
        previewContent += `_${template.footer}_`;
      }

      if (template.content) {
        previewContent = template.content;
      }

      return {
        id: template.id,
        content: previewContent,
      };
    });

    setTemplatePreviews(previews);
  };

  // Handle template selection
  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    setValue("templateId", templateId);

    // Reset variables when template changes
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      // Clear existing variables
      setValue("variables", {});

      // Initialize variables with empty values
      template.variables.forEach((variable, index) => {
        const variableKey = `var_${index}`;

        if (variable.formType === "date") {
          setValue(`variables.${variableKey}`, "");
        } else if (variable.formType === "time") {
          setValue(`variables.${variableKey}_hours`, "");
          setValue(`variables.${variableKey}_minutes`, "");
          setValue(`variables.${variableKey}_period`, "AM");
        } else {
          setValue(`variables.${variableKey}`, "");
        }
      });
    }
  };

  // Format time value to ensure it's valid
  const formatTimeValue = (value, max) => {
    let numValue = parseInt(value, 10);
    if (isNaN(numValue)) return "";
    if (numValue < 0) return "0";
    if (numValue > max) return max.toString();
    return numValue.toString();
  };

  // Format minutes to ensure it's two digits
  const formatMinutes = (value) => {
    const formattedValue = formatTimeValue(value, 59);
    return formattedValue.padStart(2, "0");
  };

  // Generate preview with inserted variables
  const generatePreview = (values) => {
    if (!selectedTemplate) return "";

    const currentTemplate = templates.find((t) => t.id === selectedTemplate);
    if (!currentTemplate) return "";

    let preview = "";

    // Build header with variables
    if (currentTemplate.header) {
      let header = currentTemplate.header;

      // Replace header placeholders with variable values
      for (const position in currentTemplate.headerPositions) {
        const { index } = currentTemplate.headerPositions[position];
        const variableKey = `var_${index}`;
        const variableObj = currentTemplate.variables[index];

        let value = "(placeholder)";

        if (variableObj.formType === "date") {
          value = values.variables?.[variableKey] || "(date)";
        } else if (variableObj.formType === "time") {
          const hours = values.variables?.[`${variableKey}_hours`] || "";
          const minutes = values.variables?.[`${variableKey}_minutes`] || "";
          const period = values.variables?.[`${variableKey}_period`] || "AM";

          value = hours && minutes ? `${hours}:${minutes} ${period}` : "(time)";
        } else {
          value = values.variables?.[variableKey] || `(${variableObj.name})`;
        }

        header = header.replace(`{{${position}}}`, value);
      }

      preview += `*${header}*\n\n`;
    }

    // Build body with variables
    if (currentTemplate.body) {
      let body = currentTemplate.body;

      // Replace body placeholders with variable values
      for (const position in currentTemplate.bodyPositions) {
        const { index } = currentTemplate.bodyPositions[position];
        const variableKey = `var_${index}`;
        const variableObj = currentTemplate.variables[index];

        let value = "(placeholder)";

        if (variableObj.formType === "date") {
          value = values.variables?.[variableKey] || "(date)";
        } else if (variableObj.formType === "time") {
          const hours = values.variables?.[`${variableKey}_hours`] || "";
          const minutes = values.variables?.[`${variableKey}_minutes`] || "";
          const period = values.variables?.[`${variableKey}_period`] || "AM";

          value = hours && minutes ? `${hours}:${minutes} ${period}` : "(time)";
        } else {
          value = values.variables?.[variableKey] || `(${variableObj.name})`;
        }

        body = body.replace(`{{${position}}}`, value);
      }

      preview += `${body}\n\n`;
    }

    if (currentTemplate.footer) {
      preview += `_${currentTemplate.footer}_`;
    }

    if (currentTemplate.content) {
      preview = currentTemplate.content;
    }

    return preview;
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setSending(true);

    try {
      // Format the variables for API submission
      const formattedVariables = {
        header: {},
        body: {},
      };
      const currentTemplate = templates.find((t) => t.id === data.templateId);

      if (currentTemplate) {
        // Process header positions
        for (const position in currentTemplate.headerPositions) {
          const { index } = currentTemplate.headerPositions[position];
          const variableKey = `var_${index}`;
          const variableObj = currentTemplate.variables[index];

          let value;
          if (variableObj.formType === "date") {
            value = data.variables[variableKey];
          } else if (variableObj.formType === "time") {
            value = `${data.variables[`${variableKey}_hours`]}:${
              data.variables[`${variableKey}_minutes`]
            } ${data.variables[`${variableKey}_period`]}`;
          } else {
            value = data.variables[variableKey];
          }

          // Store in header object with position as key
          formattedVariables.header[position] = value;
        }

        // Process body positions
        for (const position in currentTemplate.bodyPositions) {
          const { index } = currentTemplate.bodyPositions[position];
          const variableKey = `var_${index}`;
          const variableObj = currentTemplate.variables[index];

          let value;
          if (variableObj.formType === "date") {
            value = data.variables[variableKey];
          } else if (variableObj.formType === "time") {
            value = `${data.variables[`${variableKey}_hours`]}:${
              data.variables[`${variableKey}_minutes`]
            } ${data.variables[`${variableKey}_period`]}`;
          } else {
            value = data.variables[variableKey];
          }

          // Store in body object with position as key
          formattedVariables.body[position] = value;
        }
      }

      await axios.post(
        `${process.env.REACT_APP_SERVER_API_URL}/faculty/notifications/send-whatsapp`,
        {
          studentIds: students,
          templateId: data.templateId,
          variables: formattedVariables,
          notificationType,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("userCookie")}`,
          },
        }
      );

      onSuccess();
      setSelectedTemplate("");
      reset();
    } catch (error) {
      onError();
      console.error("Failed to send WhatsApp notification:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select WhatsApp Template
        </label>
        <Controller
          name="templateId"
          control={control}
          rules={{ required: "Please select a template" }}
          render={({ field }) => (
            <select
              {...field}
              onChange={(e) => {
                field.onChange(e);
                handleTemplateChange(e.target.value);
              }}
              className={`w-full px-4 py-2 border ${
                errors.templateId ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          )}
        />
        {errors.templateId && (
          <p className="mt-1 text-sm text-red-600">
            {errors.templateId.message}
          </p>
        )}
      </div>

      {/* Template preview cards */}
      {!selectedTemplate && templates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <h4 className="col-span-full text-md font-medium text-gray-700 mb-2">
            Available Templates:
          </h4>
          {templates.map((template) => {
            const preview =
              templatePreviews.find((p) => p.id === template.id)?.content || "";
            return (
              <div
                key={template.id}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all"
                onClick={() => handleTemplateChange(template.id)}
              >
                <h5 className="font-medium text-indigo-600 mb-2">
                  {template.name}
                </h5>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-line">
                  {preview}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTemplate && (
        <>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">
              Template Preview:
            </h4>
            <p className="text-gray-600 whitespace-pre-line">
              {generatePreview(watchedValues)}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Template Variables:</h4>
            {templates
              .find((t) => t.id === selectedTemplate)
              ?.variables.map((variable, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {variable.name}{" "}
                    {variable.section === "header" ? "(Header)" : "(Body)"}
                  </label>

                  {variable.formType === "date" ? (
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                      <Controller
                        name={`variables.var_${index}`}
                        control={control}
                        rules={{ required: "Date is required" }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="date"
                            className={`w-full px-4 py-2 border ${
                              errors.variables?.[`var_${index}`]
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                          />
                        )}
                      />
                    </div>
                  ) : variable.formType === "time" ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <Controller
                          name={`variables.var_${index}_hours`}
                          control={control}
                          rules={{
                            required: "Hours required",
                            min: { value: 1, message: "Min 1" },
                            max: { value: 12, message: "Max 12" },
                          }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="number"
                              min="1"
                              max="12"
                              placeholder="Hour"
                              onChange={(e) => {
                                const value = formatTimeValue(
                                  e.target.value,
                                  12
                                );
                                field.onChange(value);
                              }}
                              className={`w-20 px-3 py-2 border ${
                                errors.variables?.[`var_${index}_hours`]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                            />
                          )}
                        />
                        <span className="text-gray-500">:</span>
                        <Controller
                          name={`variables.var_${index}_minutes`}
                          control={control}
                          rules={{
                            required: "Minutes required",
                            min: { value: 0, message: "Min 0" },
                            max: { value: 59, message: "Max 59" },
                          }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="number"
                              min="0"
                              max="59"
                              placeholder="Min"
                              onChange={(e) => {
                                const value = formatMinutes(e.target.value);
                                field.onChange(value);
                              }}
                              className={`w-20 px-3 py-2 border ${
                                errors.variables?.[`var_${index}_minutes`]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                            />
                          )}
                        />
                      </div>
                      <div className="w-full sm:w-28">
                        <Controller
                          name={`variables.var_${index}_period`}
                          control={control}
                          defaultValue="AM"
                          render={({ field }) => (
                            <select
                              {...field}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          )}
                        />
                      </div>
                    </div>
                  ) : (
                    <Controller
                      name={`variables.var_${index}`}
                      control={control}
                      rules={{ required: "This field is required" }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className={`w-full px-4 py-2 border ${
                            errors.variables?.[`var_${index}`]
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                        />
                      )}
                    />
                  )}
                  {errors.variables?.[`var_${index}`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.variables[`var_${index}`].message}
                    </p>
                  )}
                  {errors.variables?.[`var_${index}_hours`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.variables[`var_${index}_hours`].message}
                    </p>
                  )}
                  {errors.variables?.[`var_${index}_minutes`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.variables[`var_${index}_minutes`].message}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {students.length} recipient{students.length !== 1 ? "s" : ""}
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={sending || !selectedTemplate}
            className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
              sending || !selectedTemplate
                ? "bg-gray-400"
                : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:shadow-lg"
            }`}
          >
            <Send className="w-4 h-4" />
            {sending ? "Sending..." : "Send WhatsApp"}
          </motion.button>
        </div>
      </div>
    </form>
  );
};

export default WhatsAppTemplateForm;
