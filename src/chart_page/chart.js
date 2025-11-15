window.myCharts = [];

document.addEventListener("DOMContentLoaded", () => {
    // --- Theme Switcher Logic ---
    const themeSwitcher = document.getElementById("theme-switcher");
    const body = document.body;
    const themeLogo = document.getElementById("theme-logo");

    const applyTheme = (theme) => {
        if (theme === "light") {
            body.classList.add("light-mode");
            if (themeLogo) {
                themeLogo.src = "AWS_Educate_Logo_1C_K.png";
            }
        } else {
            body.classList.remove("light-mode");
            if (themeLogo) {
                themeLogo.src = "AWS_Educate_Logo_1C_W.png";
            }
        }
        localStorage.setItem("chart-theme", theme);

        // Update charts if they exist
        if (window.myCharts.length > 0) {
            const newLegendColor = theme === "light" ? "#232f3e" : "#d5dbdb";
            const newBorderColor = theme === "light" ? "#ffffff" : "#2E3D4F";
            window.myCharts.forEach((chart) => {
                chart.options.plugins.legend.labels.color = newLegendColor;
                if (chart.config.type !== "line") {
                    chart.data.datasets[0].borderColor = newBorderColor;
                }
                chart.update("none"); // 'none' prevents animation on theme change
            });
        }
    };

    themeSwitcher.addEventListener("click", () => {
        const currentTheme = body.classList.contains("light-mode") ?
            "light" :
            "dark";
        const newTheme = currentTheme === "light" ? "dark" : "light";
        applyTheme(newTheme);
    });

    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem("chart-theme");
    const prefersLight = window.matchMedia(
        "(prefers-color-scheme: light)"
    ).matches;
    const initialTheme = savedTheme || (prefersLight ? "light" : "dark");
    applyTheme(initialTheme);
    // --- End of Theme Switcher Logic ---

    const params = new URLSearchParams(window.location.search);
    let dataParam = params.get("data");

    if (!dataParam) {
        document.getElementById("report-title").textContent =
            "錯誤：未提供圖表資料";
        return; // This is now OK, as theme switcher is already initialized
    }

    try {
        const decodedData = JSON.parse(decodeURIComponent(atob(dataParam)));
        if (decodedData.pageTitle) {
            document.getElementById("report-title").textContent =
                decodedData.pageTitle;
        }
        const chartGrid = document.getElementById("chart-grid");
        decodedData.charts.forEach((chartConfig, index) => {
            const card = document.createElement("div");
            card.className = "card";
            card.style.animationDelay = `${index * 0.15}s`;
            const canvasId = `myChart-${index}`;
            card.innerHTML = `
        <div class="header"><h2>${
          chartConfig.title || "未命名圖表"
        }</h2></div>
        <div class="chart-container"><canvas id="${canvasId}"></canvas></div>
        <div class="footer">
          <button class="download-btn" data-canvas-id="${canvasId}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>下載 (PNG)</span>
          </button>
        </div>`;
            chartGrid.appendChild(card);
            renderChart(canvasId, chartConfig);
        });
        document.querySelectorAll(".download-btn").forEach((button) => {
            button.addEventListener("click", (event) => {
                const canvasId = event.currentTarget.dataset.canvasId;
                const chartInstance = Chart.getChart(canvasId);
                if (chartInstance) {
                    const link = document.createElement("a");
                    link.href = chartInstance.toBase64Image("image/png", 1);
                    link.download = `${
            chartInstance.config.data.datasets[0].label || "chart"
          }-${canvasId}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            });
        });
    } catch (e) {
        console.error("Failed to parse or render charts:", e);
        document.getElementById("report-title").textContent =
            "無法解析圖表資料";
    }
});

function renderChart(canvasId, config) {
    const {
        type,
        labels,
        data,
        title
    } = config;
    const awsColorPalette = [
        "#FF9900",
        "#232F3E",
        "#5A8DFF",
        "#06D6A0",
        "#FFD166",
        "#8338EC",
    ];
    let datasetOptions = {
        label: title || "Dataset",
        data: data,
        borderWidth: 2,
    };
    if (type === "line") {
        datasetOptions.borderColor = awsColorPalette[0];
        datasetOptions.backgroundColor = awsColorPalette[0] + "4D";
        datasetOptions.tension = 0.4;
        datasetOptions.fill = true;
        datasetOptions.pointBackgroundColor = awsColorPalette[0];
    } else {
        datasetOptions.backgroundColor = awsColorPalette;
        datasetOptions.borderColor = document.body.classList.contains(
                "light-mode"
            ) ?
            "#ffffff" :
            "#2E3D4F";
    }
    const ctx = document.getElementById(canvasId).getContext("2d");
    const chart = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [datasetOptions]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: document.body.classList.contains("light-mode") ?
                            "#232f3e" : "#d5dbdb",
                        font: {
                            size: 14,
                            family: "'Noto Sans TC', sans-serif"
                        },
                    },
                },
                tooltip: {
                    backgroundColor: "#111927",
                    titleColor: "white",
                    bodyColor: "white",
                    titleFont: {
                        size: 16,
                        weight: "bold"
                    },
                    bodyFont: {
                        size: 14
                    },
                    cornerRadius: 4,
                    padding: 12,
                },
            },
        },
    });
    window.myCharts.push(chart);
}