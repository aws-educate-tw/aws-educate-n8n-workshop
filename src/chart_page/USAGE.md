# Dynamic Chart Report Page Usage Guide

This document will guide you on how to use this dynamic chart reporting system to generate custom data dashboards.

## Overview

This system includes an HTML page (`chart.html`) that can dynamically render multiple charts based on the data provided in the URL. To facilitate the generation of URLs containing the data, we provide a shell script (`generate_url.sh`).

## Usage Steps

### 1. Prepare Your Chart Data (JSON file)

First, you need to create a `.json` file to define the charts you want to display. The file format is as follows:

- `pageTitle`: (string) The title displayed at the top of the dashboard.
- `charts`: (array) An array of chart objects.

Each chart object contains the following fields:

- `type`: (string) The chart type. Supported types are `line`, `bar`, `pie`, `doughnut`.
- `title`: (string) The title displayed above the chart.
- `labels`: (array of strings) The X-axis labels for the chart or labels for each section.
- `data`: (array of numbers) The numerical values corresponding to the `labels`.

**Example (`data-multi-charts.json`):**

```json
{
  "pageTitle": "Comprehensive Data Dashboard",
  "charts": [
    {
      "type": "line",
      "title": "Website Traffic Trend (Last 7 Days)",
      "labels": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "data": [1200, 1500, 1300, 1800, 2100, 2500, 2300]
    },
    {
      "type": "pie",
      "title": "User Device Distribution",
      "labels": ["Desktop", "Mobile", "Tablet"],
      "data": [55, 35, 10]
    },
    {
      "type": "bar",
      "title": "Sales by Region (in millions)",
      "labels": ["North", "Central", "South", "East"],
      "data": [15, 25, 20, 13]
    },
    {
      "type": "doughnut",
      "title": "Product Category Share",
      "labels": ["Electronics", "Apparel", "Books", "Home Goods"],
      "data": [40, 25, 15, 20]
    }
  ]
}
```

### 2. Generate the Chart URL

Once your JSON file is ready, `cd` into the `src/chart_page` directory in your terminal, then execute the `generate_url.sh` script, passing your JSON file as an argument.

```bash
cd src/chart_page
bash generate_url.sh your_data_file.json
```

For example, using the provided sample file:

```bash
bash generate_url.sh data-multi-charts.json
```

### 3. View the Chart in Your Browser

After executing the script, the terminal will output a very long URL. This is your unique dashboard link.

Copy and paste this entire URL into your web browser, and you will see the beautiful charts generated from your data!
