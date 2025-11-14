const {
    ChartJSNodeCanvas
} = require('chartjs-node-canvas');
const {
    S3Client,
    PutObjectCommand
} = require('@aws-sdk/client-s3');
const path = require('path');
const {
    Chart
} = require('chart.js');

const width = 400;
const height = 400;
const backgroundColour = 'white';
const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour
});
// Register the font and set it as the default
chartJSNodeCanvas.registerFont(path.resolve(__dirname, 'NotoSansTC-Regular.ttf'), {
    family: 'Noto Sans TC'
});
Chart.defaults.font.family = 'Noto Sans TC';

const s3Client = new S3Client({});

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        const output = (event.queryStringParameters && event.queryStringParameters.output) || 'png';
        const requestBody = JSON.parse(event.body);
        const {
            labels,
            data,
            type
        } = requestBody;

        if (!labels || !data || !Array.isArray(labels) || !Array.isArray(data) || labels.length !== data.length) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid input. "labels" and "data" must be arrays of the same length.'
                }),
            };
        }

        // HTML output mode
        if (output === 'html') {
            const chartPageUrl = process.env.CHART_PAGE_URL;
            const url = new URL(chartPageUrl);
            url.searchParams.append('title', 'Department Distribution');
            url.searchParams.append('type', type || 'pie');
            url.searchParams.append('labels', labels.join('|'));
            url.searchParams.append('data', data.join('|'));

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chartUrl: url.toString()
                }),
            };
        }

        // PNG output mode (default)
        const configuration = {
            type: type || 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Dataset',
                    data: data,
                    backgroundColor: data.map(() => getRandomColor()),
                }],
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Department Distribution'
                    }
                }
            }
        };

        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
        const bucketName = process.env.BUCKET_NAME;
        const region = process.env.AWS_REGION;
        const fileName = `chart-${Date.now()}.png`;

        const putObjectParams = {
            Bucket: bucketName,
            Key: fileName,
            Body: imageBuffer,
            ContentType: 'image/png',
        };

        await s3Client.send(new PutObjectCommand(putObjectParams));
        const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageUrl
            }),
        };

    } catch (error) {
        console.error('Error processing request:', error);
        const isParsingError = error instanceof SyntaxError;
        if (isParsingError) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid JSON format in request body.'
                })
            };
        }
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to process request.',
                error: error.message
            })
        };
    }
};