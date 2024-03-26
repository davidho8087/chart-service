export const getLayoutTemplateByChartType = (chartType) => {
    const templates = {
      bar: {
        title: "Bar Chart Example",
        xaxis: { title: "x_label" },
        yaxis: { title: "y_label" },
      },
      line: {
        title: "Line Chart Example",
        xaxis: { title: "x_label" },
        yaxis: { title: "y_label" },
      },
      pie: {
        title: "Pie Chart Example",
      },
      table: {
        title: "Table Example",
      },
    };
  
    return templates[chartType] || templates.bar;
  };
  